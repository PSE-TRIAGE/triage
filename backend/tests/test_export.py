import pytest
from unittest.mock import AsyncMock
from datetime import datetime
from httpx import AsyncClient

from main import app
from dependencies import get_current_admin, get_export_service
from models.auth import UserResponse
from models.export import (
    ExportPreviewResponse,
    ExportPreviewStats,
    ExportDataResponse,
)


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
