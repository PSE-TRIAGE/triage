import pytest
from unittest.mock import AsyncMock
from httpx import AsyncClient
from io import BytesIO

from main import app
from dependencies import get_current_admin, get_auth_service, get_project_service
from models.auth import UserResponse


FAKE_ADMIN = UserResponse(id=1, username="admin", is_admin=True, is_active=True)


@pytest.fixture(autouse=True)
def override_dependencies():
    mock_auth = AsyncMock()
    mock_project = AsyncMock()

    app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
    app.dependency_overrides[get_auth_service] = lambda: mock_auth
    app.dependency_overrides[get_project_service] = lambda: mock_project
    yield
    app.dependency_overrides.clear()


class TestAdmin:

    @pytest.mark.asyncio
    async def test_register_user_invalid_username(self, client: AsyncClient):
        response = await client.post(
            "/api/admin/users",
            headers={"Authorization": "Bearer faketoken"},
            json={"username": "test@user", "password": "password123"}
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_register_user_short_password(self, client: AsyncClient):
        response = await client.post(
            "/api/admin/users",
            headers={"Authorization": "Bearer faketoken"},
            json={"username": "testuser123", "password": "short"}
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_project_invalid_file_type(self, client: AsyncClient):
        response = await client.post(
            "/api/admin/projects/",
            headers={"Authorization": "Bearer faketoken"},
            data={"project_name": "test_project"},
            files={"file": ("test.txt", BytesIO(b"test content"), "text/plain")}
        )
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_create_project_missing_project_name(self, client: AsyncClient):
        xml_content = b'<?xml version="1.0" encoding="UTF-8"?><mutations></mutations>'
        response = await client.post(
            "/api/admin/projects/",
            headers={"Authorization": "Bearer faketoken"},
            files={"file": ("mutations.xml", BytesIO(xml_content), "application/xml")}
        )
        assert response.status_code == 422
