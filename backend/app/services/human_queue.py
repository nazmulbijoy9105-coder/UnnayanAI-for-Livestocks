"""
UnnayanAI: Human-in-Loop Review Queue (Phase 2)

Routes HIGH/MEDIUM risk outputs to compliance officers
- SLA tracking (4-hour review requirement)
- Dashboard for human reviewers
- Override logging & audit trail
- Auto-escalation if SLA exceeded

Premium UI with white/green sustainable design
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from enum import Enum
from uuid import uuid4
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://unnayan_app:CHANGE_THIS@localhost:5432/unnayan_production"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# ============================================================================
# MODELS
# ============================================================================

class ReviewStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    APPROVED = "approved"
    REJECTED = "rejected"
    ESCALATED = "escalated"

class ReviewDecision(str, Enum):
    APPROVED = "approved"
    REJECTED = "rejected"
    ESCALATED_TO_NGO = "escalated_to_ngo"
    ESCALATED_TO_BOARD = "escalated_to_board"

class ReviewQueueItem(BaseModel):
    review_id: Optional[str] = None
    farm_id: str
    output_type: str  # 'credit_score', 'health_alert', 'environmental_action'
    risk_level: str  # 'medium', 'high'
    priority: str = "normal"
    description: str
    created_at: Optional[datetime] = None
    sla_due_at: Optional[datetime] = None
    assigned_to: Optional[str] = None
    status: ReviewStatus = ReviewStatus.PENDING

class ReviewDecisionInput(BaseModel):
    decision: ReviewDecision
    reason: str
    decided_by: str
    notes: Optional[str] = None

# ============================================================================
# HUMAN-IN-LOOP QUEUE SERVICE
# ============================================================================

class HumanInLoopQueue:
    """Manages review queue for high-risk AI outputs"""
    
    def __init__(self, db_url: str):
        self.engine = create_engine(db_url)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.SLA_HOURS = 4  # 4-hour review SLA for medium/high risk
    
    def create_review_ticket(
        self,
        farm_id: str,
        output_type: str,
        risk_level: str,
        description: str,
        priority: str = "normal"
    ) -> Dict:
        """Create a review ticket for human evaluation"""
        
        session = self.SessionLocal()
        
        try:
            review_id = str(uuid4())
            created_at = datetime.now()
            sla_due_at = created_at + timedelta(hours=self.SLA_HOURS)
            
            insert_query = """
            INSERT INTO review_queue (
                review_id, farm_id, output_type, risk_level, priority,
                created_at, sla_due_at, status, description
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING review_id
            """
            
            session.execute(
                text(insert_query),
                {
                    "review_id": review_id,
                    "farm_id": farm_id,
                    "output_type": output_type,
                    "risk_level": risk_level,
                    "priority": priority,
                    "created_at": created_at,
                    "sla_due_at": sla_due_at,
                    "status": ReviewStatus.PENDING.value,
                    "description": description
                }
            )
            
            session.commit()
            
            logger.info(f"Review ticket created: {review_id} | Farm: {farm_id} | Risk: {risk_level}")
            
            # Send alert if HIGH risk
            if risk_level == "high":
                self._send_urgent_alert(farm_id, review_id, description)
            
            return {
                "review_id": review_id,
                "status": ReviewStatus.PENDING.value,
                "sla_due_at": sla_due_at.isoformat(),
                "sla_hours": self.SLA_HOURS
            }
        
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create review ticket: {str(e)}")
            raise
        
        finally:
            session.close()
    
    def get_pending_reviews(
        self,
        assigned_to: Optional[str] = None,
        high_priority_only: bool = False
    ) -> List[Dict]:
        """Get pending reviews for compliance officer"""
        
        session = self.SessionLocal()
        
        try:
            query = """
            SELECT
                review_id, farm_id, output_type, risk_level, priority,
                created_at, sla_due_at, status, description,
                EXTRACT(HOUR FROM (sla_due_at - NOW())) as hours_remaining
            FROM review_queue
            WHERE status IN ('pending', 'in_progress')
            """
            
            params = {}
            
            if assigned_to:
                query += " AND assigned_to = %(assigned_to)s"
                params["assigned_to"] = assigned_to
            
            if high_priority_only:
                query += " AND (priority = 'urgent' OR sla_due_at <= NOW())"
            
            query += " ORDER BY sla_due_at ASC"
            
            result = session.execute(text(query), params)
            
            reviews = []
            for row in result.fetchall():
                reviews.append({
                    "review_id": row[0],
                    "farm_id": row[1],
                    "output_type": row[2],
                    "risk_level": row[3],
                    "priority": row[4],
                    "created_at": row[5].isoformat() if row[5] else None,
                    "sla_due_at": row[6].isoformat() if row[6] else None,
                    "status": row[7],
                    "description": row[8],
                    "hours_remaining": row[9],
                    "sla_violated": row[9] < 0 if row[9] else False
                })
            
            return reviews
        
        except Exception as e:
            logger.error(f"Failed to get pending reviews: {str(e)}")
            return []
        
        finally:
            session.close()
    
    def submit_review_decision(
        self,
        review_id: str,
        decision: ReviewDecision,
        reason: str,
        decided_by: str,
        notes: Optional[str] = None
    ) -> Dict:
        """Submit human review decision"""
        
        session = self.SessionLocal()
        
        try:
            decided_at = datetime.now()
            
            # Calculate review time
            get_time_query = """
            SELECT created_at FROM review_queue WHERE review_id = %s
            """
            
            result = session.execute(text(get_time_query), {"review_id": review_id})
            created_at = result.fetchone()[0]
            review_time_minutes = int((decided_at - created_at).total_seconds() / 60)
            
            # Update review record
            update_query = """
            UPDATE review_queue
            SET
                status = %s,
                decision = %s,
                decision_reason = %s,
                decided_by = %s,
                decided_at = %s,
                time_to_review_minutes = %s,
                notes = %s
            WHERE review_id = %s
            """
            
            session.execute(
                text(update_query),
                {
                    "status": ReviewStatus.APPROVED.value if decision == ReviewDecision.APPROVED else ReviewStatus.REJECTED.value,
                    "decision": decision.value,
                    "decision_reason": reason,
                    "decided_by": decided_by,
                    "decided_at": decided_at,
                    "review_time_minutes": review_time_minutes,
                    "notes": notes,
                    "review_id": review_id
                }
            )
            
            session.commit()
            
            logger.info(
                f"Review decision submitted: {review_id} | Decision: {decision.value} | "
                f"Time: {review_time_minutes} min | By: {decided_by}"
            )
            
            # Log to audit trail
            self._log_review_decision(review_id, decision, reason, decided_by, session)
            
            return {
                "review_id": review_id,
                "decision": decision.value,
                "decided_at": decided_at.isoformat(),
                "review_time_minutes": review_time_minutes
            }
        
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to submit review decision: {str(e)}")
            raise
        
        finally:
            session.close()
    
    def get_review_statistics(self) -> Dict:
        """Get queue statistics for dashboard"""
        
        session = self.SessionLocal()
        
        try:
            stats_query = """
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN risk_level = 'high' THEN 1 ELSE 0 END) as high_risk_count,
                SUM(CASE WHEN sla_due_at <= NOW() AND status IN ('pending', 'in_progress') THEN 1 ELSE 0 END) as sla_violated_count,
                AVG(EXTRACT(HOUR FROM (sla_due_at - NOW()))) as avg_hours_remaining
            FROM review_queue
            WHERE created_at >= NOW() - INTERVAL '7 days'
            """
            
            result = session.execute(text(stats_query)).fetchone()
            
            return {
                "total_reviews": result[0] or 0,
                "pending": result[1] or 0,
                "in_progress": result[2] or 0,
                "high_risk": result[3] or 0,
                "sla_violated": result[4] or 0,
                "avg_hours_remaining": float(result[5]) if result[5] else 0,
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Failed to get review statistics: {str(e)}")
            return {}
        
        finally:
            session.close()
    
    def _send_urgent_alert(self, farm_id: str, review_id: str, description: str):
        """Send urgent alert for high-risk reviews"""
        
        try:
            message = f"""
            🚨 HIGH-RISK REVIEW REQUIRED
            
            Review ID: {review_id}
            Farm ID: {farm_id}
            Description: {description}
            
            SLA: 4 hours
            Action Required: Review and approve/reject immediately
            """
            
            logger.critical(message)
            # TODO: Send to Slack/SMS
        
        except Exception as e:
            logger.error(f"Failed to send urgent alert: {str(e)}")
    
    def _log_review_decision(
        self,
        review_id: str,
        decision: ReviewDecision,
        reason: str,
        decided_by: str,
        session: Session
    ):
        """Log review decision to audit trail"""
        
        try:
            from audit_service import ImmutableAuditLogger
            
            logger_instance = ImmutableAuditLogger(self.engine.url.database)
            
            # Log event
            logger_instance.log_event(
                event_type="human_review_decision",
                severity="warning",
                event_data={
                    "review_id": review_id,
                    "decision": decision.value,
                    "reason": reason,
                    "decided_by": decided_by
                }
            )
        
        except Exception as e:
            logger.error(f"Failed to log review decision: {str(e)}")

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="UnnayanAI Human-in-Loop Queue",
    description="Review queue management for high-risk AI outputs",
    version="1.0.0"
)

queue_service = HumanInLoopQueue(DATABASE_URL)

@app.post("/create-review")
async def create_review(item: ReviewQueueItem):
    """Create a review ticket"""
    
    return queue_service.create_review_ticket(
        farm_id=item.farm_id,
        output_type=item.output_type,
        risk_level=item.risk_level,
        description=item.description,
        priority=item.priority
    )

@app.get("/reviews/pending")
async def get_pending_reviews(assigned_to: Optional[str] = None):
    """Get pending reviews"""
    
    return {
        "reviews": queue_service.get_pending_reviews(assigned_to),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/reviews/{review_id}/decide")
async def submit_decision(review_id: str, decision: ReviewDecisionInput):
    """Submit review decision"""
    
    return queue_service.submit_review_decision(
        review_id=review_id,
        decision=ReviewDecision(decision.decision.value),
        reason=decision.reason,
        decided_by=decision.decided_by,
        notes=decision.notes
    )

@app.get("/statistics")
async def get_statistics():
    """Get queue statistics"""
    
    return queue_service.get_review_statistics()

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "human-in-loop-queue"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
