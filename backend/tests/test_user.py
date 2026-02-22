import pytest
import uuid
from unittest.mock import AsyncMock
from httpx import AsyncClient

from main import app
from dependencies import get_current_user, get_auth_service
from models.auth import UserResponse
from .conftest import TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD


FAKE_ADMIN = UserResponse(id=1, username="admin", is_admin=True, is_active=True)
FAKE_USER = UserResponse(id=2, username="user2", is_admin=False, is_active=True)


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

    @pytest.mark.asyncio
    async def test_delete_endpoint_always_forbidden(self, client: AsyncClient):
        """DELETE /api/user is intentionally disabled and always returns 403."""
        mock_auth = AsyncMock()
        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_auth_service] = lambda: mock_auth
        try:
            response = await client.delete(
                "/api/user",
                headers={"Authorization": "Bearer faketoken"}
            )
            assert response.status_code == 403
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_disable_self_admin_forbidden(self, client: AsyncClient):
        """Admins cannot disable their own account."""
        mock_auth = AsyncMock()
        app.dependency_overrides[get_current_user] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_auth_service] = lambda: mock_auth
        try:
            response = await client.patch(
                "/api/user/disable",
                headers={"Authorization": "Bearer faketoken"}
            )
            assert response.status_code == 403
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_disable_self_success(self, client: AsyncClient):
        """Non-admin users can disable their own account."""
        mock_auth = AsyncMock()
        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_auth_service] = lambda: mock_auth
        try:
            response = await client.patch(
                "/api/user/disable",
                headers={"Authorization": "Bearer faketoken"}
            )
            assert response.status_code == 200
            mock_auth.disable_user.assert_called_once_with(FAKE_USER.id)
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_change_password_success(self, client: AsyncClient):
        """Changing password with correct current password succeeds."""
        mock_auth = AsyncMock()
        mock_auth.authorize.return_value = True
        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_auth_service] = lambda: mock_auth
        try:
            response = await client.patch(
                "/api/user/password",
                headers={"Authorization": "Bearer faketoken"},
                json={"current_password": "oldpassword", "new_password": "newpassword123"}
            )
            assert response.status_code == 200
            mock_auth.reset.assert_called_once_with(FAKE_USER.id, "newpassword123")
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_change_password_wrong_current(self, client: AsyncClient):
        """Changing password with wrong current password returns 401."""
        mock_auth = AsyncMock()
        mock_auth.authorize.return_value = False
        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_auth_service] = lambda: mock_auth
        try:
            response = await client.patch(
                "/api/user/password",
                headers={"Authorization": "Bearer faketoken"},
                json={"current_password": "wrongpassword", "new_password": "newpassword123"}
            )
            assert response.status_code == 401
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_change_username_success(self, client: AsyncClient):
        """Changing username succeeds and returns updated user."""
        mock_auth = AsyncMock()
        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_auth_service] = lambda: mock_auth
        try:
            response = await client.patch(
                "/api/user/username",
                headers={"Authorization": "Bearer faketoken"},
                json={"new_username": "newusername"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["username"] == "newusername"
            mock_auth.change_username.assert_called_once_with(FAKE_USER.id, "newusername")
        finally:
            app.dependency_overrides.clear()


class TestUserIntegration:
    """Integration tests for user endpoints using a real database."""

    async def _get_admin_token(self, client: AsyncClient) -> str:
        response = await client.post(
            "/api/login",
            json={"username": TEST_ADMIN_USERNAME, "password": TEST_ADMIN_PASSWORD}
        )
        return response.json()["token"]

    @pytest.mark.asyncio
    async def test_change_username_success(self, client: AsyncClient):
        """Changing username to a new unique name works and allows login with new name."""
        admin_token = await self._get_admin_token(client)
        username = f"changeuser_{uuid.uuid4().hex[:8]}"
        new_username = f"changed_{uuid.uuid4().hex[:8]}"
        password = "TestPass123!"

        await client.post(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"username": username, "password": password}
        )
        login_response = await client.post(
            "/api/login", json={"username": username, "password": password}
        )
        user_token = login_response.json()["token"]

        change_response = await client.patch(
            "/api/user/username",
            headers={"Authorization": f"Bearer {user_token}"},
            json={"new_username": new_username}
        )
        assert change_response.status_code == 200
        assert change_response.json()["username"] == new_username

        # Cleanup: find user by new name and delete
        users = (await client.get(
            "/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"}
        )).json()
        user = next(u for u in users if u["username"] == new_username)
        await client.delete(
            f"/api/admin/users/{user['id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )

    @pytest.mark.asyncio
    async def test_change_username_taken(self, client: AsyncClient):
        """Changing username to an already-taken name returns an error."""
        admin_token = await self._get_admin_token(client)
        password = "TestPass123!"
        username1 = f"taken_u1_{uuid.uuid4().hex[:8]}"
        username2 = f"taken_u2_{uuid.uuid4().hex[:8]}"

        await client.post(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"username": username1, "password": password}
        )
        await client.post(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"username": username2, "password": password}
        )

        user1_token = (await client.post(
            "/api/login", json={"username": username1, "password": password}
        )).json()["token"]

        conflict_response = await client.patch(
            "/api/user/username",
            headers={"Authorization": f"Bearer {user1_token}"},
            json={"new_username": username2}
        )
        assert conflict_response.status_code != 200

        # Cleanup both users
        users = (await client.get(
            "/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"}
        )).json()
        for u in users:
            if u["username"] in (username1, username2):
                await client.delete(
                    f"/api/admin/users/{u['id']}",
                    headers={"Authorization": f"Bearer {admin_token}"}
                )
