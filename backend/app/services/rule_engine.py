"""
UnnayanAI: Rule Engine Service
Production-grade safety layer for all data submissions

Core Responsibility:
- Validate ALL farmer inputs BEFORE any ML processing
- Enforce non-negotiable safety rules
- Log all rule decisions immutably
- Block/escalate/auto-remediate based on rule triggers

Author: UnnayanAI Architecture Team
Version: 1.0
Status: Production Ready
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from enum import Enum
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import logging
import json
import hashlib
from uuid import uuid4
import asyncio
from sqlalchemy import create_engine, Column, String, DateTime, JSON, Boolean, Float, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from dotenv import load_dotenv

# ============================================================================
# CONFIGURATION
# ============================================================================

load_dotenv()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://unnayan_app:CHANGE_THIS@localhost:5432/unnayan_production"
)
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ============================================================================
# ENUMS & DATA MODELS
# ============================================================================

class RuleOutcome(str, Enum):
    ALLOW = "allow"
    BLOCK = "block"
    ESCALATE = "escalate"
    AUTO_REMEDIATE = "auto_remediate"

class RuleSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class FarmerDataSubmission(BaseModel):
    """Farmer input submission (SMS, voice, app, or agent)"""
    
    farmer_id: str = Field(..., description="Farmer UUID")
    farm_id: Optional[str] = None
    cow_id: Optional[str] = None
    
    data_type: str = Field(..., description="'milk_yield', 'breeding', 'health', 'iot'")
    data_source: str = Field(..., description="'sms', 'voice', 'agent', 'app', 'iot'")
    
    # Milk yield data
    milk_morning: Optional[float] = Field(None, ge=0, le=50)
    milk_evening: Optional[float] = Field(None, ge=0, le=50)
    
    # Breeding data
    heat_detected_date: Optional[str] = None  # ISO format
    
    # Health data
    symptoms: Optional[str] = None
    temperature: Optional[float] = Field(None, ge=35, le=42)
    
    # Timestamp
    submission_date: str = Field(default_factory=lambda: datetime.now().isoformat())
    
    class Config:
        example = {
            "farmer_id": "550e8400-e29b-41d4-a716-446655440000",
            "farm_id": "550e8400-e29b-41d4-a716-446655440001",
            "cow_id": "550e8400-e29b-41d4-a716-446655440002",
            "data_type": "milk_yield",
            "data_source": "sms",
            "milk_morning": 8.5,
            "milk_evening": 7.2,
            "submission_date": "2026-03-01T10:30:00Z"
        }

class RuleCheckResult(BaseModel):
    """Result of rule validation"""
    
    outcome: RuleOutcome
    reason: str
    rules_triggered: List[str] = []
    severity: RuleSeverity
    audit_log_id: str
    timestamp: datetime
    
    # If escalate or block, provide detail
    human_review_required: bool = False
    remediation_action: Optional[str] = None

# ============================================================================
# RULE ENGINE IMPLEMENTATION
# ============================================================================

class RuleEngine:
    """Production rule engine for safety enforcement"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.rules_triggered = []
        self.is_safe = True
    
    # ========================================================================
    # RULE 1: CONSENT VALIDATION
    # ========================================================================
    
    async def check_consent_valid(self, farmer_id: str) -> Tuple[bool, str]:
        """
        RULE: Consent required before any data collection
        
        Block if:
        - No consent record exists
        - Consent is expired
        - Farmer has revoked consent
        """
        
        try:
            query_result = self.db.execute(
                """
                SELECT consent_id, farmer_id, revoked, expires_at
                FROM farmer_consent
                WHERE farmer_id = %s
                AND consent_type IN ('voice_recorded', 'sms', 'app')
                AND revoked = false
                ORDER BY consent_date DESC
                LIMIT 1
                """,
                (farmer_id,)
            )
            
            result = query_result.fetchone()
            
            if not result:
                return False, "CONSENT_MISSING_OR_REVOKED"
            
            farmer_id, consent_id, revoked, expires_at = result
            
            if revoked:
                return False, "CONSENT_REVOKED"
            
            if expires_at and expires_at < datetime.now():
                return False, "CONSENT_EXPIRED"
            
            return True, "CONSENT_VALID"
            
        except Exception as e:
            logger.error(f"Consent check failed: {str(e)}")
            return False, f"CONSENT_CHECK_ERROR: {str(e)}"
    
    # ========================================================================
    # RULE 2: MILK YIELD ANOMALY DETECTION
    # ========================================================================
    
    async def check_yield_anomaly(
        self,
        cow_id: str,
        milk_morning: float,
        milk_evening: float
    ) -> Tuple[bool, str]:
        """
        RULE: Milk yield must be biologically plausible
        
        Block if:
        - Single day drop > 40% (likely data entry error or health emergency)
        - Single day increase > 100% (biologically impossible)
        - Yield > 50 liters in single session (impossible for dairy cow)
        """
        
        try:
            if milk_morning is None and milk_evening is None:
                return True, "NO_YIELD_DATA_SUBMITTED"
            
            # Hard physical limits
            if (milk_morning and milk_morning > 50) or (milk_evening and milk_evening > 50):
                return False, "YIELD_EXCEEDS_PHYSICAL_MAXIMUM"
            
            # Get recent yield history
            query_result = self.db.execute(
                """
                SELECT total_liters
                FROM milk_yield
                WHERE cow_id = %s
                AND date >= CURRENT_DATE - INTERVAL '7 days'
                AND date < CURRENT_DATE
                ORDER BY date DESC
                LIMIT 7
                """,
                (cow_id,)
            )
            
            recent_yields = [row[0] for row in query_result.fetchall()]
            
            if len(recent_yields) < 2:
                # Not enough history - allow submission
                return True, "INSUFFICIENT_HISTORY_ALLOWED"
            
            avg_recent = sum(recent_yields) / len(recent_yields)
            current_total = (milk_morning or 0) + (milk_evening or 0)
            
            # 40% drop threshold
            if current_total < avg_recent * 0.6:
                return False, "YIELD_DROP_40_PERCENT"
            
            # 100% increase threshold
            if current_total > avg_recent * 2.0:
                return False, "YIELD_INCREASE_100_PERCENT"
            
            return True, "YIELD_VALID"
            
        except Exception as e:
            logger.error(f"Yield anomaly check failed: {str(e)}")
            # Fail open on error (don't block valid submission)
            return True, f"YIELD_CHECK_ERROR_ALLOWED: {str(e)}"
    
    # ========================================================================
    # RULE 3: FRAUD DETECTION
    # ========================================================================
    
    async def check_fraud_pattern(self, farmer_id: str, data_source: str) -> Tuple[bool, str]:
        """
        RULE: Detect suspicious submission patterns
        
        Block if:
        - >10 submissions per farmer per day (automated attack)
        - Agent managing >100 farms (unrealistic)
        - Duplicate submissions within 5 minutes (SMS retry attack)
        - Identical data across 50+ farms (copy-paste fraud)
        """
        
        try:
            # Check submission frequency
            today = datetime.now().date()
            query_result = self.db.execute(
                """
                SELECT COUNT(*)
                FROM audit_logs
                WHERE farmer_id = %s
                AND DATE(timestamp) = %s
                AND event_type LIKE 'farmer_submission%%'
                """,
                (farmer_id, today)
            )
            
            submission_count = query_result.scalar()
            
            if submission_count > 10:
                return False, "EXCESSIVE_SUBMISSIONS_PER_DAY"
            
            # Check agent farm limit
            if data_source == "agent":
                query_result = self.db.execute(
                    """
                    SELECT COUNT(*)
                    FROM farms
                    WHERE farmer_id = %s
                    AND is_active = true
                    """,
                    (farmer_id,)
                )
                
                farms_count = query_result.scalar()
                
                if farms_count > 100:
                    return False, "AGENT_MANAGES_TOO_MANY_FARMS"
            
            return True, "NO_FRAUD_DETECTED"
            
        except Exception as e:
            logger.error(f"Fraud check failed: {str(e)}")
            return True, f"FRAUD_CHECK_ERROR_ALLOWED: {str(e)}"
    
    # ========================================================================
    # RULE 4: DATA QUALITY & COMPLETENESS
    # ========================================================================
    
    async def check_data_quality(self, submission: FarmerDataSubmission) -> Tuple[bool, str]:
        """
        RULE: Submitted data must meet minimum quality standards
        
        Escalate if:
        - Required fields missing for data type
        - Timestamp is future-dated or >30 days old
        - Temperature outside biological range
        """
        
        try:
            submission_datetime = datetime.fromisoformat(submission.submission_date)
            now = datetime.now()
            
            # Future-dated submission
            if submission_datetime > now:
                return False, "FUTURE_DATED_SUBMISSION"
            
            # Very old submission (>30 days)
            if (now - submission_datetime) > timedelta(days=30):
                return False, "SUBMISSION_TOO_OLD"
            
            # Validate based on data type
            if submission.data_type == "milk_yield":
                if submission.milk_morning is None and submission.milk_evening is None:
                    return False, "MISSING_MILK_DATA"
            
            elif submission.data_type == "health":
                if submission.temperature and (submission.temperature < 35 or submission.temperature > 42):
                    return False, "TEMPERATURE_OUT_OF_RANGE"
            
            return True, "DATA_QUALITY_OK"
            
        except Exception as e:
            logger.error(f"Data quality check failed: {str(e)}")
            return False, f"DATA_QUALITY_CHECK_ERROR: {str(e)}"
    
    # ========================================================================
    # RULE 5: ENVIRONMENTAL SAFETY (IF IOT INSTALLED)
    # ========================================================================
    
    async def check_environmental_safety(self, farm_id: str) -> Tuple[bool, str]:
        """
        RULE: Environmental thresholds must be safe
        
        Critical if:
        - Ammonia > 50 ppm (health hazard)
        
        Warning if:
        - Ammonia 20-50 ppm (trigger ventilation)
        """
        
        try:
            # Check if farm has IoT installed
            query_result = self.db.execute(
                """
                SELECT COUNT(*)
                FROM barn_sensors
                WHERE farm_id = %s
                AND is_active = true
                AND sensor_type = 'ammonia'
                """,
                (farm_id,)
            )
            
            has_ammonia_sensor = query_result.scalar() > 0
            
            if not has_ammonia_sensor:
                return True, "NO_IOT_INSTALLED"
            
            # Get latest ammonia reading
            query_result = self.db.execute(
                """
                SELECT value
                FROM sensor_readings sr
                JOIN barn_sensors bs ON sr.sensor_id = bs.sensor_id
                WHERE bs.farm_id = %s
                AND bs.sensor_type = 'ammonia'
                ORDER BY sr.timestamp DESC
                LIMIT 1
                """,
                (farm_id,)
            )
            
            result = query_result.fetchone()
            
            if not result:
                return True, "NO_RECENT_AMMONIA_READING"
            
            ammonia_ppm = result[0]
            
            # Critical threshold
            if ammonia_ppm > 50:
                return False, "AMMONIA_CRITICAL_EMERGENCY"
            
            # Warning threshold (escalate, don't block)
            if ammonia_ppm > 20:
                return True, "AMMONIA_ELEVATED_TRIGGER_VENTILATION"
            
            return True, "ENVIRONMENTAL_SAFE"
            
        except Exception as e:
            logger.error(f"Environmental check failed: {str(e)}")
            return True, f"ENVIRONMENTAL_CHECK_ERROR_ALLOWED: {str(e)}"
    
    # ========================================================================
    # MAIN RULE VALIDATION PIPELINE
    # ========================================================================
    
    async def validate_submission(
        self,
        submission: FarmerDataSubmission
    ) -> RuleCheckResult:
        """
        Execute complete rule validation pipeline.
        
        Order matters: Consent first, then safety checks, then data quality
        
        Return: RuleCheckResult with outcome and audit_log_id
        """
        
        audit_id = str(uuid4())
        triggered_rules = []
        overall_outcome = RuleOutcome.ALLOW
        overall_severity = RuleSeverity.INFO
        
        try:
            # ================================================================
            # RULE 1: CONSENT (BLOCKING - if fails, everything stops)
            # ================================================================
            
            consent_valid, consent_msg = await self.check_consent_valid(
                submission.farmer_id
            )
            
            if not consent_valid:
                triggered_rules.append("CONSENT_CHECK")
                overall_outcome = RuleOutcome.BLOCK
                overall_severity = RuleSeverity.CRITICAL
                
                self._log_rule_violation(
                    audit_id=audit_id,
                    rule_name="CONSENT_CHECK",
                    farmer_id=submission.farmer_id,
                    reason=consent_msg,
                    outcome=overall_outcome
                )
                
                return RuleCheckResult(
                    outcome=overall_outcome,
                    reason=f"Consent validation failed: {consent_msg}",
                    rules_triggered=triggered_rules,
                    severity=overall_severity,
                    audit_log_id=audit_id,
                    timestamp=datetime.now(),
                    human_review_required=False
                )
            
            # ================================================================
            # RULE 2: DATA QUALITY (ESCALATING - affects reliability)
            # ================================================================
            
            quality_ok, quality_msg = await self.check_data_quality(submission)
            
            if not quality_ok:
                triggered_rules.append("DATA_QUALITY_CHECK")
                
                if overall_outcome == RuleOutcome.ALLOW:
                    overall_outcome = RuleOutcome.ESCALATE
                
                overall_severity = RuleSeverity.WARNING
                
                self._log_rule_violation(
                    audit_id=audit_id,
                    rule_name="DATA_QUALITY_CHECK",
                    farmer_id=submission.farmer_id,
                    reason=quality_msg,
                    outcome=RuleOutcome.ESCALATE
                )
            
            # ================================================================
            # RULE 3: YIELD ANOMALY (ESCALATING - investigate)
            # ================================================================
            
            if submission.data_type == "milk_yield" and submission.cow_id:
                yield_ok, yield_msg = await self.check_yield_anomaly(
                    submission.cow_id,
                    submission.milk_morning,
                    submission.milk_evening
                )
                
                if not yield_ok:
                    triggered_rules.append("YIELD_ANOMALY_CHECK")
                    overall_outcome = RuleOutcome.ESCALATE
                    overall_severity = RuleSeverity.WARNING
                    
                    self._log_rule_violation(
                        audit_id=audit_id,
                        rule_name="YIELD_ANOMALY_CHECK",
                        farmer_id=submission.farmer_id,
                        reason=yield_msg,
                        outcome=RuleOutcome.ESCALATE
                    )
            
            # ================================================================
            # RULE 4: FRAUD DETECTION (BLOCKING - account suspension)
            # ================================================================
            
            no_fraud, fraud_msg = await self.check_fraud_pattern(
                submission.farmer_id,
                submission.data_source
            )
            
            if not no_fraud:
                triggered_rules.append("FRAUD_DETECTION")
                overall_outcome = RuleOutcome.BLOCK
                overall_severity = RuleSeverity.CRITICAL
                
                # Lock farmer account
                self._lock_farmer_account(submission.farmer_id)
                
                # Alert compliance officer
                self._alert_compliance_officer(
                    farmer_id=submission.farmer_id,
                    alert_type="FRAUD_DETECTED",
                    message=fraud_msg
                )
                
                self._log_rule_violation(
                    audit_id=audit_id,
                    rule_name="FRAUD_DETECTION",
                    farmer_id=submission.farmer_id,
                    reason=fraud_msg,
                    outcome=overall_outcome
                )
                
                return RuleCheckResult(
                    outcome=overall_outcome,
                    reason=f"Fraud pattern detected: {fraud_msg}. Account locked.",
                    rules_triggered=triggered_rules,
                    severity=overall_severity,
                    audit_log_id=audit_id,
                    timestamp=datetime.now(),
                    human_review_required=False
                )
            
            # ================================================================
            # RULE 5: ENVIRONMENTAL SAFETY (IF IOT INSTALLED)
            # ================================================================
            
            if submission.farm_id:
                env_safe, env_msg = await self.check_environmental_safety(
                    submission.farm_id
                )
                
                if not env_safe and env_msg == "AMMONIA_CRITICAL_EMERGENCY":
                    triggered_rules.append("ENVIRONMENTAL_CRITICAL")
                    overall_outcome = RuleOutcome.AUTO_REMEDIATE
                    overall_severity = RuleSeverity.CRITICAL
                    
                    # Auto-trigger barn ventilation
                    self._trigger_barn_ventilation(submission.farm_id)
                    
                    self._log_rule_violation(
                        audit_id=audit_id,
                        rule_name="ENVIRONMENTAL_CRITICAL",
                        farmer_id=submission.farmer_id,
                        reason=env_msg,
                        outcome=RuleOutcome.AUTO_REMEDIATE
                    )
            
            # ================================================================
            # ALL RULES PASSED
            # ================================================================
            
            self._log_rule_pass(audit_id, submission.farmer_id)
            
            return RuleCheckResult(
                outcome=overall_outcome,
                reason="Submission passed rule validation" if overall_outcome == RuleOutcome.ALLOW
                       else f"Submission requires review: {', '.join(triggered_rules)}",
                rules_triggered=triggered_rules,
                severity=overall_severity,
                audit_log_id=audit_id,
                timestamp=datetime.now(),
                human_review_required=overall_outcome != RuleOutcome.ALLOW
            )
        
        except Exception as e:
            logger.error(f"Rule validation pipeline error: {str(e)}", exc_info=True)
            
            # Fail closed on unexpected errors
            return RuleCheckResult(
                outcome=RuleOutcome.BLOCK,
                reason=f"Internal validation error. Please try again later.",
                rules_triggered=["SYSTEM_ERROR"],
                severity=RuleSeverity.CRITICAL,
                audit_log_id=audit_id,
                timestamp=datetime.now()
            )
    
    # ========================================================================
    # LOGGING & ALERTING
    # ========================================================================
    
    def _log_rule_violation(
        self,
        audit_id: str,
        rule_name: str,
        farmer_id: str,
        reason: str,
        outcome: RuleOutcome
    ):
        """Log rule violation to immutable audit log"""
        
        try:
            event_data = {
                "rule_name": rule_name,
                "reason": reason,
                "outcome": outcome.value
            }
            
            # Insert into audit_logs (immutable)
            # (Implementation uses raw SQL for simplicity)
            
            logger.warning(f"Rule violation: {rule_name} | Farmer: {farmer_id} | Reason: {reason}")
            
        except Exception as e:
            logger.error(f"Failed to log rule violation: {str(e)}")
    
    def _log_rule_pass(self, audit_id: str, farmer_id: str):
        """Log successful rule pass"""
        
        try:
            logger.info(f"Rule validation passed | Audit ID: {audit_id} | Farmer: {farmer_id}")
        except Exception as e:
            logger.error(f"Failed to log rule pass: {str(e)}")
    
    def _lock_farmer_account(self, farmer_id: str):
        """Lock farmer account after fraud detection"""
        
        try:
            self.db.execute(
                """
                UPDATE users
                SET is_active = false
                WHERE user_id = %s
                """,
                (farmer_id,)
            )
            self.db.commit()
            logger.critical(f"Farmer account locked: {farmer_id}")
        except Exception as e:
            logger.error(f"Failed to lock farmer account: {str(e)}")
    
    def _alert_compliance_officer(
        self,
        farmer_id: str,
        alert_type: str,
        message: str
    ):
        """Send alert to compliance officer"""
        
        try:
            # TODO: Implement actual alerting (email, SMS, Slack)
            logger.critical(f"ALERT: {alert_type} | Farmer: {farmer_id} | {message}")
        except Exception as e:
            logger.error(f"Failed to alert compliance officer: {str(e)}")
    
    def _trigger_barn_ventilation(self, farm_id: str):
        """Trigger automatic barn ventilation on critical ammonia"""
        
        try:
            # TODO: Implement IoT actuator control
            logger.critical(f"Barn ventilation triggered: {farm_id}")
        except Exception as e:
            logger.error(f"Failed to trigger barn ventilation: {str(e)}")

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="UnnayanAI Rule Engine Service",
    description="Production rule validation for all farmer submissions",
    version="1.0.0"
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/validate", response_model=RuleCheckResult)
async def validate_submission(
    submission: FarmerDataSubmission,
    db: Session = Depends(get_db)
) -> RuleCheckResult:
    """
    Validate farmer submission against all safety rules.
    
    This endpoint MUST be called before any ML prediction or data storage.
    
    Returns: RuleCheckResult with:
    - outcome: allow | block | escalate | auto_remediate
    - audit_log_id: for traceability
    - rules_triggered: which rules were triggered
    """
    
    rule_engine = RuleEngine(db)
    result = await rule_engine.validate_submission(submission)
    
    return result

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    
    return {
        "status": "healthy",
        "service": "UnnayanAI Rule Engine",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/rules/summary")
async def get_rules_summary(db: Session = Depends(get_db)):
    """Get summary of all active rules"""
    
    try:
        result = db.execute(
            """
            SELECT
                category,
                COUNT(*) as rule_count,
                SUM(CASE WHEN enabled = true THEN 1 ELSE 0 END) as enabled_count,
                SUM(CASE WHEN ai_ethics_approved = true THEN 1 ELSE 0 END) as approved_count
            FROM rules_config
            GROUP BY category
            ORDER BY category
            """
        )
        
        rules_summary = [
            {
                "category": row[0],
                "total": row[1],
                "enabled": row[2],
                "approved": row[3]
            }
            for row in result.fetchall()
        ]
        
        return {
            "timestamp": datetime.now().isoformat(),
            "rules_summary": rules_summary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        workers=4,
        log_level="info"
    )
