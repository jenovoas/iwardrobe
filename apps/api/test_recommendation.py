import requests

BASE_URL = "http://localhost:8000"

def test_recommendation_flow():
    # 1. Login
    email = "test@example.com"
    password = "password123"
    
    print("Logging in...")
    login_data = {"username": email, "password": password}
    response = requests.post(f"{BASE_URL}/token", data=login_data)
    
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return

    token = response.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Recommendations
    print("Fetching recommendations...")
    response = requests.get(f"{BASE_URL}/recommendations/me", headers=headers)
    
    if response.status_code == 200:
        print(f"Recommendations: {response.json()}")
    else:
        print(f"Failed to get recommendations: {response.text}")

if __name__ == "__main__":
    test_recommendation_flow()
