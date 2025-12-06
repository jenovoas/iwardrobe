from fastapi.testclient import TestClient
from app.main import app


def get_auth_token(client: TestClient):
    email = "test@example.com"
    password = "password123"

    client.post("/users/", json={"email": email, "password": password, "full_name": "Test User"})

    login_data = {"username": email, "password": password}
    response = client.post("/token", data=login_data)
    assert response.status_code == 200
    return response.json()["access_token"]


def test_recommendation_flow():
    with TestClient(app) as client:
        token = get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        # First, ensure biometrics are set, as recommendations might depend on them
        bio_data = {
            "face_shape": "Oval", "skin_tone": "#F5D0C5", "undertone": "Warm",
            "body_shape": "Hourglass", "height_cm": 170.5
        }
        client.post("/biometrics/me", json=bio_data, headers=headers)

        # 2. Get Recommendations
        response = client.get("/recommendations/me", headers=headers)

        assert response.status_code == 200
        recommendations = response.json()
        assert "colors" in recommendations
        assert "styles" in recommendations
        assert "tips" in recommendations
