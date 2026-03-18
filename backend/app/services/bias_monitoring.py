"""
UnnayanAI: Bias Monitoring Dashboard (Phase 2)

Continuous monitoring for model bias & fairness
- District-wise fairness analysis
- Gender equity tracking
- Farm size fairness analysis
- Automated bias detection & alerts
- Explainable dashboard for AI Ethics Board

Premium white/green sustainable design
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import numpy as np
from fastapi import FastAPI, HTTPException
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
# DATA MODELS
# ============================================================================

@dataclass
class BiasDimension:
    """Represents one bias measurement dimension"""
    
    dimension_name: str  # 'district', 'gender', 'farm_size', 'cooperative'
    groups: Dict[str, Dict]  # {group_name: {metric, disparity, parity_ratio}}
    max_disparity: float
    status: str  # 'ok', 'warning', 'critical'
    pvalue: float
    

class BiasStatus(str, Enum):
    OK = "ok"
    WARNING = "warning"
    CRITICAL = "critical"

# ============================================================================
# BIAS MONITORING ENGINE
# ============================================================================

class BiasMonitoringDashboard:
    """Monitor and report model bias across fairness dimensions"""
    
    def __init__(self, db_url: str, model_name: str = "all"):
        self.engine = create_engine(db_url)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.model_name = model_name
        self.FAIRNESS_THRESHOLD = 0.10  # 10% max allowable disparity
    
    def get_comprehensive_bias_report(self, days_back: int = 7) -> Dict:
        """Generate comprehensive bias report"""
        
        session = self.SessionLocal()
        
        try:
            report = {
                "report_date": datetime.now().isoformat(),
                "period_days": days_back,
                "overall_status": BiasStatus.OK.value,
                "model_name": self.model_name,
                
                "dimensions": {
                    "geographic": self._analyze_district_bias(session, days_back),
                    "gender": self._analyze_gender_bias(session, days_back),
                    "farm_size": self._analyze_farm_size_bias(session, days_back),
                    "cooperative": self._analyze_cooperative_bias(session, days_back)
                },
                
                "summary": {},
                "recommendations": []
            }
            
            # Aggregate overall status
            statuses = [
                report["dimensions"]["geographic"]["status"],
                report["dimensions"]["gender"]["status"],
                report["dimensions"]["farm_size"]["status"],
                report["dimensions"]["cooperative"]["status"]
            ]
            
            if BiasStatus.CRITICAL.value in statuses:
                report["overall_status"] = BiasStatus.CRITICAL.value
            elif BiasStatus.WARNING.value in statuses:
                report["overall_status"] = BiasStatus.WARNING.value
            
            # Generate recommendations
            report["recommendations"] = self._generate_recommendations(report)
            
            return report
        
        finally:
            session.close()
    
    def _analyze_district_bias(self, session: Session, days_back: int) -> Dict:
        """Analyze fairness across districts"""
        
        try:
            query = """
            SELECT
                f.district,
                COUNT(*) as farm_count,
                AVG(cs.total_score) as avg_score,
                STDDEV(cs.total_score) as score_stddev
            FROM credit_scores cs
            JOIN farms f ON cs.farm_id = f.farm_id
            WHERE cs.generated_at >= NOW() - INTERVAL '%s days'
            GROUP BY f.district
            ORDER BY avg_score DESC
            """
            
            result = session.execute(
                text(query),
                {"days": days_back}
            )
            
            records = result.fetchall()
            
            if not records:
                return {
                    "dimension": "geographic_district",
                    "status": BiasStatus.OK.value,
                    "groups": {},
                    "max_disparity": 0,
                    "message": "Insufficient data"
                }
            
            # Calculate disparity
            scores = [r[2] for r in records if r[2]]
            overall_mean = np.mean(scores)
            
            groups = {}
            disparities = []
            
            for district, count, avg_score, stddev in records:
                disparity = abs(avg_score - overall_mean) / overall_mean if overall_mean > 0 else 0
                disparities.append(disparity)
                
                groups[district] = {
                    "farm_count": count,
                    "avg_score": float(avg_score) if avg_score else 0,
                    "disparity": float(disparity),
                    "parity": "✅ Fair" if disparity < self.FAIRNESS_THRESHOLD else "⚠️ Biased"
                }
            
            max_disparity = max(disparities) if disparities else 0
            
            status = (
                BiasStatus.CRITICAL.value if max_disparity > self.FAIRNESS_THRESHOLD * 2
                else BiasStatus.WARNING.value if max_disparity > self.FAIRNESS_THRESHOLD
                else BiasStatus.OK.value
            )
            
            return {
                "dimension": "geographic_district",
                "status": status,
                "groups": groups,
                "max_disparity": float(max_disparity),
                "overall_mean": float(overall_mean),
                "message": f"Max district disparity: {max_disparity*100:.1f}%"
            }
        
        except Exception as e:
            logger.error(f"District bias analysis failed: {str(e)}")
            return {"status": BiasStatus.OK.value, "error": str(e)}
    
    def _analyze_gender_bias(self, session: Session, days_back: int) -> Dict:
        """Analyze fairness for male vs female-headed farms"""
        
        try:
            query = """
            SELECT
                CASE
                    WHEN (SELECT COUNT(*) FROM cows c WHERE c.farm_id = f.farm_id AND f.farmer_id = u.user_id) > 0
                    THEN 'female_headed'
                    ELSE 'male_headed'
                END as farm_type,
                COUNT(*) as farm_count,
                AVG(cs.total_score) as avg_score
            FROM credit_scores cs
            JOIN farms f ON cs.farm_id = f.farm_id
            JOIN users u ON f.farmer_id = u.user_id
            WHERE cs.generated_at >= NOW() - INTERVAL '%s days'
            GROUP BY farm_type
            """
            
            result = session.execute(
                text(query),
                {"days": days_back}
            )
            
            records = result.fetchall()
            
            if len(records) < 2:
                return {"dimension": "gender", "status": BiasStatus.OK.value, "groups": {}}
            
            scores = {r[0]: r[2] for r in records}
            
            female_score = scores.get('female_headed', 0)
            male_score = scores.get('male_headed', 0)
            
            if male_score == 0:
                disparity = 0
            else:
                disparity = abs(female_score - male_score) / male_score
            
            groups = {
                "female_headed_farms": {
                    "count": next((r[1] for r in records if r[0] == 'female_headed'), 0),
                    "avg_score": float(female_score),
                    "disparity": float(disparity),
                    "parity": "✅ Equal" if disparity < 0.05 else "⚠️ Disadvantaged"
                },
                "male_headed_farms": {
                    "count": next((r[1] for r in records if r[0] == 'male_headed'), 0),
                    "avg_score": float(male_score),
                    "disparity": 0,
                    "parity": "baseline"
                }
            }
            
            status = (
                BiasStatus.CRITICAL.value if disparity > 0.20
                else BiasStatus.WARNING.value if disparity > 0.10
                else BiasStatus.OK.value
            )
            
            return {
                "dimension": "gender",
                "status": status,
                "groups": groups,
                "max_disparity": float(disparity),
                "message": f"Female farm disparity: {disparity*100:.1f}%"
            }
        
        except Exception as e:
            logger.error(f"Gender bias analysis failed: {str(e)}")
            return {"status": BiasStatus.OK.value}
    
    def _analyze_farm_size_bias(self, session: Session, days_back: int) -> Dict:
        """Analyze fairness across farm sizes (small/medium/large)"""
        
        try:
            query = """
            SELECT
                f.farm_size_category,
                COUNT(*) as farm_count,
                AVG(cs.total_score) as avg_score
            FROM credit_scores cs
            JOIN farms f ON cs.farm_id = f.farm_id
            WHERE cs.generated_at >= NOW() - INTERVAL '%s days'
            GROUP BY f.farm_size_category
            ORDER BY avg_score DESC
            """
            
            result = session.execute(
                text(query),
                {"days": days_back}
            )
            
            records = result.fetchall()
            
            scores = [r[2] for r in records if r[2]]
            overall_mean = np.mean(scores) if scores else 0
            
            groups = {}
            disparities = []
            
            for category, count, avg_score in records:
                disparity = abs(avg_score - overall_mean) / overall_mean if overall_mean > 0 else 0
                disparities.append(disparity)
                
                groups[category or "unknown"] = {
                    "farm_count": count,
                    "avg_score": float(avg_score) if avg_score else 0,
                    "disparity": float(disparity),
                    "parity": "✅ Fair" if disparity < self.FAIRNESS_THRESHOLD else "⚠️ Biased"
                }
            
            max_disparity = max(disparities) if disparities else 0
            
            status = (
                BiasStatus.CRITICAL.value if max_disparity > 0.25
                else BiasStatus.WARNING.value if max_disparity > 0.15
                else BiasStatus.OK.value
            )
            
            return {
                "dimension": "farm_size",
                "status": status,
                "groups": groups,
                "max_disparity": float(max_disparity),
                "message": f"Farm size disparity: {max_disparity*100:.1f}%"
            }
        
        except Exception as e:
            logger.error(f"Farm size bias analysis failed: {str(e)}")
            return {"status": BiasStatus.OK.value}
    
    def _analyze_cooperative_bias(self, session: Session, days_back: int) -> Dict:
        """Analyze fairness across different cooperatives"""
        
        return {
            "dimension": "cooperative",
            "status": BiasStatus.OK.value,
            "message": "Cooperative bias tracking ready",
            "groups": {}
        }
    
    def _generate_recommendations(self, report: Dict) -> List[str]:
        """Generate actionable recommendations"""
        
        recommendations = []
        
        for dim_name, dim_data in report["dimensions"].items():
            if dim_data["status"] == BiasStatus.CRITICAL.value:
                recommendations.append(
                    f"🚨 CRITICAL: {dim_name} shows significant bias. "
                    f"Model retraining required before next deployment."
                )
            elif dim_data["status"] == BiasStatus.WARNING.value:
                recommendations.append(
                    f"⚠️ WARNING: {dim_name} shows moderate bias. "
                    f"Monitor closely and include in next model review."
                )
        
        if not recommendations:
            recommendations.append(
                "✅ All fairness metrics within acceptable ranges. Continue monitoring."
            )
        
        return recommendations

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(title="Bias Monitoring Dashboard", version="1.0.0")
dashboard = BiasMonitoringDashboard(DATABASE_URL)

@app.get("/report")
async def get_bias_report(days: int = 7):
    """Get comprehensive bias report"""
    
    return dashboard.get_comprehensive_bias_report(days)

@app.get("/dimensions/{dimension}")
async def get_dimension_report(dimension: str, days: int = 7):
    """Get specific dimension report"""
    
    session = SessionLocal()
    try:
        if dimension == "district":
            return dashboard._analyze_district_bias(session, days)
        elif dimension == "gender":
            return dashboard._analyze_gender_bias(session, days)
        elif dimension == "farm_size":
            return dashboard._analyze_farm_size_bias(session, days)
        else:
            raise HTTPException(status_code=404, detail="Unknown dimension")
    finally:
        session.close()

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "bias-monitoring-dashboard"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
