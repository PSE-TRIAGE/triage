import pytest
import uuid
from unittest.mock import AsyncMock
from httpx import AsyncClient
from io import BytesIO

from main import app
from dependencies import get_current_user, get_mutant_service, get_project_service
from models.auth import UserResponse
from models.mutant import MutantResponse
from .conftest import TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD


FAKE_USER = UserResponse(id=1, username="user1", is_admin=False, is_active=True)

FAKE_MUTANT = MutantResponse(
    id=1,
    project_id=1,
    detected=True,
    status="KILLED",
    numberOfTestsRun=5,
    sourceFile="Foo.java",
    mutatedClass="com.example.Foo",
    mutatedMethod="bar",
    methodDescription="()V",
    lineNumber=10,
    mutator="MATH",
    killingTest="com.example.FooTest.test1",
    description="replaced math operator",
    ranking=0,
    additionalFields=None,
)


class TestMutants:

    @pytest.mark.asyncio
    async def test_get_mutant_requires_auth(self, client: AsyncClient):
        response = await client.get("/api/mutants/1")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_mutant_success(self, client: AsyncClient):
        mock_mutant_svc = AsyncMock()
        mock_project_svc = AsyncMock()
        mock_mutant_svc.get.return_value = FAKE_MUTANT
        mock_project_svc.does_user_belong_to_project.return_value = True

        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_mutant_service] = lambda: mock_mutant_svc
        app.dependency_overrides[get_project_service] = lambda: mock_project_svc
        try:
            response = await client.get(
                "/api/mutants/1",
                headers={"Authorization": "Bearer faketoken"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == 1
            assert data["status"] == "KILLED"
            assert data["sourceFile"] == "Foo.java"
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_mutant_no_project_access(self, client: AsyncClient):
        mock_mutant_svc = AsyncMock()
        mock_project_svc = AsyncMock()
        mock_mutant_svc.get.return_value = FAKE_MUTANT
        mock_project_svc.does_user_belong_to_project.return_value = False

        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_mutant_service] = lambda: mock_mutant_svc
        app.dependency_overrides[get_project_service] = lambda: mock_project_svc
        try:
            response = await client.get(
                "/api/mutants/1",
                headers={"Authorization": "Bearer faketoken"}
            )
            assert response.status_code == 401
        finally:
            app.dependency_overrides.clear()


class TestMutantsIntegration:
    """Integration tests for mutants using a real database."""

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
    async def test_get_mutant_by_id(self, client: AsyncClient):
        """Get a real mutant by ID after creating a project with known XML."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "mutant_int")

        # Admin is auto-added to the project on creation.
        mutants_response = await client.get(
            f"/api/projects/{project_id}/mutants",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert mutants_response.status_code == 200
        mutants = mutants_response.json()
        assert len(mutants) == 1
        mutant_id = mutants[0]["id"]

        response = await client.get(
            f"/api/mutants/{mutant_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == mutant_id
        assert data["project_id"] == project_id
        assert data["sourceFile"] == "Foo.java"
        assert data["status"] == "KILLED"
        assert data["mutator"] == "MATH"
        assert data["lineNumber"] == 10
        assert data["detected"] is True

        await client.delete(
            f"/api/admin/projects/{project_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

    @pytest.mark.asyncio
    async def test_get_mutant_user_without_access(self, client: AsyncClient):
        """Accessing a mutant from a project the user doesn't belong to returns 401."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "mutant_noaccess_int")

        # Get a mutant ID using admin (who is auto-added to the project)
        mutants_response = await client.get(
            f"/api/projects/{project_id}/mutants",
            headers={"Authorization": f"Bearer {token}"}
        )
        mutant_id = mutants_response.json()[0]["id"]

        # Register a new user who is NOT in the project
        unique_username = f"testuser_{uuid.uuid4().hex[:8]}"
        await client.post(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {token}"},
            json={"username": unique_username, "password": "TestPass123!"}
        )
        login_response = await client.post(
            "/api/login",
            json={"username": unique_username, "password": "TestPass123!"}
        )
        user_token = login_response.json()["token"]

        response = await client.get(
            f"/api/mutants/{mutant_id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 401

        # Cleanup: find and delete the temp user, then the project
        users_response = await client.get(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {token}"}
        )
        temp_user = next(u for u in users_response.json() if u["username"] == unique_username)
        await client.delete(
            f"/api/admin/users/{temp_user['id']}",
            headers={"Authorization": f"Bearer {token}"}
        )
        await client.delete(
            f"/api/admin/projects/{project_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
