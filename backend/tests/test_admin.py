import pytest
import uuid
from unittest.mock import AsyncMock
from httpx import AsyncClient
from io import BytesIO

from main import app
from dependencies import get_current_admin, get_auth_service, get_project_service, get_form_field_service
from models.auth import UserResponse
from services.project import ProjectNameExistsError
from .conftest import TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD


FAKE_ADMIN = UserResponse(id=1, username="admin", is_admin=True, is_active=True)
FAKE_USER = UserResponse(id=2, username="user2", is_admin=False, is_active=True)

VALID_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
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


class TestAdmin:

    @pytest.fixture(autouse=True)
    def override_dependencies(self):
        mock_auth = AsyncMock()
        mock_project = AsyncMock()
        mock_form_field = AsyncMock()

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_auth_service] = lambda: mock_auth
        app.dependency_overrides[get_project_service] = lambda: mock_project
        app.dependency_overrides[get_form_field_service] = lambda: mock_form_field
        yield mock_auth, mock_project, mock_form_field
        app.dependency_overrides.clear()

    # --- validation tests ---

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

    # --- user management ---

    @pytest.mark.asyncio
    async def test_register_user_success(self, client: AsyncClient, override_dependencies):
        mock_auth, _, _ = override_dependencies
        response = await client.post(
            "/api/admin/users",
            headers={"Authorization": "Bearer faketoken"},
            json={"username": "newuser", "password": "password123"}
        )
        assert response.status_code == 200
        mock_auth.register.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_all_users(self, client: AsyncClient, override_dependencies):
        mock_auth, _, _ = override_dependencies
        mock_auth.get_all_users.return_value = [FAKE_ADMIN, FAKE_USER]
        response = await client.get(
            "/api/admin/users",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_delete_user_success(self, client: AsyncClient, override_dependencies):
        mock_auth, _, _ = override_dependencies
        response = await client.delete(
            "/api/admin/users/2",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 200
        mock_auth.delete_user.assert_called_once_with(2)

    @pytest.mark.asyncio
    async def test_delete_user_self_forbidden(self, client: AsyncClient):
        response = await client.delete(
            "/api/admin/users/1",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_reset_user_password(self, client: AsyncClient, override_dependencies):
        mock_auth, _, _ = override_dependencies
        response = await client.patch(
            "/api/admin/users/2/reset",
            headers={"Authorization": "Bearer faketoken"},
            json={"username": "user2", "new_password": "newpassword123"}
        )
        assert response.status_code == 200
        mock_auth.reset.assert_called_once_with(2, "newpassword123")

    @pytest.mark.asyncio
    async def test_promote_user(self, client: AsyncClient, override_dependencies):
        mock_auth, _, _ = override_dependencies
        response = await client.patch(
            "/api/admin/users/promote/2",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 200
        mock_auth.set_user_admin_status.assert_called_once_with(2, True)

    @pytest.mark.asyncio
    async def test_demote_user_success(self, client: AsyncClient, override_dependencies):
        mock_auth, _, _ = override_dependencies
        response = await client.patch(
            "/api/admin/users/demote/2",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 200
        mock_auth.set_user_admin_status.assert_called_once_with(2, False)

    @pytest.mark.asyncio
    async def test_demote_user_self_forbidden(self, client: AsyncClient):
        response = await client.patch(
            "/api/admin/users/demote/1",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_disable_user_success(self, client: AsyncClient, override_dependencies):
        mock_auth, _, _ = override_dependencies
        mock_auth.get_user_by_id.return_value = FAKE_USER
        response = await client.patch(
            "/api/admin/users/2/disable",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 200
        mock_auth.disable_user.assert_called_once_with(2)

    @pytest.mark.asyncio
    async def test_disable_user_self_forbidden(self, client: AsyncClient):
        response = await client.patch(
            "/api/admin/users/1/disable",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_disable_user_not_found(self, client: AsyncClient, override_dependencies):
        mock_auth, _, _ = override_dependencies
        mock_auth.get_user_by_id.return_value = None
        response = await client.patch(
            "/api/admin/users/99/disable",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_enable_user_success(self, client: AsyncClient, override_dependencies):
        mock_auth, _, _ = override_dependencies
        mock_auth.get_user_by_id.return_value = FAKE_USER
        response = await client.patch(
            "/api/admin/users/2/enable",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 200
        mock_auth.enable_user.assert_called_once_with(2)

    @pytest.mark.asyncio
    async def test_enable_user_not_found(self, client: AsyncClient, override_dependencies):
        mock_auth, _, _ = override_dependencies
        mock_auth.get_user_by_id.return_value = None
        response = await client.patch(
            "/api/admin/users/99/enable",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_user_projects_success(self, client: AsyncClient, override_dependencies):
        mock_auth, mock_project, _ = override_dependencies
        mock_auth.get_user_by_id.return_value = FAKE_USER
        mock_project.get_user_projects.return_value = []
        response = await client.get(
            "/api/admin/users/2/projects",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_get_user_projects_user_not_found(self, client: AsyncClient, override_dependencies):
        mock_auth, _, _ = override_dependencies
        mock_auth.get_user_by_id.return_value = None
        response = await client.get(
            "/api/admin/users/99/projects",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 404

    # --- project management ---

    @pytest.mark.asyncio
    async def test_get_all_projects(self, client: AsyncClient, override_dependencies):
        _, mock_project, _ = override_dependencies
        mock_project.get_all_projects.return_value = []
        response = await client.get(
            "/api/admin/projects",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_create_project_success(self, client: AsyncClient, override_dependencies):
        _, mock_project, _ = override_dependencies
        mock_project.create.return_value = 42
        response = await client.post(
            "/api/admin/projects/",
            headers={"Authorization": "Bearer faketoken"},
            data={"project_name": "my_project"},
            files={"file": ("mutations.xml", BytesIO(VALID_XML), "application/xml")}
        )
        assert response.status_code == 201
        assert response.json()["id"] == 42

    @pytest.mark.asyncio
    async def test_create_project_duplicate_name(self, client: AsyncClient, override_dependencies):
        _, mock_project, _ = override_dependencies
        mock_project.create.side_effect = ProjectNameExistsError("already exists")
        response = await client.post(
            "/api/admin/projects/",
            headers={"Authorization": "Bearer faketoken"},
            data={"project_name": "my_project"},
            files={"file": ("mutations.xml", BytesIO(VALID_XML), "application/xml")}
        )
        assert response.status_code == 409

    @pytest.mark.asyncio
    async def test_create_project_malformed_xml(self, client: AsyncClient):
        response = await client.post(
            "/api/admin/projects/",
            headers={"Authorization": "Bearer faketoken"},
            data={"project_name": "my_project"},
            files={"file": ("mutations.xml", BytesIO(b"not valid xml!!!"), "application/xml")}
        )
        assert response.status_code in (400, 500)

    @pytest.mark.asyncio
    async def test_delete_project_success(self, client: AsyncClient, override_dependencies):
        _, mock_project, _ = override_dependencies
        mock_project.does_project_exsist.return_value = True
        response = await client.delete(
            "/api/admin/projects/1",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 200
        mock_project.delete.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_delete_project_not_found(self, client: AsyncClient, override_dependencies):
        _, mock_project, _ = override_dependencies
        mock_project.does_project_exsist.return_value = False
        response = await client.delete(
            "/api/admin/projects/99",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_rename_project_success(self, client: AsyncClient, override_dependencies):
        _, mock_project, _ = override_dependencies
        mock_project.does_project_exsist.return_value = True
        response = await client.patch(
            "/api/admin/projects/1/name",
            headers={"Authorization": "Bearer faketoken"},
            json={"name": "New Name"}
        )
        assert response.status_code == 200
        assert response.json()["name"] == "New Name"

    @pytest.mark.asyncio
    async def test_rename_project_not_found(self, client: AsyncClient, override_dependencies):
        _, mock_project, _ = override_dependencies
        mock_project.does_project_exsist.return_value = False
        response = await client.patch(
            "/api/admin/projects/99/name",
            headers={"Authorization": "Bearer faketoken"},
            json={"name": "New Name"}
        )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_rename_project_name_conflict(self, client: AsyncClient, override_dependencies):
        _, mock_project, _ = override_dependencies
        mock_project.does_project_exsist.return_value = True
        mock_project.rename.side_effect = ProjectNameExistsError("already exists")
        response = await client.patch(
            "/api/admin/projects/1/name",
            headers={"Authorization": "Bearer faketoken"},
            json={"name": "Existing Name"}
        )
        assert response.status_code == 409

    @pytest.mark.asyncio
    async def test_get_project_users_success(self, client: AsyncClient, override_dependencies):
        _, mock_project, _ = override_dependencies
        mock_project.does_project_exsist.return_value = True
        mock_project.get_project_users.return_value = []
        response = await client.get(
            "/api/admin/projects/1/users",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_get_project_users_not_found(self, client: AsyncClient, override_dependencies):
        _, mock_project, _ = override_dependencies
        mock_project.does_project_exsist.return_value = False
        response = await client.get(
            "/api/admin/projects/99/users",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_add_user_to_project(self, client: AsyncClient, override_dependencies):
        _, mock_project, _ = override_dependencies
        response = await client.patch(
            "/api/admin/projects/1/users/add/2",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 201
        mock_project.add_user.assert_called_once_with(1, 2)

    @pytest.mark.asyncio
    async def test_remove_user_from_project_success(self, client: AsyncClient, override_dependencies):
        _, mock_project, _ = override_dependencies
        response = await client.patch(
            "/api/admin/projects/1/users/remove/2",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 200
        mock_project.remove_user.assert_called_once_with(1, 2)

    @pytest.mark.asyncio
    async def test_remove_self_from_project_forbidden(self, client: AsyncClient):
        response = await client.patch(
            "/api/admin/projects/1/users/remove/1",
            headers={"Authorization": "Bearer faketoken"}
        )
        assert response.status_code == 400


class TestAdminIntegration:
    """Integration tests for admin operations using a real database."""

    async def _get_admin_token(self, client: AsyncClient) -> str:
        response = await client.post(
            "/api/login",
            json={"username": TEST_ADMIN_USERNAME, "password": TEST_ADMIN_PASSWORD}
        )
        return response.json()["token"]

    async def _create_test_user(self, client: AsyncClient, token: str, username: str,
                                password: str = "TestPass123!") -> None:
        await client.post(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {token}"},
            json={"username": username, "password": password}
        )

    async def _get_user_id(self, client: AsyncClient, token: str, username: str) -> int:
        response = await client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"})
        user = next(u for u in response.json() if u["username"] == username)
        return user["id"]

    async def _delete_user(self, client: AsyncClient, token: str, user_id: int) -> None:
        await client.delete(f"/api/admin/users/{user_id}", headers={"Authorization": f"Bearer {token}"})

    async def _create_test_project(self, client: AsyncClient, token: str, name: str) -> int:
        unique_name = f"{name}_{uuid.uuid4().hex[:8]}"
        xml_content = b"""<?xml version="1.0" encoding="UTF-8"?>
<mutations>
    <mutation detected='true' status='KILLED' numberOfTestsRun='2'>
        <sourceFile>Admin.java</sourceFile>
        <mutatedClass>com.Admin</mutatedClass>
        <mutatedMethod>go</mutatedMethod>
        <methodDescription>()V</methodDescription>
        <lineNumber>5</lineNumber>
        <mutator>MATH</mutator>
        <killingTest>com.AdminTest.test</killingTest>
        <description>admin test mutation</description>
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

    async def _delete_project(self, client: AsyncClient, token: str, project_id: int) -> None:
        await client.delete(f"/api/admin/projects/{project_id}", headers={"Authorization": f"Bearer {token}"})

    @pytest.mark.asyncio
    async def test_disable_and_enable_user(self, client: AsyncClient):
        """Disabled user cannot login; re-enabled user can login again."""
        token = await self._get_admin_token(client)
        username = f"disable_test_{uuid.uuid4().hex[:8]}"
        password = "TestPass123!"
        await self._create_test_user(client, token, username, password)
        user_id = await self._get_user_id(client, token, username)

        disable_response = await client.patch(
            f"/api/admin/users/{user_id}/disable",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert disable_response.status_code == 200

        # Login should fail for disabled user
        login_disabled = await client.post(
            "/api/login", json={"username": username, "password": password}
        )
        assert login_disabled.status_code == 401

        enable_response = await client.patch(
            f"/api/admin/users/{user_id}/enable",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert enable_response.status_code == 200

        # Login should succeed again
        login_enabled = await client.post(
            "/api/login", json={"username": username, "password": password}
        )
        assert login_enabled.status_code == 200

        await self._delete_user(client, token, user_id)

    @pytest.mark.asyncio
    async def test_reset_password(self, client: AsyncClient):
        """After password reset, old password fails and new password works."""
        token = await self._get_admin_token(client)
        username = f"reset_test_{uuid.uuid4().hex[:8]}"
        old_password = "OldPass123!"
        new_password = "NewPass456!"
        await self._create_test_user(client, token, username, old_password)
        user_id = await self._get_user_id(client, token, username)

        reset_response = await client.patch(
            f"/api/admin/users/{user_id}/reset",
            headers={"Authorization": f"Bearer {token}"},
            json={"username": username, "new_password": new_password}
        )
        assert reset_response.status_code == 200

        old_login = await client.post(
            "/api/login", json={"username": username, "password": old_password}
        )
        assert old_login.status_code == 401

        new_login = await client.post(
            "/api/login", json={"username": username, "password": new_password}
        )
        assert new_login.status_code == 200

        await self._delete_user(client, token, user_id)

    @pytest.mark.asyncio
    async def test_promote_and_demote_user(self, client: AsyncClient):
        """Promoted user can access admin endpoints; demoted user is denied."""
        token = await self._get_admin_token(client)
        username = f"promote_test_{uuid.uuid4().hex[:8]}"
        password = "TestPass123!"
        await self._create_test_user(client, token, username, password)
        user_id = await self._get_user_id(client, token, username)

        await client.patch(f"/api/admin/users/promote/{user_id}",
                           headers={"Authorization": f"Bearer {token}"})

        promoted_token = (await client.post(
            "/api/login", json={"username": username, "password": password}
        )).json()["token"]
        assert (await client.get(
            "/api/admin/users", headers={"Authorization": f"Bearer {promoted_token}"}
        )).status_code == 200

        await client.patch(f"/api/admin/users/demote/{user_id}",
                           headers={"Authorization": f"Bearer {token}"})

        demoted_token = (await client.post(
            "/api/login", json={"username": username, "password": password}
        )).json()["token"]
        assert (await client.get(
            "/api/admin/users", headers={"Authorization": f"Bearer {demoted_token}"}
        )).status_code == 401

        await self._delete_user(client, token, user_id)

    @pytest.mark.asyncio
    async def test_get_all_projects(self, client: AsyncClient):
        """GET /api/admin/projects returns all projects including newly created ones."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "all_proj_int")

        response = await client.get(
            "/api/admin/projects",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        ids = [p["id"] for p in response.json()]
        assert project_id in ids

        project = next(p for p in response.json() if p["id"] == project_id)
        assert project["total_mutants"] == 1

        await self._delete_project(client, token, project_id)

    @pytest.mark.asyncio
    async def test_rename_project(self, client: AsyncClient):
        """Renaming a project updates its name; renaming to a duplicate name returns 409."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "rename_int")
        project_id2 = await self._create_test_project(client, token, "rename_other_int")

        new_name = f"renamed_{uuid.uuid4().hex[:8]}"
        rename_response = await client.patch(
            f"/api/admin/projects/{project_id}/name",
            headers={"Authorization": f"Bearer {token}"},
            json={"name": new_name}
        )
        assert rename_response.status_code == 200

        all_projects = (await client.get(
            "/api/admin/projects", headers={"Authorization": f"Bearer {token}"}
        )).json()
        project = next(p for p in all_projects if p["id"] == project_id)
        assert project["name"] == new_name

        other_project = next(p for p in all_projects if p["id"] == project_id2)
        duplicate_response = await client.patch(
            f"/api/admin/projects/{project_id}/name",
            headers={"Authorization": f"Bearer {token}"},
            json={"name": other_project["name"]}
        )
        assert duplicate_response.status_code == 409

        await self._delete_project(client, token, project_id)
        await self._delete_project(client, token, project_id2)

    @pytest.mark.asyncio
    async def test_get_project_users_and_remove(self, client: AsyncClient):
        """Admin can list project users and remove them."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "proj_users_int")
        username = f"projuser_{uuid.uuid4().hex[:8]}"
        await self._create_test_user(client, token, username)
        user_id = await self._get_user_id(client, token, username)

        await client.patch(
            f"/api/admin/projects/{project_id}/users/add/{user_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

        users_response = await client.get(
            f"/api/admin/projects/{project_id}/users",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert users_response.status_code == 200
        assert user_id in [u["id"] for u in users_response.json()]

        remove_response = await client.patch(
            f"/api/admin/projects/{project_id}/users/remove/{user_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert remove_response.status_code == 200

        users_after = (await client.get(
            f"/api/admin/projects/{project_id}/users",
            headers={"Authorization": f"Bearer {token}"}
        )).json()
        assert user_id not in [u["id"] for u in users_after]

        await self._delete_user(client, token, user_id)
        await self._delete_project(client, token, project_id)

    @pytest.mark.asyncio
    async def test_get_user_projects_as_admin(self, client: AsyncClient):
        """Admin can query projects assigned to another user."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "user_proj_int")
        username = f"userprojtest_{uuid.uuid4().hex[:8]}"
        await self._create_test_user(client, token, username)
        user_id = await self._get_user_id(client, token, username)

        await client.patch(
            f"/api/admin/projects/{project_id}/users/add/{user_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

        response = await client.get(
            f"/api/admin/users/{user_id}/projects",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert project_id in [p["id"] for p in response.json()]

        await self._delete_user(client, token, user_id)
        await self._delete_project(client, token, project_id)
