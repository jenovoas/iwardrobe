import requests

BASE_URL = "http://localhost:8000"

def test_auth_flow():
    # 1. Register User
    email = "test@example.com"
    password = "password123"
    payload = {
        "email": email,
        "password": password,
        "full_name": "Test User"
    }
    
    print(f"Registering user: {email}")
    response = requests.post(f"{BASE_URL}/users/", json=payload)
    
    if response.status_code == 400 and "Email already registered" in response.text:
        print("User already exists, proceeding to login.")
    elif response.status_code == 200:
        print("User registered successfully.")
    else:
        print(f"Registration failed: {response.text}")
        return

    # 2. Login (Get Token)
    print("Logging in...")
    login_data = {
        "username": email,
        "password": password
    }
    response = requests.post(f"{BASE_URL}/token", data=login_data)
    
    if response.status_code == 200:
        token = response.json().get("access_token")
        print(f"Login successful. Token: {token[:10]}...")
    else:
        print(f"Login failed: {response.text}")

if __name__ == "__main__":
    test_auth_flow()
