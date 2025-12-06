from typing import Optional
from pydantic import BaseModel

class BiometricBase(BaseModel):
    face_shape: Optional[str] = None
    skin_tone: Optional[str] = None
    undertone: Optional[str] = None
    body_shape: Optional[str] = None
    height_cm: Optional[float] = None

class BiometricCreate(BiometricBase):
    pass

class BiometricUpdate(BiometricBase):
    pass

class BiometricProfile(BiometricBase):
    id: int
    user_id: int

    model_config = {
        "from_attributes": True
    }
