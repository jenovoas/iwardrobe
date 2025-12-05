from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core import database, security
from app.models import biometrics as models
from app.models import user as user_models
from app.schemas import biometrics as schemas
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = security.jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except security.JWTError:
        raise credentials_exception
        
    result = await db.execute(select(user_models.User).where(user_models.User.email == email))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

@router.get("/biometrics/me", response_model=schemas.BiometricProfile)
async def read_my_biometrics(current_user: user_models.User = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.BiometricProfile).where(models.BiometricProfile.user_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Biometric profile not found")
    return profile

@router.post("/biometrics/me", response_model=schemas.BiometricProfile)
async def create_or_update_biometrics(
    biometrics: schemas.BiometricCreate, 
    current_user: user_models.User = Depends(get_current_user), 
    db: AsyncSession = Depends(database.get_db)
):
    result = await db.execute(select(models.BiometricProfile).where(models.BiometricProfile.user_id == current_user.id))
    profile = result.scalars().first()
    
    if profile:
        # Update existing
        for key, value in biometrics.dict(exclude_unset=True).items():
            setattr(profile, key, value)
    else:
        # Create new
        profile = models.BiometricProfile(**biometrics.dict(), user_id=current_user.id)
        db.add(profile)
    
    await db.commit()
    await db.refresh(profile)
    return profile
