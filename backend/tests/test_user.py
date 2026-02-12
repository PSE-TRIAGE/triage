import pytest
from httpx import AsyncClient
from .conftest import TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD


class TestUser:
    """Test cases for user endpoints."""
    
    async def _get_admin_token(self, client: AsyncClient) -> str:
        """Helper method to get admin token."""
        response = await client.post(
            "/api/login",
            json={
                "username": TEST_ADMIN_USERNAME,
                "password": TEST_ADMIN_PASSWORD
            }
        )
        return response.json()["token"]
    
    @pytest.mark.asyncio
    async def test_get_user_info(self, client: AsyncClient):
        """Test getting user information with valid token."""
        token = await self._get_admin_token(client)
        
        response = await client.get(
            "/api/user",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "username" in data
        assert "is_admin" in data
        assert data["username"] == "admin"
    
    @pytest.mark.asyncio
    async def test_get_user_info_invalid_token(self, client: AsyncClient):
        """Test getting user info with invalid token."""
        response = await client.get(
            "/api/user",
            headers={"Authorization": "Bearer invalid_token_12345"}
        )
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_logout(self, client: AsyncClient):
        """Test logout functionality."""
        token = await self._get_admin_token(client)

        response = await client.post(
            "/api/user/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200

        # Verify token is invalid after logout
        response = await client.get(
            "/api/user",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 401
