from typing import List
from pydantic import BaseModel

class RecommendationResponse(BaseModel):
    colors: List[str]
    styles: List[str]
    tips: List[str]
