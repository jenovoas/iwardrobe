from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core import database
from app.models import user as user_models
from app.models import biometrics as bio_models
from app.schemas import recommendation as schemas
from app.services.recommendation import RecommendationEngine
from app.routers.biometrics import get_current_user

router = APIRouter()

@router.get("/recommendations/me", response_model=schemas.RecommendationResponse)
async def get_my_recommendations(
    current_user: user_models.User = Depends(get_current_user), 
    db: AsyncSession = Depends(database.get_db)
):
    # Fetch user's biometric profile
    result = await db.execute(select(bio_models.BiometricProfile).where(bio_models.BiometricProfile.user_id == current_user.id))
    profile = result.scalars().first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Biometric profile not found. Please complete analysis first.")
    
    # Generate recommendations
    recommendations = RecommendationEngine.get_recommendations(profile)
    return recommendations
