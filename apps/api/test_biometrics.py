import requests

BASE_URL = "http://localhost:8000"

def test_biometrics_flow():
    # 1. Login to get token
    email = "test@example.com"
    password = "password123"
    
    print("Logging in...")
    login_data = {
        "username": email,
        "password": password
    }
    response = requests.post(f"{BASE_URL}/token", data=login_data)
    
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return

    token = response.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Login successful.")

    # 2. Create/Update Biometrics
    print("Updating biometrics...")
    bio_data = {
        "face_shape": "Oval",
        "skin_tone": "#F5D0C5",
        "undertone": "Warm",
        "body_shape": "Hourglass",
        "height_cm": 170.5
    }
    
    response = requests.post(f"{BASE_URL}/biometrics/me", json=bio_data, headers=headers)
    if response.status_code == 200:
        print(f"Biometrics updated: {response.json()}")
    else:
        print(f"Update failed: {response.text}")
        return

    # 3. Get Biometrics
    print("Fetching biometrics...")
    response = requests.get(f"{BASE_URL}/biometrics/me", headers=headers)
    if response.status_code == 200:
        print(f"Fetched biometrics: {response.json()}")
    else:
        print(f"Fetch failed: {response.text}")

if __name__ == "__main__":
    test_biometrics_flow()
