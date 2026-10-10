from fastapi.testclient import TestClient

from app.api import app

client = TestClient(app)

VALID_USER_ID = "6ab16f705364932dd44ed7ab"
VALID_PRODUCT_ID = "6ac3ff1bbfd5e70dee763160"


def test_health_returns_healthy_response():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "ml-recommendation-service",
    }


def test_invalid_user_id_returns_422():
    response = client.post(
        "/api/v1/recommendations",
        json={
            "user_id": "abc",
            "product_id": VALID_PRODUCT_ID,
            "limit": 5,
        },
    )

    assert response.status_code == 422


def test_invalid_product_id_returns_422():
    response = client.post(
        "/api/v1/recommendations",
        json={
            "user_id": VALID_USER_ID,
            "product_id": "abc",
            "limit": 5,
        },
    )

    assert response.status_code == 422


def test_limit_below_minimum_returns_422():
    response = client.post(
        "/api/v1/recommendations",
        json={
            "user_id": VALID_USER_ID,
            "product_id": VALID_PRODUCT_ID,
            "limit": 0,
        },
    )

    assert response.status_code == 422


def test_limit_above_maximum_returns_422():
    response = client.post(
        "/api/v1/recommendations",
        json={
            "user_id": VALID_USER_ID,
            "product_id": VALID_PRODUCT_ID,
            "limit": 21,
        },
    )

    assert response.status_code == 422


def test_valid_request_returns_mocked_recommendations(monkeypatch):
    async def mock_get_recommendations(user_id, product_id, limit):
        assert user_id == VALID_USER_ID
        assert product_id == VALID_PRODUCT_ID
        assert limit == 5

        return [
            {
                "product_id": "6ac3ff1bbfd5e70dee763161",
                "score": 0.85,
            }
        ]

    monkeypatch.setattr(
        "app.routes.recommendation.get_recommendations",
        mock_get_recommendations,
    )

    response = client.post(
        "/api/v1/recommendations",
        json={
            "user_id": VALID_USER_ID,
            "product_id": VALID_PRODUCT_ID,
            "limit": 5,
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "user_id": VALID_USER_ID,
        "recommendations": [
            {
                "product_id": "6ac3ff1bbfd5e70dee763161",
                "score": 0.85,
            }
        ],
    }
