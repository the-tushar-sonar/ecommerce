import re

from pydantic import BaseModel, Field, field_validator


class RecommendationRequest(BaseModel):
    user_id: str = Field(min_length=1)
    product_id: str = Field(min_length=1)
    limit: int = Field(default=5, ge=1, le=20)

    @field_validator("user_id", "product_id")
    @classmethod
    def validate_object_id(cls, value: str) -> str:
        if not re.fullmatch(r"[0-9a-fA-F]{24}", value):
            raise ValueError("ID must be a 24-character hexadecimal MongoDB ObjectId")

        return value


class RecommendationItem(BaseModel):
    product_id: str
    score: float


class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: list[RecommendationItem]
