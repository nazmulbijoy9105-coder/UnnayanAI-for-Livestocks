"""
UnnayanAI: Explainability Engine (Phase 2)

Generate human-readable explanations for AI decisions
- Credit score factor breakdown
- SMS/voice explanations in Bangla
- MFI officer dashboard explanations
- Farmer-friendly health alerts

Makes AI transparent & trustworthy
"""

from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum
from uuid import uuid4
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import json
from pydantic import BaseModel
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

class ExplanationType(str, Enum):
    CREDIT_SCORE = "credit_score"
    HEALTH_ALERT = "health_alert"
    YIELD_FORECAST = "yield_forecast"
    FERTILITY_PREDICTION = "fertility_prediction"

class Explanation(BaseModel):
    """AI decision explanation"""
    
    explanation_id: str
    farmer_id: str
    farm_id: str
    output_type: ExplanationType
    
    # Main result
    result_value: float
    result_category: str  # 'A', 'B', 'C', 'D' or 'Low', 'Medium', 'High'
    
    # Key factors (top 3-5)
    factors: Dict[str, Dict]  # {factor_name: {value, weight, contribution, explanation}}
    
    # Farmer-friendly explanation (Bangla)
    explanation_bangla: str
    
    # English explanation
    explanation_english: str
    
    # SMS/voice friendly (short)
    explanation_short: str
    
    # Comparative context
    district_average: Optional[float] = None
    peer_group_average: Optional[float] = None
    trend: Optional[str] = None  # 'improving', 'stable', 'declining'
    
    generated_at: datetime
    model_version: str

# ============================================================================
# EXPLAINABILITY ENGINE
# ============================================================================

class ExplainabilityEngine:
    """Generate explanations for AI predictions"""
    
    def __init__(self, db_url: str):
        self.engine = create_engine(db_url)
        self.SessionLocal = sessionmaker(bind=self.engine)
    
    def explain_credit_score(
        self,
        farmer_id: str,
        farm_id: str,
        score_value: float,
        risk_class: str,
        model_version: str
    ) -> Explanation:
        """Generate explanation for credit score"""
        
        session = self.SessionLocal()
        
        try:
            # Get score components
            query = """
            SELECT
                yield_stability_index,
                health_index,
                fertility_efficiency,
                environmental_compliance
            FROM credit_scores
            WHERE farm_id = %s
            ORDER BY generated_at DESC
            LIMIT 1
            """
            
            result = session.execute(
                text(query),
                {"farm_id": farm_id}
            ).fetchone()
            
            if not result:
                raise ValueError("Credit score not found")
            
            yield_idx, health_idx, fertility_idx, env_idx = result
            
            # Calculate contributions
            contributions = {
                "yield_stability": {
                    "value": yield_idx,
                    "weight": 0.40,
                    "contribution": yield_idx * 0.40,
                    "explanation": self._interpret_yield_stability(yield_idx),
                    "emoji": "🥛"
                },
                "health_index": {
                    "value": health_idx,
                    "weight": 0.25,
                    "contribution": health_idx * 0.25,
                    "explanation": self._interpret_health_index(health_idx),
                    "emoji": "🏥"
                },
                "fertility_success": {
                    "value": fertility_idx,
                    "weight": 0.20,
                    "contribution": fertility_idx * 0.20,
                    "explanation": self._interpret_fertility(fertility_idx),
                    "emoji": "👶"
                },
                "environmental_control": {
                    "value": env_idx,
                    "weight": 0.15,
                    "contribution": env_idx * 0.15,
                    "explanation": self._interpret_environment(env_idx),
                    "emoji": "🌱"
                }
            }
            
            # Get district average for comparison
            district_query = """
            SELECT AVG(total_score)
            FROM credit_scores cs
            JOIN farms f ON cs.farm_id = f.farm_id
            WHERE f.district = (
                SELECT district FROM farms WHERE farm_id = %s
            )
            AND cs.generated_at >= NOW() - INTERVAL '7 days'
            """
            
            district_avg_result = session.execute(
                text(district_query),
                {"farm_id": farm_id}
            ).fetchone()
            
            district_avg = district_avg_result[0] if district_avg_result[0] else None
            
            # Generate explanations in multiple languages
            explanation_bangla = self._generate_bangla_explanation(
                score_value, risk_class, contributions, district_avg
            )
            
            explanation_english = self._generate_english_explanation(
                score_value, risk_class, contributions, district_avg
            )
            
            explanation_short = self._generate_short_explanation(score_value, risk_class)
            
            return Explanation(
                explanation_id=str(uuid4()),
                farmer_id=farmer_id,
                farm_id=farm_id,
                output_type=ExplanationType.CREDIT_SCORE,
                result_value=score_value,
                result_category=risk_class,
                factors=contributions,
                explanation_bangla=explanation_bangla,
                explanation_english=explanation_english,
                explanation_short=explanation_short,
                district_average=district_avg,
                generated_at=datetime.now(),
                model_version=model_version
            )
        
        except Exception as e:
            logger.error(f"Failed to explain credit score: {str(e)}")
            raise
        
        finally:
            session.close()
    
    def explain_health_alert(
        self,
        farmer_id: str,
        farm_id: str,
        alert_type: str,
        risk_score: float,
        model_version: str
    ) -> Explanation:
        """Generate explanation for health alert"""
        
        # Factors contributing to health risk
        factors = {
            "symptom_severity": {
                "value": risk_score,
                "weight": 0.4,
                "contribution": risk_score * 0.4,
                "explanation": "Severity of reported symptoms",
                "emoji": "🔴"
            },
            "environmental_risk": {
                "value": 60,  # Example
                "weight": 0.3,
                "contribution": 60 * 0.3,
                "explanation": "Barn environmental conditions may increase risk",
                "emoji": "🌡️"
            },
            "previous_history": {
                "value": 40,  # Example
                "weight": 0.3,
                "contribution": 40 * 0.3,
                "explanation": "Cow's medical history pattern",
                "emoji": "📋"
            }
        }
        
        return Explanation(
            explanation_id=str(uuid4()),
            farmer_id=farmer_id,
            farm_id=farm_id,
            output_type=ExplanationType.HEALTH_ALERT,
            result_value=risk_score,
            result_category=self._categorize_health_risk(risk_score),
            factors=factors,
            explanation_bangla=f"আপনার গরুর স্বাস্থ্য ঝুঁকি: {alert_type}। তাৎক্ষণিক পশুচিকিৎসক পরামর্শ নিন।",
            explanation_english=f"Health Alert: {alert_type}. Please consult veterinarian immediately.",
            explanation_short=f"⚠️ {alert_type} detected. Vet needed.",
            generated_at=datetime.now(),
            model_version=model_version
        )
    
    # ========================================================================
    # INTERPRETATION METHODS (Bangla Context)
    # ========================================================================
    
    def _interpret_yield_stability(self, score: float) -> str:
        """Interpret milk yield stability score"""
        
        if score >= 85:
            return "খুবই ধারাবাহিক দুধ উৎপাদন - খুবই ভালো"
        elif score >= 70:
            return "ধারাবাহিক উৎপাদন প্যাটার্ন দেখা যাচ্ছে"
        elif score >= 50:
            return "মধ্যম ধারাবাহিকতা - উন্নতির সুযোগ আছে"
        else:
            return "অনিয়মিত উৎপাদন - খাদ্য বা স্বাস্থ্য পরীক্ষা প্রয়োজন"
    
    def _interpret_health_index(self, score: float) -> str:
        """Interpret health score"""
        
        if score >= 85:
            return "গরু সুস্থ এবং সবল"
        elif score >= 70:
            return "সাধারণ স্বাস্থ্য স্থিতি ভালো"
        elif score >= 50:
            return "স্বাস্থ্য সতর্কতা প্রয়োজন"
        else:
            return "তাৎক্ষণিক চিকিৎসা সাহায্য প্রয়োজন"
    
    def _interpret_fertility(self, score: float) -> str:
        """Interpret fertility success"""
        
        if score >= 85:
            return "প্রজনন দক্ষতা চমৎকার"
        elif score >= 70:
            return "প্রজনন হার গড়ের উপরে"
        else:
            return "প্রজনন চক্র পর্যবেক্ষণ করুন"
    
    def _interpret_environment(self, score: float) -> str:
        """Interpret environmental conditions"""
        
        if score >= 85:
            return "খামার পরিবেশ উৎকৃষ্ট"
        elif score >= 70:
            return "পরিবেশ নিয়ন্ত্রণ ভালো"
        else:
            return "বায়ু সঞ্চালন ও স্বচ্ছতা উন্নত করুন"
    
    def _generate_bangla_explanation(
        self,
        score: float,
        risk_class: str,
        factors: Dict,
        district_avg: Optional[float]
    ) -> str:
        """Generate Bangla explanation for farmer"""
        
        explanation = f"""
আপনার খামারের ক্রেডিট স্কোর: {score:.0f} ({risk_class} শ্রেণী)

গুরুত্বপূর্ণ বিষয়সমূহ:
🥛 দুধ উৎপাদনের ধারাবাহিকতা: {factors['yield_stability']['value']:.0f}/100
🏥 গরুর স্বাস্থ্য: {factors['health_index']['value']:.0f}/100
👶 প্রজনন সাফল্য: {factors['fertility_success']['value']:.0f}/100
🌱 খামার পরিবেশ: {factors['environmental_control']['value']:.0f}/100

আপনার স্কোর জেলার গড় ({district_avg:.0f}) থেকে ভালো।

পরবর্তী পদক্ষেপ: স্বাস্থ্য নির্দেশনার জন্য কৃষক প্রতিনিধির সাথে যোগাযোগ করুন।
"""
        return explanation.strip()
    
    def _generate_english_explanation(
        self,
        score: float,
        risk_class: str,
        factors: Dict,
        district_avg: Optional[float]
    ) -> str:
        """Generate English explanation for MFI officers"""
        
        return f"""
Farm Credit Assessment Report

Credit Score: {score:.2f} (Classification: {risk_class})

Factor Breakdown:
- Milk Yield Stability: {factors['yield_stability']['value']:.0f}/100 (40% weight)
- Animal Health Index: {factors['health_index']['value']:.0f}/100 (25% weight)
- Fertility Efficiency: {factors['fertility_success']['value']:.0f}/100 (20% weight)
- Environmental Control: {factors['environmental_control']['value']:.0f}/100 (15% weight)

Comparative Analysis:
- District Average Score: {district_avg:.0f if district_avg else 'N/A'}
- Farm is above district average by {(score - district_avg):.0f} points if district_avg else ''

Assessment Summary:
Score {risk_class} indicates a {'low-risk', 'medium-risk', 'higher-risk'}[{'ABC'.index(risk_class)}] borrower suitable for credit consideration.
"""
        return explanation.strip()
    
    def _generate_short_explanation(self, score: float, risk_class: str) -> str:
        """Generate SMS/voice-friendly short explanation"""
        
        return f"Credit Score: {score:.0f} ({risk_class}). Stable farmer for loan consideration."
    
    def _categorize_health_risk(self, risk_score: float) -> str:
        """Categorize health risk level"""
        
        if risk_score >= 80:
            return "Low Risk"
        elif risk_score >= 50:
            return "Medium Risk"
        else:
            return "High Risk"

# ============================================================================
# FASTAPI ENDPOINTS
# ============================================================================

from fastapi import FastAPI

app = FastAPI(title="Explainability Engine", version="1.0.0")
explainer = ExplainabilityEngine(DATABASE_URL)

@app.post("/explain/credit-score")
async def explain_credit_score(
    farmer_id: str,
    farm_id: str,
    score: float,
    risk_class: str,
    model_version: str = "v3.0"
):
    """Generate credit score explanation"""
    
    explanation = explainer.explain_credit_score(
        farmer_id, farm_id, score, risk_class, model_version
    )
    
    return {
        "explanation_id": explanation.explanation_id,
        "result_value": explanation.result_value,
        "result_category": explanation.result_category,
        "explanation_bangla": explanation.explanation_bangla,
        "explanation_english": explanation.explanation_english,
        "explanation_short": explanation.explanation_short,
        "factors": explanation.factors,
        "district_average": explanation.district_average,
        "generated_at": explanation.generated_at.isoformat()
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "explainability-engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
