import os
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import httpx
from app.core import database, security
from app.models import user as models
from app.schemas import user as schemas
from app.core.security import create_access_token, get_password_hash, authenticate_user, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(database.get_db)):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Google OAuth Settings
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

@router.get("/google/login")
async def login_google():
    return {
        "url": f"https://accounts.google.com/o/oauth2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&redirect_uri={GOOGLE_REDIRECT_URI}&scope=openid%20email%20profile&access_type=offline"
    }

@router.get("/google/callback")
async def callback_google(code: str, db: AsyncSession = Depends(database.get_db)):
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        response = await client.post(token_url, data=data)
        tokens = response.json()
        
        if "error" in tokens:
             raise HTTPException(status_code=400, detail=tokens.get("error_description"))

        access_token = tokens["access_token"]
        id_token = tokens["id_token"]

        # Get user info
        user_info_response = await client.get("https://www.googleapis.com/oauth2/v1/userinfo", headers={"Authorization": f"Bearer {access_token}"})
        user_info = user_info_response.json()
        
        email = user_info.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in Google account")

        # Check if user exists
        result = await db.execute(select(models.User).where(models.User.email == email))
        user = result.scalars().first()

        if not user:
            # Create user (password is not usable, but required by schema? We'll set a random one or handle it)
            # For MVP, we set a dummy password hash
            hashed_password = get_password_hash("google_oauth_user_" + code[:10]) 
            user = models.User(email=email, hashed_password=hashed_password)
            db.add(user)
            await db.commit()
            await db.refresh(user)

        # Create JWT
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        jwt_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        # Redirect to frontend with token
        return RedirectResponse(url=f"{FRONTEND_URL}?token={jwt_token}")

@router.post("/users/", response_model=schemas.User)
async def create_user(user: schemas.UserCreate, db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.User).where(models.User.email == user.email))
    db_user = result.scalars().first()
    
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password, full_name=user.full_name)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user
