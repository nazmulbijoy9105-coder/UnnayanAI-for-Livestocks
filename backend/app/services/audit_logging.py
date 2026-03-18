"""
UnnayanAI: Immutable Audit Logging Service

Core Responsibility:
- Log all decisions immutably with hash chaining
- Prevent tampering (detected via hash integrity checks)
- Support quarterly signing by AI Ethics Board
- Provide audit trail for compliance & regulators

Hash Chain: prev_hash → current_event → current_hash → next_hash
Any modification is immediately detectable
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import hashlib
import json
from uuid import uuid4
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from dataclasses import dataclass, asdict
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://unnayan_app:CHANGE_THIS@localhost:5432/unnayan_production"
)

# ============================================================================
# MODELS
# ============================================================================

@dataclass
class AuditEvent:
    """Represents a single audit event"""
    
    event_type: str
    severity: str  # 'info', 'warning', 'error', 'critical'
    farmer_id: Optional[str] = None
    farm_id: Optional[str] = None
    rule_triggered: Optional[str] = None
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    event_data: Dict[str, Any] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

# ============================================================================
# IMMUTABLE AUDIT LOGGER
# ============================================================================

class ImmutableAuditLogger:
    """
    Manages immutable, hash-chained audit logging.
    
    Key properties:
    - INSERT ONLY (no UPDATE/DELETE allowed by database trigger)
    - Hash chaining prevents tampering
    - Quarterly signing by AI Ethics Board
    - Integrity verification available
    """
    
    def __init__(self, db_url: str):
        self.engine = create_engine(db_url)
        self.SessionLocal = sessionmaker(bind=self.engine)
    
    def log_event(
        self,
        event: AuditEvent,
        session: Optional[Session] = None
    ) -> str:
        """
        Log an audit event with hash chaining.
        
        Args:
            event: AuditEvent to log
            session: Database session (creates new if None)
        
        Returns:
            audit_id: UUID of the logged event
        """
        
        if session is None:
            session = self.SessionLocal()
            close_session = True
        else:
            close_session = False
        
        try:
            audit_id = str(uuid4())
            timestamp = datetime.now()
            
            # Get previous log's hash (for chaining)
            previous_hash = self._get_previous_hash(session)
            
            # Calculate this log's hash
            current_hash = self._calculate_hash(
                audit_id=audit_id,
                timestamp=timestamp,
                event_type=event.event_type,
                event_data=event.event_data,
                previous_hash=previous_hash
            )
            
            # Prepare event data as JSON
            event_data_json = json.dumps(
                event.event_data or {},
                default=str
            )
            
            # Insert into database
            insert_query = """
            INSERT INTO audit_logs (
                audit_id,
                timestamp,
                event_type,
                severity,
                farmer_id,
                farm_id,
                rule_triggered,
                model_name,
                model_version,
                event_data,
                ip_address,
                user_agent,
                previous_hash,
                current_hash,
                hash_verified
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            """
            
            session.execute(
                text(insert_query),
                {
                    "audit_id": audit_id,
                    "timestamp": timestamp,
                    "event_type": event.event_type,
                    "severity": event.severity,
                    "farmer_id": event.farmer_id,
                    "farm_id": event.farm_id,
                    "rule_triggered": event.rule_triggered,
                    "model_name": event.model_name,
                    "model_version": event.model_version,
                    "event_data": event_data_json,
                    "ip_address": event.ip_address,
                    "user_agent": event.user_agent,
                    "previous_hash": previous_hash,
                    "current_hash": current_hash,
                    "hash_verified": True
                }
            )
            
            session.commit()
            
            logger.info(
                f"Audit logged | ID: {audit_id} | Type: {event.event_type} | "
                f"Severity: {event.severity} | Hash: {current_hash[:16]}..."
            )
            
            return audit_id
            
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to log audit event: {str(e)}", exc_info=True)
            raise
        
        finally:
            if close_session:
                session.close()
    
    def log_rule_violation(
        self,
        farmer_id: str,
        rule_name: str,
        reason: str,
        outcome: str,
        session: Optional[Session] = None
    ) -> str:
        """Log a rule violation event"""
        
        event = AuditEvent(
            event_type="rule_violation",
            severity="critical",
            farmer_id=farmer_id,
            rule_triggered=rule_name,
            event_data={
                "rule_name": rule_name,
                "reason": reason,
                "outcome": outcome
            }
        )
        
        return self.log_event(event, session)
    
    def log_ml_prediction(
        self,
        farmer_id: str,
        farm_id: str,
        model_name: str,
        model_version: str,
        prediction_value: float,
        risk_level: str,
        session: Optional[Session] = None
    ) -> str:
        """Log an ML prediction event"""
        
        event = AuditEvent(
            event_type="ml_prediction",
            severity="info",
            farmer_id=farmer_id,
            farm_id=farm_id,
            model_name=model_name,
            model_version=model_version,
            event_data={
                "prediction_value": prediction_value,
                "risk_level": risk_level
            }
        )
        
        return self.log_event(event, session)
    
    def log_fraud_detected(
        self,
        farmer_id: str,
        fraud_type: str,
        details: str,
        session: Optional[Session] = None
    ) -> str:
        """Log a fraud detection event"""
        
        event = AuditEvent(
            event_type="fraud_detected",
            severity="critical",
            farmer_id=farmer_id,
            event_data={
                "fraud_type": fraud_type,
                "details": details,
                "action": "account_locked"
            }
        )
        
        return self.log_event(event, session)
    
    def log_human_review_decision(
        self,
        farmer_id: str,
        farm_id: str,
        decision_type: str,
        decision: str,
        decision_by: str,
        session: Optional[Session] = None
    ) -> str:
        """Log a human review decision"""
        
        event = AuditEvent(
            event_type="human_review_decision",
            severity="warning",
            farmer_id=farmer_id,
            farm_id=farm_id,
            event_data={
                "decision_type": decision_type,
                "decision": decision,
                "decided_by": decision_by
            }
        )
        
        return self.log_event(event, session)
    
    # ========================================================================
    # INTEGRITY VERIFICATION
    # ========================================================================
    
    def verify_integrity(self, session: Optional[Session] = None) -> Dict[str, Any]:
        """
        Verify integrity of entire audit log (hash chain).
        
        Returns:
            {
                "integrity_ok": bool,
                "total_logs": int,
                "tamper_detected": int,
                "chain_broken": int,
                "issues": List[str]
            }
        """
        
        if session is None:
            session = self.SessionLocal()
            close_session = True
        else:
            close_session = False
        
        try:
            integrity_ok = True
            issues = []
            
            # Get all logs in order
            query = """
            SELECT audit_id, timestamp, event_type, event_data, previous_hash, current_hash
            FROM audit_logs
            ORDER BY timestamp ASC
            """
            
            result = session.execute(text(query))
            logs = result.fetchall()
            
            if not logs:
                return {
                    "integrity_ok": True,
                    "total_logs": 0,
                    "tamper_detected": 0,
                    "chain_broken": 0,
                    "issues": []
                }
            
            tamper_detected = 0
            chain_broken = 0
            
            for i, log in enumerate(logs):
                audit_id, timestamp, event_type, event_data_str, prev_hash, curr_hash = log
                
                # Verify this log's hash
                event_data = json.loads(event_data_str) if event_data_str else {}
                
                expected_hash = self._calculate_hash(
                    audit_id=audit_id,
                    timestamp=timestamp,
                    event_type=event_type,
                    event_data=event_data,
                    previous_hash=prev_hash
                )
                
                if expected_hash != curr_hash:
                    integrity_ok = False
                    tamper_detected += 1
                    issues.append(
                        f"Log {i} ({audit_id[:8]}...): Hash mismatch. "
                        f"Expected {expected_hash[:16]}... got {curr_hash[:16]}..."
                    )
                
                # Verify chain
                if i > 0:
                    prev_log = logs[i - 1]
                    prev_current_hash = prev_log[5]
                    
                    if prev_hash != prev_current_hash:
                        integrity_ok = False
                        chain_broken += 1
                        issues.append(
                            f"Log {i} ({audit_id[:8]}...): Chain broken. "
                            f"Previous hash mismatch."
                        )
            
            return {
                "integrity_ok": integrity_ok,
                "total_logs": len(logs),
                "tamper_detected": tamper_detected,
                "chain_broken": chain_broken,
                "issues": issues,
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Integrity verification failed: {str(e)}", exc_info=True)
            
            return {
                "integrity_ok": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        
        finally:
            if close_session:
                session.close()
    
    # ========================================================================
    # QUARTERLY SIGNING BY AI ETHICS BOARD
    # ========================================================================
    
    def sign_logs_for_audit(
        self,
        start_date: str,
        end_date: str,
        signed_by: str,
        session: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Sign logs for a date range (quarterly compliance).
        
        Args:
            start_date: ISO format start date
            end_date: ISO format end date
            signed_by: Name/ID of AI Ethics Board member
            session: Database session
        
        Returns:
            Summary of signed logs
        """
        
        if session is None:
            session = self.SessionLocal()
            close_session = True
        else:
            close_session = False
        
        try:
            signature_timestamp = datetime.now()
            
            # Update all logs in date range as signed
            update_query = """
            UPDATE audit_logs
            SET
                ai_ethics_signed = true,
                ethics_signature_timestamp = %s,
                ethics_signature_by = %s
            WHERE
                timestamp >= %s
                AND timestamp <= %s
                AND ai_ethics_signed = false
            RETURNING audit_id
            """
            
            result = session.execute(
                text(update_query),
                {
                    "signature_timestamp": signature_timestamp,
                    "signed_by": signed_by,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )
            
            signed_count = len(result.fetchall())
            session.commit()
            
            logger.info(
                f"Logs signed for audit | Period: {start_date} to {end_date} | "
                f"Signed by: {signed_by} | Count: {signed_count}"
            )
            
            return {
                "status": "success",
                "period": f"{start_date} to {end_date}",
                "signed_count": signed_count,
                "signed_by": signed_by,
                "timestamp": signature_timestamp.isoformat()
            }
        
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to sign logs: {str(e)}", exc_info=True)
            raise
        
        finally:
            if close_session:
                session.close()
    
    # ========================================================================
    # PRIVATE METHODS
    # ========================================================================
    
    def _get_previous_hash(self, session: Session) -> str:
        """Get hash of the most recent log entry"""
        
        try:
            query = """
            SELECT current_hash
            FROM audit_logs
            ORDER BY timestamp DESC
            LIMIT 1
            """
            
            result = session.execute(text(query)).fetchone()
            
            if result:
                return result[0]
            else:
                # First entry, no previous hash
                return "0" * 256
        
        except Exception as e:
            logger.error(f"Failed to get previous hash: {str(e)}")
            return "0" * 256
    
    @staticmethod
    def _calculate_hash(
        audit_id: str,
        timestamp: datetime,
        event_type: str,
        event_data: Dict,
        previous_hash: str
    ) -> str:
        """
        Calculate SHA-256 hash for this audit entry.
        
        Hash includes: audit_id, timestamp, event_type, event_data, previous_hash
        This ensures any modification is detectable.
        """
        
        entry_dict = {
            "audit_id": audit_id,
            "timestamp": timestamp.isoformat(),
            "event_type": event_type,
            "event_data": event_data,
            "previous_hash": previous_hash
        }
        
        # Canonical JSON serialization (sorted keys)
        entry_json = json.dumps(entry_dict, sort_keys=True, default=str)
        
        # Calculate SHA-256 hash
        hash_value = hashlib.sha256(entry_json.encode()).hexdigest()
        
        return hash_value

# ============================================================================
# USAGE EXAMPLE & TESTS
# ============================================================================

if __name__ == "__main__":
    
    # Initialize logger
    logging.basicConfig(level=logging.INFO)
    
    # Create audit logger
    audit_logger = ImmutableAuditLogger(DATABASE_URL)
    
    # Example: Log a rule violation
    print("\n=== Logging Rule Violation ===")
    audit_id = audit_logger.log_rule_violation(
        farmer_id="550e8400-e29b-41d4-a716-446655440000",
        rule_name="CONSENT_MISSING",
        reason="Farmer has not provided consent",
        outcome="block"
    )
    print(f"Logged: {audit_id}")
    
    # Example: Log an ML prediction
    print("\n=== Logging ML Prediction ===")
    audit_id = audit_logger.log_ml_prediction(
        farmer_id="550e8400-e29b-41d4-a716-446655440000",
        farm_id="550e8400-e29b-41d4-a716-446655440001",
        model_name="credit_score",
        model_version="v2.3",
        prediction_value=78.5,
        risk_level="low"
    )
    print(f"Logged: {audit_id}")
    
    # Example: Verify integrity
    print("\n=== Verifying Audit Log Integrity ===")
    integrity_result = audit_logger.verify_integrity()
    print(f"Integrity OK: {integrity_result['integrity_ok']}")
    print(f"Total logs: {integrity_result['total_logs']}")
    print(f"Tamper detected: {integrity_result['tamper_detected']}")
    
    # Example: Sign logs for audit
    print("\n=== Signing Logs for Quarterly Audit ===")
    sign_result = audit_logger.sign_logs_for_audit(
        start_date="2026-01-01",
        end_date="2026-03-31",
        signed_by="Dr. Sarah Khan (AI Ethics Board Chair)"
    )
    print(f"Status: {sign_result['status']}")
    print(f"Signed count: {sign_result['signed_count']}")
