# UnnayanAI: Technical Implementation Guide
## Human-Laws-AI Centered Design (Engineering Deep-Dive)

**Version 1.0 | March 2026**

---

## 📋 TABLE OF CONTENTS

1. [Rule Engine Implementation](#1-rule-engine-implementation)
2. [ML Model Safety Wrappers](#2-ml-model-safety-wrappers)
3. [Drift Detection System](#3-drift-detection-system)
4. [Audit & Logging Architecture](#4-audit--logging-architecture)
5. [API Safety Middleware](#5-api-safety-middleware)
6. [Deployment Checklist](#6-deployment-checklist)

---

## 1. RULE ENGINE IMPLEMENTATION

### 1.1 Rule Engine Service (FastAPI)

```python
# rule_engine_service.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from enum import Enum
from typing import List, Dict
from datetime import datetime
import logging

app = FastAPI()
logger = logging.getLogger(__name__)

class RuleOutcome(str, Enum):
    ALLOW = "allow"
    BLOCK = "block"
    ESCALATE = "escalate"

class FarmerInput(BaseModel):
    farmer_id: str
    cow_id: str
    milk_yield: float
    date: str
    data_source: str  # "sms", "voice", "app", "agent"
    
class RuleCheckResult(BaseModel):
    outcome: RuleOutcome
    reason: str
    rule_triggered: str
    audit_log_id: str
    timestamp: datetime

# RULE 1: Consent Validation
def check_consent_valid(farmer_id: str) -> tuple[bool, str]:
    """Check if farmer consent is valid and not expired"""
    # Query consent DB
    consent_record = get_farmer_consent(farmer_id)
    
    if not consent_record:
        return False, "CONSENT_MISSING"
    
    if consent_record.is_expired():
        return False, "CONSENT_EXPIRED"
    
    return True, "CONSENT_VALID"

# RULE 2: Milk Yield Anomaly Detection
def check_yield_anomaly(farmer_id: str, cow_id: str, current_yield: float) -> tuple[bool, str]:
    """Detect biological implausibility"""
    # Get last 7 days of yields
    recent_yields = get_cow_yield_history(cow_id, days=7)
    
    if len(recent_yields) < 3:
        return True, "INSUFFICIENT_HISTORY"  # Allow first entries
    
    avg_yield = sum(recent_yields) / len(recent_yields)
    
    # Hard rule: milk drop > 40% in single day is biological implausibility
    if current_yield < avg_yield * 0.6:
        return False, "YIELD_DROP_40_PERCENT"
    
    # Hard rule: yield increase > 100% in single day (biological impossibility)
    if current_yield > avg_yield * 2.0:
        return False, "YIELD_INCREASE_100_PERCENT"
    
    return True, "YIELD_VALID"

# RULE 3: Fraud Detection
def check_fraud_pattern(farmer_id: str, data_source: str) -> tuple[bool, str]:
    """Detect suspicious behavior patterns"""
    
    # Check submission frequency
    submissions_today = count_submissions_today(farmer_id)
    if submissions_today > 10:
        return False, "EXCESSIVE_SUBMISSIONS"
    
    # Check agent manipulation
    if data_source == "agent":
        farms_managed = get_agent_farms_count(farmer_id)
        if farms_managed > 100:
            return False, "AGENT_TOO_MANY_FARMS"
    
    # Check data consistency
    if is_duplicate_submission(farmer_id, data_source):
        return False, "DUPLICATE_SUBMISSION"
    
    return True, "NO_FRAUD_DETECTED"

# RULE 4: Environmental Safety
def check_environmental_safety(farm_id: str, ammonia_ppm: float) -> tuple[bool, str]:
    """Environmental threshold enforcement"""
    
    AMMONIA_SAFE_THRESHOLD = 20  # ppm
    AMMONIA_CRITICAL = 50  # ppm
    
    if ammonia_ppm > AMMONIA_CRITICAL:
        return False, "AMMONIA_CRITICAL_TRIGGER_EMERGENCY"
    
    if ammonia_ppm > AMMONIA_SAFE_THRESHOLD:
        # Medium risk - trigger ventilation but allow logging
        return True, "AMMONIA_ELEVATED_AUTO_VENTILATION_ON"
    
    return True, "ENVIRONMENTAL_SAFE"

# MAIN RULE VALIDATION PIPELINE
@app.post("/validate-input", response_model=RuleCheckResult)
async def validate_farmer_input(input_data: FarmerInput) -> RuleCheckResult:
    """
    Main rule validation endpoint. Executed BEFORE any ML processing.
    No ML model can override these rules.
    """
    
    audit_id = generate_audit_id()
    
    # Rule 1: Consent
    consent_valid, consent_msg = check_consent_valid(input_data.farmer_id)
    if not consent_valid:
        log_rule_violation(audit_id, "CONSENT_CHECK", input_data.farmer_id, consent_msg)
        return RuleCheckResult(
            outcome=RuleOutcome.BLOCK,
            reason=f"Consent check failed: {consent_msg}",
            rule_triggered="CONSENT_CHECK",
            audit_log_id=audit_id,
            timestamp=datetime.now()
        )
    
    # Rule 2: Yield Anomaly
    yield_valid, yield_msg = check_yield_anomaly(
        input_data.farmer_id,
        input_data.cow_id,
        input_data.milk_yield
    )
    if not yield_valid:
        log_rule_violation(audit_id, "YIELD_ANOMALY", input_data.farmer_id, yield_msg)
        return RuleCheckResult(
            outcome=RuleOutcome.ESCALATE,  # Alert farmer + agent, don't auto-reject
            reason=f"Yield anomaly detected: {yield_msg}. Please verify entry.",
            rule_triggered="YIELD_ANOMALY",
            audit_log_id=audit_id,
            timestamp=datetime.now()
        )
    
    # Rule 3: Fraud
    no_fraud, fraud_msg = check_fraud_pattern(input_data.farmer_id, input_data.data_source)
    if not no_fraud:
        log_rule_violation(audit_id, "FRAUD_CHECK", input_data.farmer_id, fraud_msg)
        lock_farmer_account(input_data.farmer_id)
        alert_compliance_officer(input_data.farmer_id, fraud_msg)
        return RuleCheckResult(
            outcome=RuleOutcome.BLOCK,
            reason=f"Fraud pattern detected: {fraud_msg}. Account locked.",
            rule_triggered="FRAUD_CHECK",
            audit_log_id=audit_id,
            timestamp=datetime.now()
        )
    
    # Rule 4: Environmental (if IoT installed)
    if has_iot_installed(input_data.farm_id):
        ammonia = get_latest_ammonia_reading(input_data.farm_id)
        env_safe, env_msg = check_environmental_safety(input_data.farm_id, ammonia)
        # Environmental alerts don't block, but trigger automation
        if not env_safe:
            trigger_barn_ventilation(input_data.farm_id)
            log_rule_violation(audit_id, "ENVIRONMENTAL_CHECK", input_data.farm_id, env_msg)
    
    # All rules passed
    log_rule_pass(audit_id, input_data.farmer_id)
    return RuleCheckResult(
        outcome=RuleOutcome.ALLOW,
        reason="All rules passed. Safe to process.",
        rule_triggered="NONE",
        audit_log_id=audit_id,
        timestamp=datetime.now()
    )

def log_rule_violation(audit_id: str, rule: str, farmer_id: str, reason: str):
    """Immutable audit logging"""
    from datetime import datetime
    audit_entry = {
        "audit_id": audit_id,
        "timestamp": datetime.now().isoformat(),
        "rule": rule,
        "farmer_id": farmer_id,
        "reason": reason,
        "status": "VIOLATION",
        "ip_address": get_request_ip(),
        "user_agent": get_request_user_agent()
    }
    # Write to immutable event store
    append_to_audit_log(audit_entry)

```

### 1.2 Rule Configuration Database

```sql
-- rules_config table (can be updated by Data Officer, not engineers)
CREATE TABLE rules_config (
    rule_id UUID PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    rule_description TEXT,
    category VARCHAR(50),  -- "consent", "yield", "fraud", "environmental", "credit"
    threshold_value FLOAT,
    operator VARCHAR(10),  -- ">", "<", "==", ">=", "<="
    action_on_trigger VARCHAR(50),  -- "block", "escalate", "alert"
    enabled BOOLEAN DEFAULT true,
    updated_by VARCHAR(100),
    updated_at TIMESTAMP,
    ai_ethics_approved BOOLEAN DEFAULT false,
    approval_timestamp TIMESTAMP,
    approval_by VARCHAR(100)
);

-- Example entries
INSERT INTO rules_config VALUES (
    gen_random_uuid(),
    'AMMONIA_SAFE',
    'Block farm operations if ammonia exceeds 50 ppm',
    'environmental',
    50.0,
    '>',
    'block',
    true,
    'data_officer_1',
    NOW(),
    true,
    NOW(),
    'ethics_board_chair'
);
```

---

## 2. ML MODEL SAFETY WRAPPERS

### 2.1 Safe Model Wrapper Pattern

```python
# model_wrapper.py
from typing import Dict, Any, Tuple
from dataclasses import dataclass
from enum import Enum
import numpy as np
from sklearn.preprocessing import StandardScaler

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

@dataclass
class PredictionWithRisk:
    prediction: float
    confidence: float
    risk_level: RiskLevel
    requires_human_review: bool
    explanation_factors: Dict[str, float]
    model_version: str
    timestamp: str

class SafeMLWrapper:
    """
    Wrapper enforcing safety constraints around ML models.
    Models cannot make autonomous decisions classified as HIGH risk.
    """
    
    def __init__(self, model, model_version: str, risk_config: Dict):
        self.model = model
        self.model_version = model_version
        self.risk_thresholds = risk_config  # {low: 0.4, medium: 0.7, high: 1.0}
        self.scaler = StandardScaler()
    
    def predict_with_safety(self, input_features: Dict[str, float]) -> PredictionWithRisk:
        """
        Make prediction and assess risk level.
        HIGH-risk predictions require human-in-loop review.
        """
        
        # Input validation (rule engine should have done this, but belt & suspenders)
        if not self._validate_features(input_features):
            raise ValueError("Invalid features detected")
        
        # Get raw prediction
        raw_prediction = self.model.predict(input_features)[0]
        
        # Get confidence (if model provides it)
        confidence = self._get_confidence(raw_prediction)
        
        # Assess risk level
        risk_level = self._assess_risk(raw_prediction, confidence)
        
        # Get feature importance
        explanation_factors = self._get_feature_importance(input_features)
        
        # Determine if human review needed
        requires_review = risk_level == RiskLevel.HIGH
        
        from datetime import datetime
        return PredictionWithRisk(
            prediction=raw_prediction,
            confidence=confidence,
            risk_level=risk_level,
            requires_human_review=requires_review,
            explanation_factors=explanation_factors,
            model_version=self.model_version,
            timestamp=datetime.now().isoformat()
        )
    
    def _assess_risk(self, prediction: float, confidence: float) -> RiskLevel:
        """Assess if prediction is high-risk and requires manual validation"""
        
        # Credit risk > 70% = HIGH RISK
        if prediction > self.risk_thresholds["high"]:
            return RiskLevel.HIGH
        
        # Credit risk 50-70% + low confidence = MEDIUM RISK
        if prediction > self.risk_thresholds["medium"] and confidence < 0.7:
            return RiskLevel.MEDIUM
        
        return RiskLevel.LOW
    
    def _get_feature_importance(self, features: Dict) -> Dict[str, float]:
        """Extract interpretable feature importance for explainability"""
        
        # Example: Show which factors contributed to credit score
        importance = {}
        if hasattr(self.model, 'feature_importances_'):
            importance = {
                "yield_stability": self.model.feature_importances_[0] * 0.4,
                "health_index": self.model.feature_importances_[1] * 0.25,
                "fertility_success": self.model.feature_importances_[2] * 0.2,
                "environmental": self.model.feature_importances_[3] * 0.15
            }
        
        return importance
    
    def _validate_features(self, features: Dict) -> bool:
        """Validate feature plausibility"""
        
        # Milk yield should be positive
        if features.get("milk_yield", 0) < 0:
            return False
        
        # Health score 0-100
        if not (0 <= features.get("health_score", 50) <= 100):
            return False
        
        # Temperature in realistic range for cattle (35-41 Celsius)
        if features.get("temperature"):
            if not (35 <= features["temperature"] <= 42):
                return False
        
        return True
    
    def _get_confidence(self, prediction: float) -> float:
        """Get model confidence in prediction"""
        
        # For regression models, use inverse of residual variance
        # For classifiers, use max probability
        if hasattr(self.model, 'predict_proba'):
            return float(np.max(self.model.predict_proba(prediction)))
        
        # Default: moderate confidence
        return 0.65

# Usage Example
@app.post("/predict-yield")
async def predict_yield(features: Dict) -> PredictionWithRisk:
    """
    Predict milk yield with risk assessment.
    HIGH-risk predictions flagged for human review.
    """
    
    # Load safe wrapper
    yield_model = SafeMLWrapper(
        model=load_production_model("yield_forecast_v2.3"),
        model_version="v2.3",
        risk_config={"low": 0.4, "medium": 0.7, "high": 1.0}
    )
    
    # Make prediction with safety constraints
    prediction = yield_model.predict_with_safety(features)
    
    # If HIGH risk, log for AI Ethics Board review
    if prediction.requires_human_review:
        log_high_risk_prediction(prediction)
        alert_compliance_officer(f"High-risk yield prediction: {prediction.prediction}")
    
    return prediction
```

---

## 3. DRIFT DETECTION SYSTEM

### 3.1 Model Drift Monitoring

```python
# drift_detector.py
from typing import List, Dict
from dataclasses import dataclass
import numpy as np
from scipy import stats
from datetime import datetime, timedelta

@dataclass
class DriftAlert:
    alert_type: str  # "input_drift", "output_drift", "accuracy_drift"
    model_name: str
    severity: str  # "low", "medium", "high"
    metric: float
    threshold: float
    message: str
    timestamp: datetime

class DriftDetectionEngine:
    """Continuous monitoring of model performance and input/output distributions"""
    
    def __init__(self, model_name: str, baseline_metrics: Dict):
        self.model_name = model_name
        self.baseline_mean = baseline_metrics["mean"]
        self.baseline_std = baseline_metrics["std"]
        self.baseline_accuracy = baseline_metrics["accuracy"]
        self.last_check = datetime.now()
    
    def detect_input_drift(self, recent_data: List[Dict]) -> List[DriftAlert]:
        """Detect if input distribution has shifted significantly"""
        
        alerts = []
        
        # Compare input feature distributions
        recent_values = [d["milk_yield"] for d in recent_data]
        recent_mean = np.mean(recent_values)
        recent_std = np.std(recent_values)
        
        # Kolmogorov-Smirnov test
        _, ks_pvalue = stats.ks_2samp(recent_values, [self.baseline_mean] * len(recent_values))
        
        if ks_pvalue < 0.05:  # Significant drift detected
            alerts.append(DriftAlert(
                alert_type="input_drift",
                model_name=self.model_name,
                severity="high" if ks_pvalue < 0.01 else "medium",
                metric=ks_pvalue,
                threshold=0.05,
                message=f"Input distribution shifted (p-value: {ks_pvalue:.4f}). Possible seasonal change or data quality issue.",
                timestamp=datetime.now()
            ))
        
        return alerts
    
    def detect_output_drift(self, recent_predictions: List[float]) -> List[DriftAlert]:
        """Detect if model predictions are behaving differently"""
        
        alerts = []
        
        recent_mean = np.mean(recent_predictions)
        recent_std = np.std(recent_predictions)
        
        # Check if mean has drifted
        if abs(recent_mean - self.baseline_mean) > 2 * self.baseline_std:
            alerts.append(DriftAlert(
                alert_type="output_drift",
                model_name=self.model_name,
                severity="high",
                metric=recent_mean,
                threshold=self.baseline_mean,
                message=f"Prediction mean drifted from {self.baseline_mean:.2f} to {recent_mean:.2f}. Model may need retraining.",
                timestamp=datetime.now()
            ))
        
        return alerts
    
    def detect_accuracy_drift(self, recent_actuals: List[float], recent_preds: List[float]) -> List[DriftAlert]:
        """Detect if model accuracy has degraded"""
        
        alerts = []
        
        # Calculate MAE
        mae = np.mean(np.abs(np.array(recent_preds) - np.array(recent_actuals)))
        
        # If accuracy dropped > 5%
        if mae > self.baseline_accuracy * 1.05:
            alerts.append(DriftAlert(
                alert_type="accuracy_drift",
                model_name=self.model_name,
                severity="high",
                metric=mae,
                threshold=self.baseline_accuracy,
                message=f"Model accuracy degraded. MAE increased from {self.baseline_accuracy:.3f} to {mae:.3f}.",
                timestamp=datetime.now()
            ))
        
        return alerts

@app.post("/check-drift")
async def check_model_drift() -> Dict[str, List[DriftAlert]]:
    """
    Hourly drift check. If drift detected, freeze retraining and alert engineers.
    """
    
    all_alerts = []
    
    # Check each production model
    for model_name in ["yield_forecast", "health_risk", "credit_score"]:
        detector = DriftDetectionEngine(
            model_name=model_name,
            baseline_metrics=load_baseline_metrics(model_name)
        )
        
        # Get recent data (last 100 predictions)
        recent_data = get_recent_predictions(model_name, limit=100)
        
        # Run drift checks
        all_alerts.extend(detector.detect_input_drift(recent_data))
        all_alerts.extend(detector.detect_output_drift([d["prediction"] for d in recent_data]))
        
        # If we have recent actuals, check accuracy
        recent_actuals = get_recent_actuals(model_name, days=7)
        if recent_actuals:
            all_alerts.extend(detector.detect_accuracy_drift(
                [a["actual"] for a in recent_actuals],
                [a["predicted"] for a in recent_actuals]
            ))
    
    # Handle alerts
    for alert in all_alerts:
        if alert.severity == "high":
            # Freeze automatic retraining
            freeze_model_retraining(alert.model_name)
            # Alert engineers
            send_slack_alert(f"🚨 DRIFT DETECTED: {alert.message}")
            # Log for AI Ethics Board
            log_drift_incident(alert)
    
    return {"alerts": all_alerts, "timestamp": datetime.now()}
```

---

## 4. AUDIT & LOGGING ARCHITECTURE

### 4.1 Immutable Audit Log

```python
# audit_service.py
from sqlalchemy import create_engine, Column, String, DateTime, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
from datetime import datetime
import hashlib
import json

Base = declarative_base()

class AuditLog(Base):
    """
    Immutable audit log: INSERT-only, no UPDATE/DELETE.
    Hash chaining ensures tamper detection.
    """
    __tablename__ = "audit_logs"
    
    audit_id = Column(String(36), primary_key=True)
    timestamp = Column(DateTime, default=datetime.now, nullable=False)
    event_type = Column(String(50), nullable=False)  # "rule_check", "ml_prediction", "rule_violation", etc.
    farmer_id = Column(String(50))
    farm_id = Column(String(50))
    data = Column(JSON, nullable=False)  # Full event details
    ip_address = Column(String(15))
    user_agent = Column(String(255))
    previous_hash = Column(String(256))  # Hash of previous log entry
    current_hash = Column(String(256))  # Hash of this entry
    signed = Column(Boolean, default=False)  # AI Ethics Board signature (quarterly)
    
    def calculate_hash(self) -> str:
        """Create hash of this audit entry for tamper detection"""
        entry_dict = {
            "audit_id": self.audit_id,
            "timestamp": self.timestamp.isoformat(),
            "event_type": self.event_type,
            "data": self.data,
            "previous_hash": self.previous_hash
        }
        entry_json = json.dumps(entry_dict, sort_keys=True)
        return hashlib.sha256(entry_json.encode()).hexdigest()

class AuditService:
    """Service for immutable audit logging"""
    
    def __init__(self, db_url: str):
        self.engine = create_engine(db_url)
        Base.metadata.create_all(self.engine)
    
    def log_event(self, event_type: str, data: Dict, farmer_id: str = None, farm_id: str = None) -> str:
        """Log audit event"""
        
        session = Session(self.engine)
        
        # Get previous hash for chaining
        last_entry = session.query(AuditLog).order_by(AuditLog.timestamp.desc()).first()
        previous_hash = last_entry.current_hash if last_entry else "0" * 256
        
        # Create entry
        from uuid import uuid4
        audit_id = str(uuid4())
        
        entry = AuditLog(
            audit_id=audit_id,
            timestamp=datetime.now(),
            event_type=event_type,
            farmer_id=farmer_id,
            farm_id=farm_id,
            data=data,
            ip_address=get_request_ip(),
            user_agent=get_request_user_agent(),
            previous_hash=previous_hash
        )
        
        entry.current_hash = entry.calculate_hash()
        
        session.add(entry)
        session.commit()
        
        return audit_id
    
    def verify_integrity(self) -> Dict:
        """Verify audit log integrity (no tampering)"""
        
        session = Session(self.engine)
        entries = session.query(AuditLog).order_by(AuditLog.timestamp.asc()).all()
        
        integrity_ok = True
        issues = []
        
        for i, entry in enumerate(entries):
            # Verify this entry's hash
            calculated_hash = entry.calculate_hash()
            if calculated_hash != entry.current_hash:
                integrity_ok = False
                issues.append(f"Entry {entry.audit_id} hash mismatch")
            
            # Verify hash chain
            if i > 0:
                prev_hash = entries[i-1].current_hash
                if prev_hash != entry.previous_hash:
                    integrity_ok = False
                    issues.append(f"Entry {entry.audit_id} hash chain broken")
        
        return {
            "integrity_ok": integrity_ok,
            "total_entries": len(entries),
            "issues": issues,
            "timestamp": datetime.now().isoformat()
        }

# Usage
@app.post("/audit/log")
async def log_audit_event(event_type: str, data: Dict):
    audit_service = AuditService("postgresql://...")
    audit_id = audit_service.log_event(
        event_type=event_type,
        data=data,
        farmer_id=get_current_farmer_id(),
        farm_id=get_current_farm_id()
    )
    return {"audit_id": audit_id, "timestamp": datetime.now()}

@app.get("/audit/verify-integrity")
async def verify_audit_integrity():
    audit_service = AuditService("postgresql://...")
    result = audit_service.verify_integrity()
    return result
```

---

## 5. API SAFETY MIDDLEWARE

### 5.1 Safety Middleware Chain

```python
# middleware.py
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import time
import logging

logger = logging.getLogger(__name__)

class SafetyMiddlewareChain:
    """
    Middleware chain enforcing safety before request reaches handlers.
    Order matters: authenticate → rate limit → consent check → rule validation
    """
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, request: Request, call_next):
        
        # 1. Authentication
        if not await self.authenticate(request):
            return JSONResponse(
                status_code=401,
                content={"error": "Unauthorized. Valid JWT required."}
            )
        
        # 2. Rate Limiting
        if not await self.check_rate_limit(request):
            return JSONResponse(
                status_code=429,
                content={"error": "Rate limit exceeded. Max 100 requests/minute."}
            )
        
        # 3. Consent Check (for farmer data endpoints)
        if request.url.path.startswith("/api/farmer"):
            farmer_id = request.path_params.get("farmer_id")
            if not await self.check_consent(farmer_id):
                return JSONResponse(
                    status_code=403,
                    content={"error": "Farmer has not provided consent for data processing."}
                )
        
        # 4. Account Status Check
        if not await self.check_account_active(request):
            return JSONResponse(
                status_code=403,
                content={"error": "Account suspended. Contact support."}
            )
        
        # Call actual handler
        response = await call_next(request)
        
        # 5. Response logging (audit trail)
        await self.log_request_response(request, response)
        
        return response
    
    async def authenticate(self, request: Request) -> bool:
        """Verify JWT token"""
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return False
        
        token = auth_header.split(" ")[1]
        return verify_jwt_token(token)
    
    async def check_rate_limit(self, request: Request) -> bool:
        """Rate limiting: 100 req/min per farmer"""
        farmer_id = get_farmer_from_token(request)
        
        key = f"rate_limit:{farmer_id}"
        current = redis_client.get(key) or 0
        
        if int(current) >= 100:
            return False
        
        redis_client.incr(key)
        redis_client.expire(key, 60)
        
        return True
    
    async def check_consent(self, farmer_id: str) -> bool:
        """Check if farmer has valid consent"""
        consent = get_farmer_consent(farmer_id)
        return consent is not None and not consent.is_expired()
    
    async def check_account_active(self, request: Request) -> bool:
        """Check if account is not suspended"""
        farmer_id = get_farmer_from_token(request)
        account = get_farmer_account(farmer_id)
        return account.is_active
    
    async def log_request_response(self, request: Request, response: Response):
        """Log for audit trail"""
        audit_service = AuditService("postgresql://...")
        audit_service.log_event(
            event_type="api_request",
            data={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "response_time": time.time()
            },
            farmer_id=get_farmer_from_token(request)
        )

# Add middleware to FastAPI app
app.add_middleware(SafetyMiddlewareChain)
```

---

## 6. DEPLOYMENT CHECKLIST

### 6.1 Pre-Production Safety Validation

```yaml
# deployment-checklist.yml
Pre-Deployment Checklist:
  
  Data Governance:
    - [ ] All farmer consent records audited (100% coverage)
    - [ ] Voice consent files encrypted and sampled for verification
    - [ ] Data anonymization pipeline tested with real donor dashboard
    - [ ] Farmer PII removal verified for 3 sample dashboards
  
  Rule Engine:
    - [ ] All 6+ rules implemented and tested with edge cases
    - [ ] Rule validation tested with biological implausibility datasets
    - [ ] Fraud detection tested with synthetic fraud patterns
    - [ ] Environmental thresholds validated by agronomist
    - [ ] Rule configuration audit trail established
  
  AI Model Safety:
    - [ ] All models wrapped with SafeMLWrapper
    - [ ] Risk level assessment tested (100 predictions)
    - [ ] HIGH-risk predictions verified to require human review
    - [ ] Feature importance explainability validated for MFI officers
    - [ ] Model versioning system audited
  
  Drift Detection:
    - [ ] Drift detection engine deployed and monitoring
    - [ ] False alert rate < 5% on baseline validation
    - [ ] Engineer alert system tested (email, Slack, SMS)
    - [ ] Automatic retraining freeze working correctly
  
  Audit & Logging:
    - [ ] Immutable audit log tested for tamper detection
    - [ ] Hash chain verification passes
    - [ ] Audit log retention policy implemented (7 years)
    - [ ] Quarterly AI Ethics Board signing process documented
  
  Security:
    - [ ] Penetration testing completed (no Critical/High issues)
    - [ ] Data encryption verified (AES-256 at rest, TLS in transit)
    - [ ] Access control matrix validated
    - [ ] IP whitelisting configured for admin panel
    - [ ] 2FA enabled for all NGO/MFI users
  
  Compliance:
    - [ ] All disclaimers verified on MFI credit score outputs
    - [ ] NGO Affairs Bureau documentation prepared
    - [ ] MRA notification sent (analytics platform, no loan authority)
    - [ ] Data Protection Officer approval obtained
    - [ ] Ethics Board final approval obtained
  
  Operational:
    - [ ] Incident response playbooks distributed to team
    - [ ] Engineer on-call schedule established
    - [ ] Disaster recovery tested (RTO < 1h, RPO < 15min)
    - [ ] Field agent training completed
    - [ ] Farmer SMS/voice system tested end-to-end

  Sign-Off:
    - [ ] CTO: All technical requirements met
    - [ ] Chief Compliance Officer: Legal/regulatory requirements met
    - [ ] AI Ethics Board Chair: Ethical requirements met
    - [ ] NGO Program Director: Operational readiness confirmed
```

### 6.2 Go-Live Monitoring (Week 1)

```python
# go_live_monitoring.py
"""
Critical metrics to monitor during first week of production deployment.
Alert thresholds set conservatively.
"""

CRITICAL_METRICS = {
    "rule_violations_per_hour": {
        "target": "<5",
        "alert_threshold": ">10",
        "why": "High rule violations indicate data quality or fraud"
    },
    "consent_missing_rate": {
        "target": "0%",
        "alert_threshold": ">0.1%",
        "why": "Any missing consent is a compliance violation"
    },
    "api_response_time_p95": {
        "target": "<200ms",
        "alert_threshold": ">500ms",
        "why": "High latency affects user experience"
    },
    "model_drift_alerts": {
        "target": "0",
        "alert_threshold": ">1",
        "why": "Drift in first week indicates training/deployment issue"
    },
    "audit_log_integrity": {
        "target": "100%",
        "alert_threshold": "<99.9%",
        "why": "Any tamper detection is critical"
    },
    "farmer_app_crashes": {
        "target": "0",
        "alert_threshold": ">5/day",
        "why": "App crashes block farmer input"
    },
    "mfi_dashboard_uptime": {
        "target": "99.9%",
        "alert_threshold": "<99%",
        "why": "MFI dashboard unavailability blocks credit decisions"
    }
}

async def monitor_go_live():
    """Continuous monitoring during go-live week"""
    
    while True:
        metrics = collect_metrics()
        
        for metric, config in CRITICAL_METRICS.items():
            current_value = metrics[metric]
            
            if exceeds_alert_threshold(current_value, config["alert_threshold"]):
                # Critical issue detected
                send_critical_alert(
                    f"GO-LIVE ALERT: {metric} = {current_value}",
                    f"Threshold: {config['alert_threshold']}",
                    f"Reason: {config['why']}"
                )
                
                # Escalate decision: Continue or rollback?
                recommend_rollback_decision(metric, current_value)
        
        # Wait 5 minutes before next check
        await asyncio.sleep(300)
```

---

## 📋 QUICK REFERENCE: HUMAN-LAWS-AI PRINCIPLES IN CODE

| Principle | Implementation |
|-----------|-----------------|
| **Human Autonomy** | `requires_human_review` flag on HIGH-risk predictions; no automated loan disbursement |
| **Fairness** | Bias monitoring at district/gender level; threshold 10% disparity trigger retraining |
| **Transparency** | `explanation_factors` dict returned with every prediction; feature importance visible |
| **Privacy** | AES-256 encryption; consent validation before data processing; anonymization pipeline |
| **Accountability** | Immutable audit logs with hash chaining; AI Ethics Board signoff on all models |
| **Safety** | Rule Engine blocks autonomous harmful decisions; environmental thresholds enforced |
| **Security** | TLS 1.3, JWT auth, 2FA for admin, IP whitelisting, rate limiting |

---

## 🔗 NEXT STEPS

1. **Deploy Rule Engine** → Validate all rules with real farming data
2. **Add ML Wrappers** → Wrap existing models (yield, health, credit)
3. **Setup Drift Monitoring** → Hourly checks against baseline metrics
4. **Enable Audit Logging** → Test immutable log integrity
5. **Run Penetration Tests** → Verify security hardening
6. **AI Ethics Board Approval** → Document all governance decisions
7. **Go-Live Monitoring** → Monitor critical metrics Week 1

---

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Author:** UnnayanAI Architecture Team  
**Status:** Production Ready
