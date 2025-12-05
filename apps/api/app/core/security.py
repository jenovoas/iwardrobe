import os
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    """
    Autentica un usuario por email y contraseña usando una sesión asíncrona.
    Retorna el objeto `User` si existe, está activo y la contraseña es correcta;
    en cualquier otro caso retorna `None`.
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        return None
    if not getattr(user, "is_active", True):
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
