import pytest
import uuid
from unittest.mock import AsyncMock
from httpx import AsyncClient
from io import BytesIO

from main import app
from dependencies import get_current_user, get_project_service
from models.auth import UserResponse
from .conftest import TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD


FAKE_USER = UserResponse(id=1, username="user1", is_admin=False, is_active=True)


class TestProjects:

    @pytest.mark.asyncio
    async def test_list_projects_requires_auth(self, client: AsyncClient):
        response = await client.get("/api/projects")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_list_projects_success(self, client: AsyncClient):
        mock_project_svc = AsyncMock()
        mock_project_svc.get_user_projects.return_value = []

        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_project_service] = lambda: mock_project_svc
        try:
            response = await client.get(
                "/api/projects",
                headers={"Authorization": "Bearer faketoken"}
            )
            assert response.status_code == 200
            assert response.json() == []
            mock_project_svc.get_user_projects.assert_called_once_with(FAKE_USER.id)
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_list_mutants_requires_auth(self, client: AsyncClient):
        response = await client.get("/api/projects/1/mutants")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_list_mutants_success(self, client: AsyncClient):
        mock_project_svc = AsyncMock()
        mock_project_svc.does_user_belong_to_project.return_value = True
        mock_project_svc.get_mutant_list.return_value = []

        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_project_service] = lambda: mock_project_svc
        try:
            response = await client.get(
                "/api/projects/1/mutants",
                headers={"Authorization": "Bearer faketoken"}
            )
            assert response.status_code == 200
            assert response.json() == []
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_list_mutants_no_project_access(self, client: AsyncClient):
        mock_project_svc = AsyncMock()
        mock_project_svc.does_user_belong_to_project.return_value = False

        app.dependency_overrides[get_current_user] = lambda: FAKE_USER
        app.dependency_overrides[get_project_service] = lambda: mock_project_svc
        try:
            response = await client.get(
                "/api/projects/99/mutants",
                headers={"Authorization": "Bearer faketoken"}
            )
            assert response.status_code == 401
        finally:
            app.dependency_overrides.clear()


class TestProjectsIntegration:
    """Integration tests for projects using a real database."""

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
    <mutation detected='true' status='KILLED' numberOfTestsRun='3'>
        <sourceFile>Bar.java</sourceFile>
        <mutatedClass>com.example.Bar</mutatedClass>
        <mutatedMethod>compute</mutatedMethod>
        <methodDescription>()I</methodDescription>
        <lineNumber>42</lineNumber>
        <mutator>MATH</mutator>
        <killingTest>com.example.BarTest.test1</killingTest>
        <description>replaced + with -</description>
    </mutation>
    <mutation detected='false' status='SURVIVED' numberOfTestsRun='1'>
        <sourceFile>Bar.java</sourceFile>
        <mutatedClass>com.example.Bar</mutatedClass>
        <mutatedMethod>compute</mutatedMethod>
        <methodDescription>()I</methodDescription>
        <lineNumber>55</lineNumber>
        <mutator>NEGATE_CONDITIONALS</mutator>
        <killingTest></killingTest>
        <description>negated condition</description>
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
    async def test_list_projects_contains_created_project(self, client: AsyncClient):
        """Created project appears in admin's project list with correct metrics."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "proj_int")

        # Admin is auto-added to the project on creation.
        response = await client.get(
            "/api/projects",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        projects = response.json()
        project_ids = [p["id"] for p in projects]
        assert project_id in project_ids

        project = next(p for p in projects if p["id"] == project_id)
        assert project["total_mutants"] == 2
        assert project["reviewed_mutants"] == 0
        assert project["current_status"] == "in_progress"

        await client.delete(
            f"/api/admin/projects/{project_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

    @pytest.mark.asyncio
    async def test_list_mutants_for_project(self, client: AsyncClient):
        """Listing mutants returns the correct entries from the uploaded XML."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "mutlist_int")

        response = await client.get(
            f"/api/projects/{project_id}/mutants",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        mutants = response.json()
        assert len(mutants) == 2

        statuses = {m["status"] for m in mutants}
        assert "KILLED" in statuses
        assert "SURVIVED" in statuses

        for mutant in mutants:
            assert mutant["sourceFile"] == "Bar.java"
            assert "id" in mutant
            assert "ranking" in mutant

        await client.delete(
            f"/api/admin/projects/{project_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

    @pytest.mark.asyncio
    async def test_project_not_visible_to_unassigned_user(self, client: AsyncClient):
        """A project created by admin is not visible to a user who wasn't added to it."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "proj_hidden_int")

        # Register a new user who is NOT added to the project
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
            "/api/projects",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        ids = [p["id"] for p in response.json()]
        assert project_id not in ids

        # Cleanup: delete temp user, then project
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
