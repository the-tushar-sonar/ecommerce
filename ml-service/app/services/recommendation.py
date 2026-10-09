from app.services.user import get_user_behavior_products

from fastapi import HTTPException

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.schemas.recommendation import RecommendationItem
from app.services.product import (
    get_active_product,
    get_active_products,
)

TEXT_WEIGHT = 0.60
CATEGORY_WEIGHT = 0.25
PRICE_WEIGHT = 0.15

PURCHASE_WEIGHT = 1.0
CART_WEIGHT = 0.5

BEHAVIOR_WEIGHT = 0.30


def build_product_text(product: dict) -> str:
    name = product.get("name", "")
    description = product.get("description", "")

    return f"{name} {description}".strip()


def build_product_features(products: list[dict]):
    documents = [build_product_text(product) for product in products]

    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words="english",
    )

    return vectorizer.fit_transform(documents)


def calculate_similarity(features):
    return cosine_similarity(features)


def calculate_category_similarity(
    products: list[dict],
    target_index: int,
) -> list[float]:
    target_category = products[target_index].get("category")

    return [
        1.0 if product.get("category") == target_category else 0.0
        for product in products
    ]


def calculate_price_similarity(
    products: list[dict],
    target_index: int,
) -> list[float]:
    target_price = float(products[target_index].get("price", 0))

    scores = []

    for product in products:
        product_price = float(product.get("price", 0))

        if target_price == 0 and product_price == 0:
            score = 1.0
        elif target_price == 0 or product_price == 0:
            score = 0.0
        else:
            price_difference = abs(target_price - product_price)
            average_price = (target_price + product_price) / 2

            score = max(
                0.0,
                1.0 - (price_difference / average_price),
            )

        scores.append(score)

    return scores


def calculate_final_scores(
    products: list[dict],
    target_index: int,
    text_similarity: list[float],
) -> list[float]:
    category_similarity = calculate_category_similarity(
        products,
        target_index,
    )

    price_similarity = calculate_price_similarity(
        products,
        target_index,
    )

    final_scores = []

    for index in range(len(products)):
        score = (
            TEXT_WEIGHT * text_similarity[index]
            + CATEGORY_WEIGHT * category_similarity[index]
            + PRICE_WEIGHT * price_similarity[index]
        )

        final_scores.append(score)

    return final_scores


def calculate_behavior_similarity(
    products: list[dict],
    features,
    purchased_product_ids: set[str],
    cart_product_ids: set[str],
) -> list[float]:
    behavior_indices = []
    behavior_weights = []

    for index, product in enumerate(products):
        product_id = product["product_id"]

        if product_id in purchased_product_ids:
            behavior_indices.append(index)
            behavior_weights.append(PURCHASE_WEIGHT)

        elif product_id in cart_product_ids:
            behavior_indices.append(index)
            behavior_weights.append(CART_WEIGHT)

    # No user behavior = no personalization signal
    if not behavior_indices:
        return [0.0] * len(products)

    behavior_features = features[behavior_indices]

    similarity_matrix = cosine_similarity(
        features,
        behavior_features,
    )

    behavior_scores = []

    for product_index in range(len(products)):
        weighted_sum = 0.0
        total_weight = 0.0

        for behavior_index, weight in enumerate(behavior_weights):
            weighted_sum += similarity_matrix[product_index][behavior_index] * weight
            total_weight += weight

        score = weighted_sum / total_weight if total_weight > 0 else 0.0

        behavior_scores.append(score)

    return behavior_scores


def combine_recommendation_scores(
    content_scores: list[float],
    behavior_scores: list[float],
) -> list[float]:
    final_scores = []

    for content_score, behavior_score in zip(
        content_scores,
        behavior_scores,
    ):
        score = (1 - BEHAVIOR_WEIGHT) * content_score + BEHAVIOR_WEIGHT * behavior_score

        final_scores.append(score)

    return final_scores


async def get_recommendations(
    user_id: str,
    product_id: str,
    limit: int,
) -> list[RecommendationItem]:

    behavior = await get_user_behavior_products(user_id)

    purchased_product_ids = behavior["purchased"]
    cart_product_ids = behavior["cart"]

    target_product = await get_active_product(product_id)

    if not target_product:
        raise HTTPException(
            status_code=404,
            detail="Product not found or unavailable",
        )

    products = await get_active_products(limit=100)

    target_product_id = target_product["product_id"]

    if not any(product["product_id"] == target_product_id for product in products):
        products.append(target_product)

    if len(products) < 2:
        return []

    target_index = next(
        (
            index
            for index, product in enumerate(products)
            if product["product_id"] == target_product_id
        ),
        None,
    )

    if target_index is None:
        raise HTTPException(
            status_code=404,
            detail="Product not available for recommendations",
        )

    features = build_product_features(products)
    similarity_matrix = calculate_similarity(features)

    scores = calculate_final_scores(
        products=products,
        target_index=target_index,
        text_similarity=similarity_matrix[target_index],
    )

    behavior_scores = calculate_behavior_similarity(
        products=products,
        features=features,
        purchased_product_ids=purchased_product_ids,
        cart_product_ids=cart_product_ids,
    )

    scores = combine_recommendation_scores(
        content_scores=scores,
        behavior_scores=behavior_scores,
    )

    recommendations = []

    for index, product in enumerate(products):
        if index == target_index:
            continue

        if product["product_id"] in purchased_product_ids:
            continue

        if product["product_id"] in cart_product_ids:
            continue

        recommendations.append(
            RecommendationItem(
                product_id=product["product_id"],
                score=round(scores[index], 4),
            )
        )

    recommendations.sort(
        key=lambda item: item.score,
        reverse=True,
    )

    return recommendations[:limit]
