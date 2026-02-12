import pytest
import uuid
from httpx import AsyncClient
from io import BytesIO
from .conftest import TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD


class TestAlgorithms:
    """Test cases for algorithm endpoints."""

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

    async def _create_test_project(self, client: AsyncClient, token: str, project_name: str) -> int:
        """Helper method to create a test project and return its ID."""
        unique_name = f"{project_name}_{uuid.uuid4().hex[:8]}"
        xml_content = b"""<?xml version="1.0" encoding="UTF-8"?>
<mutations>
    <mutation detected='true' status='KILLED' numberOfTestsRun='5'>
        <sourceFile>ZFile.java</sourceFile>
        <mutatedClass>com.example.ZFile</mutatedClass>
        <mutatedMethod>zMethod</mutatedMethod>
        <methodDescription>()V</methodDescription>
        <lineNumber>100</lineNumber>
        <mutator>CONDITIONALS_BOUNDARY</mutator>
        <killingTest>com.example.Test.test1</killingTest>
        <description>changed conditional boundary</description>
    </mutation>
    <mutation detected='false' status='SURVIVED' numberOfTestsRun='3'>
        <sourceFile>AFile.java</sourceFile>
        <mutatedClass>com.example.AFile</mutatedClass>
        <mutatedMethod>aMethod</mutatedMethod>
        <methodDescription>(I)V</methodDescription>
        <lineNumber>10</lineNumber>
        <mutator>NEGATE_CONDITIONALS</mutator>
        <killingTest></killingTest>
        <description>negated conditional</description>
    </mutation>
    <mutation detected='true' status='KILLED' numberOfTestsRun='2'>
        <sourceFile>AFile.java</sourceFile>
        <mutatedClass>com.example.AFile</mutatedClass>
        <mutatedMethod>bMethod</mutatedMethod>
        <methodDescription>()V</methodDescription>
        <lineNumber>5</lineNumber>
        <mutator>MATH</mutator>
        <killingTest>com.example.Test.test2</killingTest>
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
    async def test_list_algorithms(self, client: AsyncClient):
        """Test listing available algorithms."""
        token = await self._get_admin_token(client)

        response = await client.get(
            "/api/algorithms",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "algorithms" in data
        assert len(data["algorithms"]) >= 2  # At least lexicographical and status_priority

        algo_ids = [algo["id"] for algo in data["algorithms"]]
        assert "lexicographical_rank" in algo_ids
        assert "status_priority_rank" in algo_ids

        for algo in data["algorithms"]:
            assert "id" in algo
            assert "name" in algo
            assert "description" in algo

    @pytest.mark.asyncio
    async def test_list_algorithms_requires_admin(self, client: AsyncClient):
        """Test that listing algorithms requires admin authentication."""
        response = await client.get("/api/algorithms")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_apply_algorithm_requires_admin(self, client: AsyncClient):
        """Test that applying an algorithm requires admin privileges."""
        response = await client.post(
            "/api/projects/1/algorithm",
            json={"algorithm": "lexicographical_rank"}
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_apply_lexicographical_algorithm(self, client: AsyncClient):
        """Test applying the lexicographical ranking algorithm."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "algo_test_lex")

        response = await client.post(
            f"/api/projects/{project_id}/algorithm",
            headers={"Authorization": f"Bearer {token}"},
            json={"algorithm": "lexicographical_rank"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["algorithm_name"] == "Lexicographical Rank"
        assert data["mutants_ranked"] == 3

    @pytest.mark.asyncio
    async def test_apply_status_priority_algorithm(self, client: AsyncClient):
        """Test applying the status priority ranking algorithm."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "algo_test_status")

        response = await client.post(
            f"/api/projects/{project_id}/algorithm",
            headers={"Authorization": f"Bearer {token}"},
            json={"algorithm": "status_priority_rank"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["algorithm_name"] == "Status Priority Rank"
        assert data["mutants_ranked"] == 3

    @pytest.mark.asyncio
    async def test_apply_unknown_algorithm(self, client: AsyncClient):
        """Test applying a non-existent algorithm returns 404."""
        token = await self._get_admin_token(client)
        project_id = await self._create_test_project(client, token, "algo_test_unknown")

        response = await client.post(
            f"/api/projects/{project_id}/algorithm",
            headers={"Authorization": f"Bearer {token}"},
            json={"algorithm": "nonexistent_algorithm"}
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_apply_algorithm_empty_project(self, client: AsyncClient):
        """Test applying algorithm to empty project."""
        token = await self._get_admin_token(client)

        # Create empty project
        unique_name = f"algo_test_empty_{uuid.uuid4().hex[:8]}"
        xml_content = b"""<?xml version="1.0" encoding="UTF-8"?>
<mutations></mutations>"""

        create_response = await client.post(
            "/api/admin/projects/",
            headers={"Authorization": f"Bearer {token}"},
            data={"project_name": unique_name},
            files={"file": ("mutations.xml", BytesIO(xml_content), "application/xml")}
        )
        project_id = create_response.json()["id"]

        response = await client.post(
            f"/api/projects/{project_id}/algorithm",
            headers={"Authorization": f"Bearer {token}"},
            json={"algorithm": "lexicographical_rank"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["mutants_ranked"] == 0

    @pytest.mark.asyncio
    async def test_apply_algorithm_invalid_request(self, client: AsyncClient):
        """Test applying algorithm with invalid request body."""
        token = await self._get_admin_token(client)

        response = await client.post(
            "/api/projects/1/algorithm",
            headers={"Authorization": f"Bearer {token}"},
            json={}  # Missing algorithm field
        )

        assert response.status_code == 422
