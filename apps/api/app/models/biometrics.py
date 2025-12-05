from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class BiometricProfile(Base):
    __tablename__ = "biometric_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Facial Analysis
    face_shape = Column(String, nullable=True) # e.g., Oval, Square, Heart
    skin_tone = Column(String, nullable=True) # Hex code or category
    undertone = Column(String, nullable=True) # Warm, Cool, Neutral
    
    # Body Analysis
    body_shape = Column(String, nullable=True) # e.g., Hourglass, Rectangle
    height_cm = Column(Float, nullable=True)
    
    user = relationship("User", back_populates="biometric_profile")

# Update User model to include relationship (monkey-patching for now or need to update user.py)
# Ideally we update user.py, but for now we can rely on back_populates if we import this model.
