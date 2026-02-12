import pytest
from httpx import AsyncClient
from .conftest import TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD


class TestLogin:
    """Test cases for login endpoint."""
    
    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient):
        """Test successful login with valid credentials."""
        response = await client.post(
            "/api/login",
            json={
                "username": TEST_ADMIN_USERNAME,
                "password": TEST_ADMIN_PASSWORD
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert len(data["token"]) > 0
    
    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials."""
        response = await client.post(
            "/api/login",
            json={
                "username": TEST_ADMIN_USERNAME,
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_login_missing_username(self, client: AsyncClient):
        """Test login with missing username."""
        response = await client.post(
            "/api/login",
            json={
                "password": "admin"
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_login_missing_password(self, client: AsyncClient):
        """Test login with missing password."""
        response = await client.post(
            "/api/login",
            json={
                "username": "admin"
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_login_short_username(self, client: AsyncClient):
        """Test login with username that is too short."""
        response = await client.post(
            "/api/login",
            json={
                "username": "ab",
                "password": "password123"
            }
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_login_empty_password(self, client: AsyncClient):
        """Test login with empty password."""
        response = await client.post(
            "/api/login",
            json={
                "username": "admin",
                "password": ""
            }
        )
        assert response.status_code == 422
