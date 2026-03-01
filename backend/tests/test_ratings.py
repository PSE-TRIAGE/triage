import pytest
import uuid
from unittest.mock import AsyncMock
from httpx import AsyncClient
from io import BytesIO

from main import app
from dependencies import get_current_user, get_form_field_service
from models.auth import UserResponse
from models.form_field import RatingWithValuesResponse, FormFieldValueResponse
from .conftest import TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD


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

    @pytest.mark.asyncio
    async def test_submit_rating_success(self, client: AsyncClient):
        """Submitting a rating with valid data returns the created rating."""
        mock_service = AsyncMock()
        mock_service.submit_rating.return_value = RatingWithValuesResponse(
            id=1,
            mutant_id=1,
            user_id=1,
            field_values=[
                FormFieldValueResponse(id=1, form_field_id=1, rating_id=1, value="4")
            ]
        )

        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.post(
                "/api/mutants/1/ratings",
                headers={"Authorization": "Bearer faketoken"},
                json={"field_values": [{"form_field_id": 1, "value": "4"}]}
            )
            assert response.status_code == 201
            data = response.json()
            assert data["id"] == 1
            assert data["mutant_id"] == 1
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_rating_success(self, client: AsyncClient):
        """Getting an existing rating returns its data."""
        mock_service = AsyncMock()
        mock_service.get_rating.return_value = RatingWithValuesResponse(
            id=1,
            mutant_id=1,
            user_id=1,
            field_values=[
                FormFieldValueResponse(id=1, form_field_id=1, rating_id=1, value="5")
            ]
        )

        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.get(
                "/api/mutants/1/ratings",
                headers={"Authorization": "Bearer faketoken"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == 1
            assert len(data["field_values"]) == 1
        finally:
            app.dependency_overrides.clear()


class TestRatingsIntegration:
    """Integration tests for ratings using a real database."""

    async def _get_admin_token(self, client: AsyncClient) -> str:
        response = await client.post(
            "/api/login",
            json={"username": TEST_ADMIN_USERNAME, "password": TEST_ADMIN_PASSWORD}
        )
        return response.json()["token"]

    async def _get_admin_id(self, client: AsyncClient, token: str) -> int:
        response = await client.get(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {token}"}
        )
        users = response.json()
        admin = next(u for u in users if u["username"] == TEST_ADMIN_USERNAME)
        return admin["id"]

    async def _create_test_project(self, client: AsyncClient, token: str, name: str) -> int:
        unique_name = f"{name}_{uuid.uuid4().hex[:8]}"
        xml_content = b"""<?xml version="1.0" encoding="UTF-8"?>
<mutations>
    <mutation detected='true' status='KILLED' numberOfTestsRun='5'>
        <sourceFile>Foo.java</sourceFile>
        <mutatedClass>com.example.Foo</mutatedClass>
        <mutatedMethod>bar</mutatedMethod>
        <methodDescription>()V</methodDescription>
        <lineNumber>10</lineNumber>
        <mutator>MATH</mutator>
        <killingTest>com.example.FooTest.test1</killingTest>
        <description>replaced math operator</description>
    </mutation>
    <mutation detected='false' status='SURVIVED' numberOfTestsRun='2'>
        <sourceFile>Foo.java</sourceFile>
        <mutatedClass>com.example.Foo</mutatedClass>
        <mutatedMethod>bar</mutatedMethod>
        <methodDescription>()V</methodDescription>
        <lineNumber>20</lineNumber>
        <mutator>NEGATE_CONDITIONALS</mutator>
        <killingTest></killingTest>
        <description>survived mutant</description>
    </mutation>
</mutations>"""
        response = await client.post(
            "/api/admin/projects/",
            headers={"Authorization": f"Bearer {token}"},
            data={"project_name": unique_name},
            files={"file": ("mutations.xml", BytesIO(xml_content), "application/xml")}
        )
        assert response.status_code == 201, f"Failed to create project: {response.text}"
        return response.json()["id"]

    @pytest.mark.asyncio
    async def test_submit_and_retrieve_rating(self, client: AsyncClient):
        """Submit a rating for a real mutant and retrieve it back."""
        token = await self._get_admin_token(client)
        admin_id = await self._get_admin_id(client, token)
        project_id = await self._create_test_project(client, token, "rating_int")

        # Admin is auto-added to the project on creation; no separate add_user needed.
        ff_response = await client.get(
            f"/api/projects/{project_id}/form-fields",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert ff_response.status_code == 200
        form_fields = ff_response.json()
        assert len(form_fields) > 0
        form_field_id = form_fields[0]["id"]

        mutants_response = await client.get(
            f"/api/projects/{project_id}/mutants",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert mutants_response.status_code == 200
        mutants = mutants_response.json()
        assert len(mutants) > 0
        mutant_id = mutants[0]["id"]

        submit_response = await client.post(
            f"/api/mutants/{mutant_id}/ratings",
            headers={"Authorization": f"Bearer {token}"},
            json={"field_values": [{"form_field_id": form_field_id, "value": "4"}]}
        )
        assert submit_response.status_code == 201
        data = submit_response.json()
        assert data["mutant_id"] == mutant_id
        assert data["user_id"] == admin_id
        assert len(data["field_values"]) == 1
        assert data["field_values"][0]["value"] == "4"

        get_response = await client.get(
            f"/api/mutants/{mutant_id}/ratings",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert get_response.status_code == 200
        rating = get_response.json()
        assert rating is not None
        assert rating["mutant_id"] == mutant_id
        assert rating["field_values"][0]["value"] == "4"

        await client.delete(
            f"/api/admin/projects/{project_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

    @pytest.mark.asyncio
    async def test_get_rating_nonexistent_returns_none(self, client: AsyncClient):
        """GET rating for a mutant with no rating returns null."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "rating_none_int")

        mutants_response = await client.get(
            f"/api/projects/{project_id}/mutants",
            headers={"Authorization": f"Bearer {token}"}
        )
        mutant_id = mutants_response.json()[0]["id"]

        response = await client.get(
            f"/api/mutants/{mutant_id}/ratings",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json() is None

        await client.delete(
            f"/api/admin/projects/{project_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
