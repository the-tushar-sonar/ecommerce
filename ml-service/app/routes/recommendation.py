from fastapi import APIRouter

from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
)
from app.services.recommendation import get_recommendations

router = APIRouter(
    prefix="/api/v1/recommendations",
    tags=["Recommendations"],
)


@router.post("", response_model=RecommendationResponse)
async def recommend_products(
    request: RecommendationRequest,
):
    recommendations = await get_recommendations(
        user_id=request.user_id,
        product_id=request.product_id,
        limit=request.limit,
    )

    return RecommendationResponse(
        user_id=request.user_id,
        recommendations=recommendations,
    )
