import pytest
import uuid
from unittest.mock import AsyncMock
from httpx import AsyncClient
from io import BytesIO

from main import app
from dependencies import get_current_admin, get_current_user, get_form_field_service
from models.auth import UserResponse
from models.form_field import FormFieldResponse
from .conftest import TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD


FAKE_ADMIN = UserResponse(id=1, username="admin", is_admin=True, is_active=True)
FAKE_USER = UserResponse(id=2, username="regularuser", is_admin=False, is_active=True)


def _make_field(id: int, project_id: int, label: str, type: str = "text",
                is_required: bool = False, position: int = 0) -> FormFieldResponse:
    return FormFieldResponse(
        id=id, project_id=project_id, label=label,
        type=type, is_required=is_required, position=position,
    )


class TestFormFields:

    @pytest.mark.asyncio
    async def test_create_form_field(self, client: AsyncClient):
        mock_service = AsyncMock()
        mock_service.create_form_field.return_value = _make_field(
            id=2, project_id=1, label="Severity Rating",
            type="rating", is_required=True, position=1,
        )

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.post(
                "/api/admin/projects/1/form-fields",
                headers={"Authorization": "Bearer faketoken"},
                json={"label": "Severity Rating", "type": "rating", "is_required": True},
            )

            assert response.status_code == 201
            data = response.json()
            assert data["label"] == "Severity Rating"
            assert data["type"] == "rating"
            assert data["is_required"] is True
            assert data["project_id"] == 1
            assert data["position"] == 1
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_create_multiple_form_fields_auto_position(self, client: AsyncClient):
        call_count = 0

        async def mock_create(project_id, data):
            nonlocal call_count
            call_count += 1
            return _make_field(
                id=call_count + 1, project_id=project_id,
                label=data.label, type=data.type,
                is_required=data.is_required, position=call_count,
            )

        mock_service = AsyncMock()
        mock_service.create_form_field = mock_create

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            r1 = await client.post(
                "/api/admin/projects/1/form-fields",
                headers={"Authorization": "Bearer faketoken"},
                json={"label": "First Field", "type": "text", "is_required": False},
            )
            assert r1.status_code == 201
            assert r1.json()["position"] == 1

            r2 = await client.post(
                "/api/admin/projects/1/form-fields",
                headers={"Authorization": "Bearer faketoken"},
                json={"label": "Second Field", "type": "checkbox", "is_required": False},
            )
            assert r2.status_code == 201
            assert r2.json()["position"] == 2

            r3 = await client.post(
                "/api/admin/projects/1/form-fields",
                headers={"Authorization": "Bearer faketoken"},
                json={"label": "Third Field", "type": "integer", "is_required": True},
            )
            assert r3.status_code == 201
            assert r3.json()["position"] == 3
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_form_fields(self, client: AsyncClient):
        mock_service = AsyncMock()
        mock_service.check_project_access.return_value = True
        mock_service.get_form_fields.return_value = [
            _make_field(id=1, project_id=1, label="Rating", type="rating", position=0),
            _make_field(id=2, project_id=1, label="Field A", type="text", position=1),
            _make_field(id=3, project_id=1, label="Field B", type="rating", is_required=True, position=2),
        ]

        app.dependency_overrides[get_current_user] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.get(
                "/api/projects/1/form-fields",
                headers={"Authorization": "Bearer faketoken"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 3
            assert data[0]["label"] == "Rating"
            assert data[1]["label"] == "Field A"
            assert data[2]["label"] == "Field B"
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_single_form_field(self, client: AsyncClient):
        field = _make_field(id=5, project_id=1, label="Test Field", type="checkbox", position=1)
        mock_service = AsyncMock()
        mock_service.check_project_access.return_value = True
        mock_service.get_form_field.return_value = field

        app.dependency_overrides[get_current_user] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.get(
                "/api/projects/1/form-fields/5",
                headers={"Authorization": "Bearer faketoken"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == 5
            assert data["label"] == "Test Field"
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_update_form_field(self, client: AsyncClient):
        original = _make_field(id=5, project_id=1, label="Original Label", type="text", position=1)
        updated = _make_field(id=5, project_id=1, label="Updated Label", type="text", is_required=True, position=1)

        mock_service = AsyncMock()
        mock_service.get_form_field.return_value = original
        mock_service.update_form_field.return_value = updated

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.put(
                "/api/admin/projects/1/form-fields/5",
                headers={"Authorization": "Bearer faketoken"},
                json={"label": "Updated Label", "is_required": True},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["label"] == "Updated Label"
            assert data["is_required"] is True
            assert data["type"] == "text"
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_delete_form_field(self, client: AsyncClient):
        field = _make_field(id=5, project_id=1, label="To Delete", type="text", position=1)
        mock_service = AsyncMock()
        mock_service.get_form_field.return_value = field
        mock_service.delete_form_field.return_value = True

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.delete(
                "/api/admin/projects/1/form-fields/5",
                headers={"Authorization": "Bearer faketoken"},
            )
            assert response.status_code == 200
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_reorder_form_fields(self, client: AsyncClient):
        mock_service = AsyncMock()
        mock_service.reorder_form_fields.return_value = [
            _make_field(id=3, project_id=1, label="Third", position=0),
            _make_field(id=1, project_id=1, label="First", position=1),
            _make_field(id=2, project_id=1, label="Second", position=2),
            _make_field(id=4, project_id=1, label="Rating", type="rating", position=3),
        ]

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.patch(
                "/api/admin/projects/1/form-fields/reorder",
                headers={"Authorization": "Bearer faketoken"},
                json=[3, 1, 2, 4],
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 4
            assert data[0]["id"] == 3
            assert data[0]["position"] == 0
            assert data[1]["id"] == 1
            assert data[1]["position"] == 1
            assert data[2]["id"] == 2
            assert data[2]["position"] == 2
            assert data[3]["id"] == 4
            assert data[3]["position"] == 3
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_create_form_field_invalid_type(self, client: AsyncClient):
        mock_service = AsyncMock()
        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.post(
                "/api/admin/projects/1/form-fields",
                headers={"Authorization": "Bearer faketoken"},
                json={"label": "Invalid", "type": "invalid_type", "is_required": False},
            )
            assert response.status_code == 422
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_create_form_field_empty_label(self, client: AsyncClient):
        mock_service = AsyncMock()
        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.post(
                "/api/admin/projects/1/form-fields",
                headers={"Authorization": "Bearer faketoken"},
                json={"label": "", "type": "text", "is_required": False},
            )
            assert response.status_code == 422
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_form_field_not_found(self, client: AsyncClient):
        mock_service = AsyncMock()
        mock_service.check_project_access.return_value = True
        mock_service.get_form_field.return_value = None

        app.dependency_overrides[get_current_user] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.get(
                "/api/projects/1/form-fields/99999",
                headers={"Authorization": "Bearer faketoken"},
            )
            assert response.status_code == 404
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_update_form_field_not_found(self, client: AsyncClient):
        mock_service = AsyncMock()
        mock_service.get_form_field.return_value = None

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.put(
                "/api/admin/projects/1/form-fields/99999",
                headers={"Authorization": "Bearer faketoken"},
                json={"label": "New Label"},
            )
            assert response.status_code == 404
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_delete_form_field_not_found(self, client: AsyncClient):
        mock_service = AsyncMock()
        mock_service.get_form_field.return_value = None

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.delete(
                "/api/admin/projects/1/form-fields/99999",
                headers={"Authorization": "Bearer faketoken"},
            )
            assert response.status_code == 404
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_form_field_requires_authentication(self, client: AsyncClient):
        response = await client.get("/api/projects/1/form-fields")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_create_form_field_requires_admin(self, client: AsyncClient):
        mock_service = AsyncMock()
        app.dependency_overrides[get_current_admin] = lambda: (_ for _ in ()).throw(
            __import__('fastapi').HTTPException(status_code=401, detail="No valid admin session")
        )
        app.dependency_overrides[get_form_field_service] = lambda: mock_service
        try:
            response = await client.post(
                "/api/admin/projects/1/form-fields",
                headers={"Authorization": "Bearer faketoken"},
                json={"label": "Test", "type": "text", "is_required": False},
            )
            assert response.status_code == 401
        finally:
            app.dependency_overrides.clear()


class TestFormFieldsIntegration:
    """Integration tests for form field endpoints using a real database."""

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
    <mutation detected='true' status='KILLED' numberOfTestsRun='1'>
        <sourceFile>Test.java</sourceFile>
        <mutatedClass>com.Test</mutatedClass>
        <mutatedMethod>run</mutatedMethod>
        <methodDescription>()V</methodDescription>
        <lineNumber>1</lineNumber>
        <mutator>MATH</mutator>
        <killingTest>com.TestTest.test1</killingTest>
        <description>test</description>
    </mutation>
</mutations>"""
        response = await client.post(
            "/api/admin/projects/",
            headers={"Authorization": f"Bearer {token}"},
            data={"project_name": unique_name},
            files={"file": ("mutations.xml", BytesIO(xml_content), "application/xml")}
        )
        assert response.status_code == 201
        return response.json()["id"]

    @pytest.mark.asyncio
    async def test_create_get_update_delete_form_field(self, client: AsyncClient):
        """Full CRUD lifecycle for a form field."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "ff_crud_int")

        # Create a new form field
        create_response = await client.post(
            f"/api/admin/projects/{project_id}/form-fields",
            headers={"Authorization": f"Bearer {token}"},
            json={"label": "Severity", "type": "rating", "is_required": True}
        )
        assert create_response.status_code == 201
        field = create_response.json()
        field_id = field["id"]
        assert field["label"] == "Severity"
        assert field["type"] == "rating"
        assert field["is_required"] is True

        # Get the single form field
        get_response = await client.get(
            f"/api/projects/{project_id}/form-fields/{field_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert get_response.status_code == 200
        assert get_response.json()["id"] == field_id
        assert get_response.json()["label"] == "Severity"

        # Update the form field
        update_response = await client.put(
            f"/api/admin/projects/{project_id}/form-fields/{field_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={"label": "Severity Level", "is_required": False}
        )
        assert update_response.status_code == 200
        assert update_response.json()["label"] == "Severity Level"
        assert update_response.json()["is_required"] is False

        # Delete the form field
        delete_response = await client.delete(
            f"/api/admin/projects/{project_id}/form-fields/{field_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert delete_response.status_code == 200

        # Verify deleted — get single field returns 404
        get_after_delete = await client.get(
            f"/api/projects/{project_id}/form-fields/{field_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert get_after_delete.status_code == 404

        await client.delete(
            f"/api/admin/projects/{project_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

    @pytest.mark.asyncio
    async def test_reorder_form_fields(self, client: AsyncClient):
        """Reordering form fields updates their positions correctly."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "ff_reorder_int")

        # Project already has a default "Rating" field; add two more
        await client.post(
            f"/api/admin/projects/{project_id}/form-fields",
            headers={"Authorization": f"Bearer {token}"},
            json={"label": "Notes", "type": "text", "is_required": False}
        )
        await client.post(
            f"/api/admin/projects/{project_id}/form-fields",
            headers={"Authorization": f"Bearer {token}"},
            json={"label": "Score", "type": "integer", "is_required": True}
        )

        # Get all fields to know current IDs and positions
        all_fields_response = await client.get(
            f"/api/projects/{project_id}/form-fields",
            headers={"Authorization": f"Bearer {token}"}
        )
        fields = all_fields_response.json()
        assert len(fields) == 3
        ids_in_order = [f["id"] for f in fields]

        # Reorder: reverse the order
        reversed_ids = list(reversed(ids_in_order))
        reorder_response = await client.patch(
            f"/api/admin/projects/{project_id}/form-fields/reorder",
            headers={"Authorization": f"Bearer {token}"},
            json=reversed_ids
        )
        assert reorder_response.status_code == 200
        reordered = reorder_response.json()
        assert [f["id"] for f in reordered] == reversed_ids

        await client.delete(
            f"/api/admin/projects/{project_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
