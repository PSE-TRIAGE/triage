import pytest
import uuid
from unittest.mock import AsyncMock
from datetime import datetime
from httpx import AsyncClient
from io import BytesIO

from main import app
from dependencies import get_current_admin, get_export_service
from models.auth import UserResponse
from models.export import (
    ExportPreviewResponse,
    ExportPreviewStats,
    ExportDataResponse,
)
from .conftest import TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD


FAKE_ADMIN = UserResponse(id=1, username="admin", is_admin=True, is_active=True)
FAKE_USER = UserResponse(id=2, username="regularuser", is_admin=False, is_active=True)

SAMPLE_STATS = ExportPreviewStats(
    total_mutants=2,
    total_ratings=0,
    unique_reviewers=0,
    mutants_with_ratings=0,
    completion_percentage=0.0,
)

SAMPLE_PREVIEW = ExportPreviewResponse(
    project_id=1,
    project_name="test_project",
    stats=SAMPLE_STATS,
    sample_entries=[],
)

SAMPLE_EXPORT = ExportDataResponse(
    project_id=1,
    project_name="test_project",
    exported_at=datetime.now(),
    stats=SAMPLE_STATS,
    ratings=[],
)


class TestExport:

    @pytest.mark.asyncio
    async def test_export_preview_requires_authentication(self, client: AsyncClient):
        response = await client.get("/api/admin/projects/1/export/preview")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_export_requires_authentication(self, client: AsyncClient):
        response = await client.get("/api/admin/projects/1/export")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_export_preview_returns_stats(self, client: AsyncClient):
        mock_service = AsyncMock()
        mock_service.does_user_have_access.return_value = True
        mock_service.get_export_preview.return_value = SAMPLE_PREVIEW

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_export_service] = lambda: mock_service
        try:
            response = await client.get(
                "/api/admin/projects/1/export/preview",
                headers={"Authorization": "Bearer faketoken"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["project_id"] == 1
            assert "stats" in data
            assert data["stats"]["total_mutants"] == 2
            assert data["stats"]["total_ratings"] == 0
            assert data["stats"]["unique_reviewers"] == 0
            assert data["stats"]["mutants_with_ratings"] == 0
            assert data["stats"]["completion_percentage"] == 0.0
            assert "sample_entries" in data
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_export_returns_full_data(self, client: AsyncClient):
        mock_service = AsyncMock()
        mock_service.does_user_have_access.return_value = True
        mock_service.get_export_data.return_value = SAMPLE_EXPORT

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_export_service] = lambda: mock_service
        try:
            response = await client.get(
                "/api/admin/projects/1/export",
                headers={"Authorization": "Bearer faketoken"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["project_id"] == 1
            assert "exported_at" in data
            assert "stats" in data
            assert "ratings" in data
            assert isinstance(data["ratings"], list)
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_export_preview_no_access_to_other_project(self, client: AsyncClient):
        mock_service = AsyncMock()
        mock_service.does_user_have_access.return_value = False

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_export_service] = lambda: mock_service
        try:
            response = await client.get(
                "/api/admin/projects/1/export/preview",
                headers={"Authorization": "Bearer faketoken"},
            )
            assert response.status_code == 401
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_export_nonexistent_project(self, client: AsyncClient):
        mock_service = AsyncMock()
        mock_service.does_user_have_access.return_value = True
        mock_service.get_export_preview.return_value = None

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_export_service] = lambda: mock_service
        try:
            response = await client.get(
                "/api/admin/projects/99999/export/preview",
                headers={"Authorization": "Bearer faketoken"},
            )
            assert response.status_code == 404
        finally:
            app.dependency_overrides.clear()


class TestExportIntegration:
    """Integration tests for export endpoints using a real database."""

    async def _get_admin_token(self, client: AsyncClient) -> str:
        response = await client.post(
            "/api/login",
            json={"username": TEST_ADMIN_USERNAME, "password": TEST_ADMIN_PASSWORD}
        )
        return response.json()["token"]

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
    async def test_export_preview_empty_project(self, client: AsyncClient):
        """Export preview for a project with no ratings shows 0% completion."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "export_empty_int")

        response = await client.get(
            f"/api/admin/projects/{project_id}/export/preview",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["project_id"] == project_id
        assert data["stats"]["total_mutants"] == 2
        assert data["stats"]["total_ratings"] == 0
        assert data["stats"]["mutants_with_ratings"] == 0
        assert data["stats"]["completion_percentage"] == 0.0
        assert data["sample_entries"] == []

        await client.delete(
            f"/api/admin/projects/{project_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

    @pytest.mark.asyncio
    async def test_export_preview_with_ratings(self, client: AsyncClient):
        """Export preview shows correct stats after a rating is submitted."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "export_preview_int")

        ff_response = await client.get(
            f"/api/projects/{project_id}/form-fields",
            headers={"Authorization": f"Bearer {token}"}
        )
        form_field_id = ff_response.json()[0]["id"]

        mutants_response = await client.get(
            f"/api/projects/{project_id}/mutants",
            headers={"Authorization": f"Bearer {token}"}
        )
        mutant_id = mutants_response.json()[0]["id"]

        await client.post(
            f"/api/mutants/{mutant_id}/ratings",
            headers={"Authorization": f"Bearer {token}"},
            json={"field_values": [{"form_field_id": form_field_id, "value": "3"}]}
        )

        response = await client.get(
            f"/api/admin/projects/{project_id}/export/preview",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["stats"]["total_mutants"] == 2
        assert data["stats"]["total_ratings"] == 1
        assert data["stats"]["mutants_with_ratings"] == 1
        assert data["stats"]["completion_percentage"] == 50.0
        assert len(data["sample_entries"]) == 1
        assert data["sample_entries"][0]["mutant_id"] == mutant_id

        await client.delete(
            f"/api/admin/projects/{project_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

    @pytest.mark.asyncio
    async def test_export_download_with_ratings(self, client: AsyncClient):
        """Full export download returns rating entries with form field values."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "export_download_int")

        ff_response = await client.get(
            f"/api/projects/{project_id}/form-fields",
            headers={"Authorization": f"Bearer {token}"}
        )
        form_field_id = ff_response.json()[0]["id"]

        mutants_response = await client.get(
            f"/api/projects/{project_id}/mutants",
            headers={"Authorization": f"Bearer {token}"}
        )
        mutant_id = mutants_response.json()[0]["id"]

        await client.post(
            f"/api/mutants/{mutant_id}/ratings",
            headers={"Authorization": f"Bearer {token}"},
            json={"field_values": [{"form_field_id": form_field_id, "value": "5"}]}
        )

        response = await client.get(
            f"/api/admin/projects/{project_id}/export",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["project_id"] == project_id
        assert "exported_at" in data
        assert data["stats"]["total_ratings"] == 1
        assert len(data["ratings"]) == 1

        entry = data["ratings"][0]
        assert entry["mutant_id"] == mutant_id
        assert entry["status"] == "KILLED"
        assert entry["source_file"] == "Foo.java"
        assert entry["reviewer_username"] == TEST_ADMIN_USERNAME
        assert len(entry["field_values"]) == 1
        assert entry["field_values"][0]["value"] == "5"

        await client.delete(
            f"/api/admin/projects/{project_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
