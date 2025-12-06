from fastapi.testclient import TestClient
from app.main import app

def get_auth_token(client: TestClient):
    # Ensure user is registered from the auth test, or handle it here
    email = "test@example.com"
    password = "password123"
    
    # Register user first (ignore if already exists)
    client.post("/users/", json={"email": email, "password": password, "full_name": "Test User"})

    # Login to get token
    login_data = {"username": email, "password": password}
    response = client.post("/token", data=login_data)
    assert response.status_code == 200
    return response.json()["access_token"]

def test_biometrics_flow():
    with TestClient(app) as client:
        token = get_auth_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create/Update Biometrics
        bio_data = {
            "face_shape": "Oval",
            "skin_tone": "#F5D0C5",
            "undertone": "Warm",
            "body_shape": "Hourglass",
            "height_cm": 170.5
        }
        
        response = client.post("/biometrics/me", json=bio_data, headers=headers)
        assert response.status_code == 200
        assert response.json()["face_shape"] == "Oval"

        # 3. Get Biometrics
        response = client.get("/biometrics/me", headers=headers)
        assert response.status_code == 200
        assert response.json()["skin_tone"] == "#F5D0C5"

