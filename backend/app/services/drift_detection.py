"""
UnnayanAI: Drift Detection System (Phase 2)

Continuous monitoring of ML model behavior
- Input distribution shifts
- Output distribution changes  
- Accuracy degradation
- Automatic alerts & model freezing

Production-ready for live deployment
"""

from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import asyncio
import logging
from scipy import stats
import numpy as np
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import json
from uuid import uuid4
import os
from dotenv import load_dotenv
from enum import Enum

load_dotenv()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://unnayan_app:CHANGE_THIS@localhost:5432/unnayan_production"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# ============================================================================
# ENUMS & DATA MODELS
# ============================================================================

class DriftType(str, Enum):
    INPUT_DRIFT = "input_drift"
    OUTPUT_DRIFT = "output_drift"
    ACCURACY_DRIFT = "accuracy_drift"
    COVARIATE_SHIFT = "covariate_shift"

class DriftSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class DriftAlert:
    """Alert when model drift detected"""
    
    alert_id: str
    model_name: str
    model_version: str
    drift_type: DriftType
    severity: DriftSeverity
    metric_name: str
    metric_value: float
    threshold_value: float
    p_value: float
    description: str
    detected_at: datetime
    auto_action: Optional[str] = None
    resolution_status: str = "open"

# ============================================================================
# DRIFT DETECTION ENGINE
# ============================================================================

class DriftDetectionEngine:
    """
    Production drift detection with multiple statistical tests.
    
    Tests:
    - Kolmogorov-Smirnov (input distribution)
    - Two-sample t-test (output mean shift)
    - Accuracy trending (performance degradation)
    - Covariate shift (feature drift)
    """
    
    def __init__(self, db_url: str, model_name: str, model_version: str):
        self.engine = create_engine(db_url)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.model_name = model_name
        self.model_version = model_version
        
        self.alerts: List[DriftAlert] = []
        self.baseline_metrics = self._load_baseline_metrics()
    
    # ========================================================================
    # 1. INPUT DRIFT DETECTION
    # ========================================================================
    
    def detect_input_drift(
        self,
        lookback_hours: int = 24,
        significance_level: float = 0.05
    ) -> List[DriftAlert]:
        """
        Detect if input feature distribution has shifted.
        
        Uses Kolmogorov-Smirnov test:
        - H0: Current data comes from same distribution as baseline
        - If p-value < 0.05: Reject H0, drift detected
        """
        
        alerts = []
        session = self.SessionLocal()
        
        try:
            # Get baseline distribution (first 30 days of training)
            baseline_query = """
            SELECT milk_yield, temperature, humidity
            FROM training_data_log
            WHERE model_version = %s
            AND timestamp BETWEEN NOW() - INTERVAL '30 days' AND NOW() - INTERVAL '27 days'
            LIMIT 10000
            """
            
            baseline_result = session.execute(
                text(baseline_query),
                {"model_version": self.model_version}
            )
            baseline_records = baseline_result.fetchall()
            
            if not baseline_records:
                logger.warning("No baseline data found for drift detection")
                return alerts
            
            baseline_yields = np.array([r[0] for r in baseline_records if r[0]])
            baseline_temps = np.array([r[1] for r in baseline_records if r[1]])
            
            # Get recent data (last 24 hours)
            recent_query = """
            SELECT milk_yield, temperature, humidity
            FROM milk_yield
            WHERE recorded_timestamp >= NOW() - INTERVAL '%s hours'
            LIMIT 10000
            """
            
            recent_result = session.execute(
                text(recent_query),
                {"lookback": lookback_hours}
            )
            recent_records = recent_result.fetchall()
            
            if not recent_records:
                return alerts
            
            recent_yields = np.array([r[0] for r in recent_records if r[0]])
            recent_temps = np.array([r[1] for r in recent_records if r[1]])
            
            # KS Test for Milk Yield
            ks_stat_yield, ks_pvalue_yield = stats.ks_2samp(baseline_yields, recent_yields)
            
            if ks_pvalue_yield < significance_level:
                severity = self._assess_drift_severity(ks_pvalue_yield)
                
                alert = DriftAlert(
                    alert_id=str(uuid4()),
                    model_name=self.model_name,
                    model_version=self.model_version,
                    drift_type=DriftType.INPUT_DRIFT,
                    severity=severity,
                    metric_name="milk_yield_distribution",
                    metric_value=ks_stat_yield,
                    threshold_value=0.05,
                    p_value=ks_pvalue_yield,
                    description=f"Milk yield input distribution shifted (p={ks_pvalue_yield:.4f}). "
                               f"Possible seasonal change or data quality issue.",
                    detected_at=datetime.now(),
                    auto_action="freeze_retraining" if severity == DriftSeverity.CRITICAL else None
                )
                
                alerts.append(alert)
                self._log_drift_alert(alert, session)
            
            # KS Test for Temperature
            if len(baseline_temps) > 0 and len(recent_temps) > 0:
                ks_stat_temp, ks_pvalue_temp = stats.ks_2samp(baseline_temps, recent_temps)
                
                if ks_pvalue_temp < significance_level:
                    severity = self._assess_drift_severity(ks_pvalue_temp)
                    
                    alert = DriftAlert(
                        alert_id=str(uuid4()),
                        model_name=self.model_name,
                        model_version=self.model_version,
                        drift_type=DriftType.INPUT_DRIFT,
                        severity=severity,
                        metric_name="temperature_distribution",
                        metric_value=ks_stat_temp,
                        threshold_value=0.05,
                        p_value=ks_pvalue_temp,
                        description=f"Temperature input distribution shifted (p={ks_pvalue_temp:.4f}). "
                                   f"Possible seasonal or climate change.",
                        detected_at=datetime.now()
                    )
                    
                    alerts.append(alert)
                    self._log_drift_alert(alert, session)
            
            return alerts
        
        except Exception as e:
            logger.error(f"Input drift detection failed: {str(e)}", exc_info=True)
            return alerts
        
        finally:
            session.close()
    
    # ========================================================================
    # 2. OUTPUT DRIFT DETECTION
    # ========================================================================
    
    def detect_output_drift(
        self,
        lookback_hours: int = 24,
        threshold_std: float = 2.0
    ) -> List[DriftAlert]:
        """
        Detect if model predictions have shifted.
        
        Uses two-sample t-test:
        - H0: Mean of recent predictions = mean of baseline
        - If p-value < 0.05: Reject H0, predictions shifted
        """
        
        alerts = []
        session = self.SessionLocal()
        
        try:
            # Get baseline predictions (first 30 days)
            baseline_query = """
            SELECT prediction_value
            FROM model_predictions
            WHERE model_name = %s
            AND model_version = %s
            AND created_at BETWEEN NOW() - INTERVAL '30 days' AND NOW() - INTERVAL '27 days'
            LIMIT 5000
            """
            
            baseline_result = session.execute(
                text(baseline_query),
                {"model_name": self.model_name, "model_version": self.model_version}
            )
            baseline_preds = np.array([r[0] for r in baseline_result.fetchall()])
            
            if len(baseline_preds) < 100:
                return alerts
            
            baseline_mean = np.mean(baseline_preds)
            baseline_std = np.std(baseline_preds)
            
            # Get recent predictions
            recent_query = """
            SELECT prediction_value
            FROM model_predictions
            WHERE model_name = %s
            AND model_version = %s
            AND created_at >= NOW() - INTERVAL '%s hours'
            LIMIT 5000
            """
            
            recent_result = session.execute(
                text(recent_query),
                {
                    "model_name": self.model_name,
                    "model_version": self.model_version,
                    "lookback": lookback_hours
                }
            )
            recent_preds = np.array([r[0] for r in recent_result.fetchall()])
            
            if len(recent_preds) < 50:
                return alerts
            
            recent_mean = np.mean(recent_preds)
            
            # Two-sample t-test
            t_stat, t_pvalue = stats.ttest_ind(baseline_preds, recent_preds)
            
            # Check if mean shifted significantly
            std_diff = abs(recent_mean - baseline_mean) / baseline_std if baseline_std > 0 else 0
            
            if t_pvalue < 0.05 or std_diff > threshold_std:
                severity = DriftSeverity.HIGH if std_diff > threshold_std else DriftSeverity.MEDIUM
                
                alert = DriftAlert(
                    alert_id=str(uuid4()),
                    model_name=self.model_name,
                    model_version=self.model_version,
                    drift_type=DriftType.OUTPUT_DRIFT,
                    severity=severity,
                    metric_name="prediction_mean_shift",
                    metric_value=recent_mean,
                    threshold_value=baseline_mean,
                    p_value=t_pvalue,
                    description=f"Model predictions shifted from {baseline_mean:.2f} to {recent_mean:.2f}. "
                               f"(p={t_pvalue:.4f}, std_diff={std_diff:.2f}). "
                               f"Model may require retraining.",
                    detected_at=datetime.now(),
                    auto_action="freeze_retraining"
                )
                
                alerts.append(alert)
                self._log_drift_alert(alert, session)
            
            return alerts
        
        except Exception as e:
            logger.error(f"Output drift detection failed: {str(e)}", exc_info=True)
            return alerts
        
        finally:
            session.close()
    
    # ========================================================================
    # 3. ACCURACY DRIFT DETECTION
    # ========================================================================
    
    def detect_accuracy_drift(
        self,
        lookback_days: int = 7,
        degradation_threshold: float = 0.05
    ) -> List[DriftAlert]:
        """
        Detect if model accuracy has degraded over time.
        
        Compares:
        - Baseline MAE (from training)
        - Recent MAE (last 7 days)
        - Alert if recent > baseline * (1 + threshold)
        """
        
        alerts = []
        session = self.SessionLocal()
        
        try:
            baseline_mae = self.baseline_metrics.get(f"{self.model_name}_mae", 0)
            
            if baseline_mae == 0:
                return alerts
            
            # Get recent predictions with actual values
            recent_query = """
            SELECT
                mp.prediction_value,
                mp.actual_value,
                ABS(mp.prediction_value - mp.actual_value) as error
            FROM model_predictions mp
            WHERE mp.model_name = %s
            AND mp.model_version = %s
            AND mp.actual_value IS NOT NULL
            AND mp.created_at >= NOW() - INTERVAL '%s days'
            """
            
            recent_result = session.execute(
                text(recent_query),
                {
                    "model_name": self.model_name,
                    "model_version": self.model_version,
                    "lookback": lookback_days
                }
            )
            recent_records = recent_result.fetchall()
            
            if len(recent_records) < 50:
                return alerts
            
            recent_errors = np.array([r[2] for r in recent_records])
            recent_mae = np.mean(recent_errors)
            
            # Check degradation
            degradation = (recent_mae - baseline_mae) / baseline_mae if baseline_mae > 0 else 0
            
            if degradation > degradation_threshold:
                severity = DriftSeverity.CRITICAL if degradation > degradation_threshold * 2 else DriftSeverity.HIGH
                
                alert = DriftAlert(
                    alert_id=str(uuid4()),
                    model_name=self.model_name,
                    model_version=self.model_version,
                    drift_type=DriftType.ACCURACY_DRIFT,
                    severity=severity,
                    metric_name="mean_absolute_error",
                    metric_value=recent_mae,
                    threshold_value=baseline_mae,
                    p_value=degradation,
                    description=f"Model accuracy degraded. MAE increased from {baseline_mae:.3f} to {recent_mae:.3f} "
                               f"({degradation*100:.1f}% increase). Retraining recommended.",
                    detected_at=datetime.now(),
                    auto_action="freeze_retraining" if severity == DriftSeverity.CRITICAL else None
                )
                
                alerts.append(alert)
                self._log_drift_alert(alert, session)
            
            return alerts
        
        except Exception as e:
            logger.error(f"Accuracy drift detection failed: {str(e)}", exc_info=True)
            return alerts
        
        finally:
            session.close()
    
    # ========================================================================
    # HELPER METHODS
    # ========================================================================
    
    def _assess_drift_severity(self, p_value: float) -> DriftSeverity:
        """Convert p-value to severity"""
        
        if p_value < 0.001:
            return DriftSeverity.CRITICAL
        elif p_value < 0.01:
            return DriftSeverity.HIGH
        elif p_value < 0.05:
            return DriftSeverity.MEDIUM
        else:
            return DriftSeverity.LOW
    
    def _load_baseline_metrics(self) -> Dict:
        """Load baseline model metrics"""
        
        session = self.SessionLocal()
        
        try:
            query = """
            SELECT metric_mae, metric_rmse, metric_accuracy
            FROM model_registry
            WHERE model_name = %s
            AND model_version = %s
            AND in_production = true
            LIMIT 1
            """
            
            result = session.execute(
                text(query),
                {"model_name": self.model_name, "model_version": self.model_version}
            ).fetchone()
            
            if result:
                return {
                    f"{self.model_name}_mae": result[0],
                    f"{self.model_name}_rmse": result[1],
                    f"{self.model_name}_accuracy": result[2]
                }
            
            return {}
        
        except Exception as e:
            logger.error(f"Failed to load baseline metrics: {str(e)}")
            return {}
        
        finally:
            session.close()
    
    def _log_drift_alert(self, alert: DriftAlert, session: Session):
        """Log drift alert to database"""
        
        try:
            insert_query = """
            INSERT INTO drift_alerts (
                alert_id, model_name, model_version,
                alert_type, severity, metric_name,
                metric_value, threshold_value, pvalue,
                description, detected_at, resolution_status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            session.execute(
                text(insert_query),
                {
                    "alert_id": alert.alert_id,
                    "model_name": alert.model_name,
                    "model_version": alert.model_version,
                    "alert_type": alert.drift_type.value,
                    "severity": alert.severity.value,
                    "metric_name": alert.metric_name,
                    "metric_value": alert.metric_value,
                    "threshold_value": alert.threshold_value,
                    "pvalue": alert.p_value,
                    "description": alert.description,
                    "detected_at": alert.detected_at,
                    "resolution_status": alert.resolution_status
                }
            )
            
            session.commit()
            
            # Freeze retraining if critical
            if alert.auto_action == "freeze_retraining":
                self._freeze_model_retraining(alert.model_name, session)
            
            # Send alert
            self._send_drift_alert(alert)
            
        except Exception as e:
            logger.error(f"Failed to log drift alert: {str(e)}")
    
    def _freeze_model_retraining(self, model_name: str, session: Session):
        """Freeze automatic model retraining on critical drift"""
        
        try:
            update_query = """
            UPDATE model_registry
            SET in_production = false
            WHERE model_name = %s
            AND in_production = true
            """
            
            session.execute(text(update_query), {"model_name": model_name})
            session.commit()
            
            logger.critical(f"Model retraining FROZEN: {model_name}")
        
        except Exception as e:
            logger.error(f"Failed to freeze retraining: {str(e)}")
    
    def _send_drift_alert(self, alert: DriftAlert):
        """Send drift alert to engineers"""
        
        try:
            message = f"""
            🚨 DRIFT DETECTED: {alert.model_name}
            
            Type: {alert.drift_type.value}
            Severity: {alert.severity.value}
            Metric: {alert.metric_name}
            Value: {alert.metric_value:.4f}
            Threshold: {alert.threshold_value:.4f}
            P-value: {alert.p_value:.6f}
            
            Description: {alert.description}
            
            Auto Action: {alert.auto_action or 'None'}
            """
            
            logger.critical(message)
            # TODO: Send to Slack/email
        
        except Exception as e:
            logger.error(f"Failed to send drift alert: {str(e)}")

# ============================================================================
# HOURLY MONITORING JOB
# ============================================================================

async def hourly_drift_check():
    """Run hourly drift detection for all production models"""
    
    models_to_monitor = [
        ("yield_forecast", "v2.3"),
        ("health_risk", "v2.1"),
        ("credit_score", "v3.0")
    ]
    
    all_alerts = []
    
    for model_name, model_version in models_to_monitor:
        try:
            detector = DriftDetectionEngine(DATABASE_URL, model_name, model_version)
            
            # Run all drift checks
            input_alerts = detector.detect_input_drift()
            output_alerts = detector.detect_output_drift()
            accuracy_alerts = detector.detect_accuracy_drift()
            
            all_alerts.extend(input_alerts)
            all_alerts.extend(output_alerts)
            all_alerts.extend(accuracy_alerts)
            
            # Log checks
            logger.info(
                f"Drift check completed: {model_name}/{model_version} | "
                f"Alerts: {len(input_alerts) + len(output_alerts) + len(accuracy_alerts)}"
            )
        
        except Exception as e:
            logger.error(f"Drift detection failed for {model_name}: {str(e)}")
    
    return all_alerts

if __name__ == "__main__":
    # Test drift detection
    print("=== Drift Detection System ===")
    
    detector = DriftDetectionEngine(
        DATABASE_URL,
        "yield_forecast",
        "v2.3"
    )
    
    print("\nRunning input drift detection...")
    input_alerts = detector.detect_input_drift()
    print(f"Input drift alerts: {len(input_alerts)}")
    
    print("\nRunning output drift detection...")
    output_alerts = detector.detect_output_drift()
    print(f"Output drift alerts: {len(output_alerts)}")
    
    print("\nRunning accuracy drift detection...")
    accuracy_alerts = detector.detect_accuracy_drift()
    print(f"Accuracy drift alerts: {len(accuracy_alerts)}")
    
    print(f"\nTotal alerts: {len(input_alerts) + len(output_alerts) + len(accuracy_alerts)}")
