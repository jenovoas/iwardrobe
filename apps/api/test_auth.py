from fastapi.testclient import TestClient
from app.main import app


def test_auth_flow():
    with TestClient(app) as client:
        # 1. Register User
        email = "test@example.com"
        password = "password123"
        payload = {
            "email": email,
            "password": password,
            "full_name": "Test User"
        }

        response = client.post("/users/", json=payload)

        # It's okay if the user already exists for this test flow
        assert response.status_code == 200 or (response.status_code == 400 and "Email already registered" in response.text)

        # 2. Login (Get Token)
        login_data = {
            "username": email,
            "password": password
        }
        response = client.post("/token", data=login_data)

        assert response.status_code == 200
        token = response.json().get("access_token")
        assert token is not None
