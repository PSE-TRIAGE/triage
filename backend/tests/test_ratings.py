import pytest
from unittest.mock import AsyncMock
from httpx import AsyncClient

from main import app
from dependencies import get_current_user, get_form_field_service
from models.auth import UserResponse


FAKE_USER = UserResponse(id=1, username="admin", is_admin=True, is_active=True)


class TestRatings:

    @pytest.mark.asyncio
    async def test_submit_rating_requires_authentication(self, client: AsyncClient):
        response = await client.post(
            "/api/mutants/1/ratings",
            json={"field_values": []}
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_submit_rating_invalid_mutant_id(self, client: AsyncClient):
        mock_service = AsyncMock()
        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.post(
                "/api/mutants/0/ratings",
                headers={"Authorization": "Bearer faketoken"},
                json={"field_values": []}
            )
            assert response.status_code == 422
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_submit_rating_invalid_form_field_id(self, client: AsyncClient):
        mock_service = AsyncMock()
        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.post(
                "/api/mutants/1/ratings",
                headers={"Authorization": "Bearer faketoken"},
                json={"field_values": [{"form_field_id": 0, "value": "test"}]}
            )
            assert response.status_code == 422
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_rating_requires_authentication(self, client: AsyncClient):
        response = await client.get("/api/mutants/1/ratings")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_rating_returns_null_for_nonexistent(self, client: AsyncClient):
        mock_service = AsyncMock()
        mock_service.get_rating.return_value = None

        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.get(
                "/api/mutants/99999/ratings",
                headers={"Authorization": "Bearer faketoken"}
            )
            assert response.status_code == 200
            assert response.json() is None
        finally:
            app.dependency_overrides.clear()
