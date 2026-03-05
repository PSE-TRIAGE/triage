"""
Direct repository unit tests for methods not exercised via the API layer.
Covers:
  - repositories/form_field_value_repository.py (create, create_many, find_by_id, update, delete_by_rating_id)
  - repositories/rating_repository.py (create, find_by_id, delete, find_by_project_and_user, find_by_project)
"""
import uuid
import pytest
from io import BytesIO
from httpx import AsyncClient

from core.database import db
from repositories.form_field_value_repository import FormFieldValueRepository
from repositories.rating_repository import RatingRepository
from .conftest import TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD


# ---------------------------------------------------------------------------
# Helpers shared across test classes
# ---------------------------------------------------------------------------

async def _admin_token(client: AsyncClient) -> str:
    r = await client.post(
        "/api/login",
        json={"username": TEST_ADMIN_USERNAME, "password": TEST_ADMIN_PASSWORD},
    )
    return r.json()["token"]


async def _create_project(client: AsyncClient, token: str) -> tuple[int, int, int]:
    """Create a project and return (project_id, mutant_id, form_field_id)."""
    name = f"repo_unit_{uuid.uuid4().hex[:8]}"
    xml = b"""<?xml version="1.0" encoding="UTF-8"?>
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
    r = await client.post(
        "/api/admin/projects/",
        headers={"Authorization": f"Bearer {token}"},
        data={"project_name": name},
        files={"file": ("mutations.xml", BytesIO(xml), "application/xml")},
    )
    assert r.status_code == 201, r.text
    project_id = r.json()["id"]

    mutants_r = await client.get(
        f"/api/projects/{project_id}/mutants",
        headers={"Authorization": f"Bearer {token}"},
    )
    mutant_id = mutants_r.json()[0]["id"]

    ff_r = await client.get(
        f"/api/projects/{project_id}/form-fields",
        headers={"Authorization": f"Bearer {token}"},
    )
    form_field_id = ff_r.json()[0]["id"]

    return project_id, mutant_id, form_field_id


async def _delete_project(client: AsyncClient, token: str, project_id: int):
    await client.delete(
        f"/api/admin/projects/{project_id}",
        headers={"Authorization": f"Bearer {token}"},
    )


async def _get_admin_id(client: AsyncClient, token: str) -> int:
    r = await client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"})
    return next(u["id"] for u in r.json() if u["username"] == TEST_ADMIN_USERNAME)


# ---------------------------------------------------------------------------
# FormFieldValueRepository
# ---------------------------------------------------------------------------

class TestFormFieldValueRepository:
    """
    Covers form_field_value_repository.py lines 11-20, 23-36, 51-60, 63-73, 76-82.
    These methods are not called by any service/router, so we test the repo directly.
    """

    @pytest.mark.asyncio
    async def test_create_returns_id(self, client: AsyncClient):
        token = await _admin_token(client)
        project_id, mutant_id, ff_id = await _create_project(client, token)
        admin_id = await _get_admin_id(client, token)

        rating_repo = RatingRepository(db)
        ffv_repo = FormFieldValueRepository(db)

        try:
            rating_id = await rating_repo.create(mutant_id, admin_id)
            assert isinstance(rating_id, int)
            assert rating_id > 0

            value_id = await ffv_repo.create(ff_id, rating_id, "3")
            assert isinstance(value_id, int)
            assert value_id > 0
        finally:
            await _delete_project(client, token, project_id)

    @pytest.mark.asyncio
    async def test_create_many_returns_ids(self, client: AsyncClient):
        token = await _admin_token(client)
        project_id, mutant_id, ff_id = await _create_project(client, token)
        admin_id = await _get_admin_id(client, token)

        rating_repo = RatingRepository(db)
        ffv_repo = FormFieldValueRepository(db)

        try:
            rating_id = await rating_repo.create(mutant_id, admin_id)
            ids = await ffv_repo.create_many(rating_id, [{"form_field_id": ff_id, "value": "5"}])
            assert isinstance(ids, list)
            assert len(ids) == 1
            assert isinstance(ids[0], int)
        finally:
            await _delete_project(client, token, project_id)

    @pytest.mark.asyncio
    async def test_find_by_id_returns_row(self, client: AsyncClient):
        token = await _admin_token(client)
        project_id, mutant_id, ff_id = await _create_project(client, token)
        admin_id = await _get_admin_id(client, token)

        rating_repo = RatingRepository(db)
        ffv_repo = FormFieldValueRepository(db)

        try:
            rating_id = await rating_repo.create(mutant_id, admin_id)
            value_id = await ffv_repo.create(ff_id, rating_id, "4")

            row = await ffv_repo.find_by_id(value_id)
            assert row is not None
            assert row["id"] == value_id
            assert row["value"] == "4"
        finally:
            await _delete_project(client, token, project_id)

    @pytest.mark.asyncio
    async def test_find_by_id_returns_none_for_missing(self, client: AsyncClient):
        ffv_repo = FormFieldValueRepository(db)
        row = await ffv_repo.find_by_id(999999)
        assert row is None

    @pytest.mark.asyncio
    async def test_update_changes_value(self, client: AsyncClient):
        token = await _admin_token(client)
        project_id, mutant_id, ff_id = await _create_project(client, token)
        admin_id = await _get_admin_id(client, token)

        rating_repo = RatingRepository(db)
        ffv_repo = FormFieldValueRepository(db)

        try:
            rating_id = await rating_repo.create(mutant_id, admin_id)
            value_id = await ffv_repo.create(ff_id, rating_id, "2")

            updated = await ffv_repo.update(value_id, "5")
            assert updated is not None
            assert updated["value"] == "5"
            assert updated["id"] == value_id
        finally:
            await _delete_project(client, token, project_id)

    @pytest.mark.asyncio
    async def test_update_returns_none_for_missing(self, client: AsyncClient):
        ffv_repo = FormFieldValueRepository(db)
        result = await ffv_repo.update(999999, "new_value")
        assert result is None

    @pytest.mark.asyncio
    async def test_delete_by_rating_id_removes_values(self, client: AsyncClient):
        token = await _admin_token(client)
        project_id, mutant_id, ff_id = await _create_project(client, token)
        admin_id = await _get_admin_id(client, token)

        rating_repo = RatingRepository(db)
        ffv_repo = FormFieldValueRepository(db)

        try:
            rating_id = await rating_repo.create(mutant_id, admin_id)
            await ffv_repo.create(ff_id, rating_id, "1")

            count = await ffv_repo.delete_by_rating_id(rating_id)
            assert count == 1

            remaining = await ffv_repo.find_by_rating_id(rating_id)
            assert remaining == []
        finally:
            await _delete_project(client, token, project_id)


# ---------------------------------------------------------------------------
# RatingRepository
# ---------------------------------------------------------------------------

class TestRatingRepository:
    """
    Covers rating_repository.py lines 11-20, 23-32, 60-65, 93-103, 106-117.
    """

    @pytest.mark.asyncio
    async def test_create_returns_id(self, client: AsyncClient):
        token = await _admin_token(client)
        project_id, mutant_id, _ = await _create_project(client, token)
        admin_id = await _get_admin_id(client, token)
        rating_repo = RatingRepository(db)

        try:
            rating_id = await rating_repo.create(mutant_id, admin_id)
            assert isinstance(rating_id, int)
            assert rating_id > 0
        finally:
            await _delete_project(client, token, project_id)

    @pytest.mark.asyncio
    async def test_find_by_id_returns_row(self, client: AsyncClient):
        token = await _admin_token(client)
        project_id, mutant_id, _ = await _create_project(client, token)
        admin_id = await _get_admin_id(client, token)
        rating_repo = RatingRepository(db)

        try:
            rating_id = await rating_repo.create(mutant_id, admin_id)
            row = await rating_repo.find_by_id(rating_id)
            assert row is not None
            assert row["id"] == rating_id
            assert row["mutant_id"] == mutant_id
            assert row["user_id"] == admin_id
        finally:
            await _delete_project(client, token, project_id)

    @pytest.mark.asyncio
    async def test_find_by_id_returns_none_for_missing(self, client: AsyncClient):
        rating_repo = RatingRepository(db)
        row = await rating_repo.find_by_id(999999)
        assert row is None

    @pytest.mark.asyncio
    async def test_delete_removes_rating(self, client: AsyncClient):
        token = await _admin_token(client)
        project_id, mutant_id, _ = await _create_project(client, token)
        admin_id = await _get_admin_id(client, token)
        rating_repo = RatingRepository(db)

        try:
            rating_id = await rating_repo.create(mutant_id, admin_id)
            deleted = await rating_repo.delete(rating_id)
            assert deleted is True

            row = await rating_repo.find_by_id(rating_id)
            assert row is None
        finally:
            await _delete_project(client, token, project_id)

    @pytest.mark.asyncio
    async def test_delete_returns_false_for_missing(self, client: AsyncClient):
        rating_repo = RatingRepository(db)
        result = await rating_repo.delete(999999)
        assert result is False

    @pytest.mark.asyncio
    async def test_find_by_project_and_user(self, client: AsyncClient):
        token = await _admin_token(client)
        project_id, mutant_id, ff_id = await _create_project(client, token)
        admin_id = await _get_admin_id(client, token)
        rating_repo = RatingRepository(db)

        try:
            await rating_repo.create(mutant_id, admin_id)
            rows = await rating_repo.find_by_project_and_user(project_id, admin_id)
            assert isinstance(rows, list)
            assert len(rows) >= 1
            assert all(r["user_id"] == admin_id for r in rows)
        finally:
            await _delete_project(client, token, project_id)

    @pytest.mark.asyncio
    async def test_find_by_project_returns_all_ratings(self, client: AsyncClient):
        token = await _admin_token(client)
        project_id, mutant_id, ff_id = await _create_project(client, token)
        admin_id = await _get_admin_id(client, token)
        rating_repo = RatingRepository(db)

        try:
            await rating_repo.create(mutant_id, admin_id)
            rows = await rating_repo.find_by_project(project_id)
            assert isinstance(rows, list)
            assert len(rows) >= 1
            assert all("mutant_id" in r for r in rows)
        finally:
            await _delete_project(client, token, project_id)

    @pytest.mark.asyncio
    async def test_find_by_project_empty_for_no_ratings(self, client: AsyncClient):
        token = await _admin_token(client)
        project_id, _, _ = await _create_project(client, token)
        rating_repo = RatingRepository(db)

        try:
            rows = await rating_repo.find_by_project(project_id)
            assert rows == []
        finally:
            await _delete_project(client, token, project_id)
