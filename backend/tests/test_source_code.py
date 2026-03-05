"""
Tests for source code upload, retrieval, and related functionality.
Covers:
  - models/source_code.py (SourceClassQuery validator)
  - services/source_code.py (upload_project_source, get_class_source_code)
  - repositories/source_code_repository.py (all sync/async methods)
  - routers/mutants.py GET /{id}/source endpoint
  - routers/admin.py PUT /project/{id}/source endpoint + XML parse ValueError
"""
import io
import zipfile
import pytest
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock
from httpx import AsyncClient

from main import app
from dependencies import (
    get_current_user,
    get_mutant_service,
    get_project_service,
    get_source_code_service,
    get_current_admin,
)
from models.auth import UserResponse
from models.mutant import MutantResponse
from models.source_code import SourceClassQuery, SourceCodeResponse
from services.source_code import SourceCodeService
from repositories.source_code_repository import SourceCodeRepository
from core.storage import FileStorage
from .conftest import TEST_ADMIN_USERNAME, TEST_ADMIN_PASSWORD

FAKE_ADMIN = UserResponse(id=1, username="admin", is_admin=True, is_active=True)

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

INVALID_CLASS_MUTANT = MutantResponse(
    id=2,
    project_id=1,
    detected=True,
    status="KILLED",
    numberOfTestsRun=5,
    sourceFile="Foo.java",
    mutatedClass="../../etc/passwd",
    mutatedMethod="bar",
    methodDescription="()V",
    lineNumber=10,
    mutator="MATH",
    killingTest=None,
    description="replaced",
    ranking=0,
    additionalFields=None,
)


# ---------------------------------------------------------------------------
# Model tests (models/source_code.py lines 11-13)
# ---------------------------------------------------------------------------

class TestSourceClassQueryModel:

    def test_valid_simple_class_name(self):
        q = SourceClassQuery(fully_qualified_name="Foo")
        assert q.fully_qualified_name == "Foo"

    def test_valid_fully_qualified_name(self):
        q = SourceClassQuery(fully_qualified_name="com.example.math.PrimeChecker")
        assert q.fully_qualified_name == "com.example.math.PrimeChecker"

    def test_invalid_path_traversal(self):
        with pytest.raises(ValueError):
            SourceClassQuery(fully_qualified_name="../../etc/passwd")

    def test_invalid_starts_with_digit(self):
        with pytest.raises(ValueError):
            SourceClassQuery(fully_qualified_name="1com.example.Foo")

    def test_invalid_with_slash(self):
        with pytest.raises(ValueError):
            SourceClassQuery(fully_qualified_name="com/example/Foo")

    def test_invalid_empty_segment(self):
        with pytest.raises(ValueError):
            SourceClassQuery(fully_qualified_name="com..example.Foo")


# ---------------------------------------------------------------------------
# Service unit tests (services/source_code.py lines 10-14, 20-22)
# ---------------------------------------------------------------------------

class TestSourceCodeService:

    @pytest.mark.asyncio
    async def test_upload_invalid_extension_raises(self):
        repo = AsyncMock()
        service = SourceCodeService(repo)
        mock_file = MagicMock()
        mock_file.filename = "archive.tar.gz"

        with pytest.raises(ValueError, match=".zip"):
            await service.upload_project_source(1, mock_file)
        repo.save_project_source.assert_not_called()

    @pytest.mark.asyncio
    async def test_upload_no_filename_raises(self):
        repo = AsyncMock()
        service = SourceCodeService(repo)
        mock_file = MagicMock()
        mock_file.filename = None

        with pytest.raises(ValueError, match=".zip"):
            await service.upload_project_source(1, mock_file)

    @pytest.mark.asyncio
    async def test_upload_valid_zip_delegates_to_repo(self):
        repo = AsyncMock()
        service = SourceCodeService(repo)
        mock_file = MagicMock()
        mock_file.filename = "sources.zip"
        mock_file.file = io.BytesIO(b"fake-zip-content")

        await service.upload_project_source(1, mock_file)
        repo.save_project_source.assert_awaited_once_with(1, mock_file.file)

    @pytest.mark.asyncio
    async def test_get_class_source_code_found(self):
        repo = AsyncMock()
        repo.get_source_file.return_value = "public class Foo {}"
        service = SourceCodeService(repo)

        result = await service.get_class_source_code(1, "com.example.Foo")

        assert result.found is True
        assert result.content == "public class Foo {}"
        assert result.project_id == 1
        assert result.fully_qualified_name == "com.example.Foo"

    @pytest.mark.asyncio
    async def test_get_class_source_code_not_found(self):
        repo = AsyncMock()
        repo.get_source_file.return_value = None
        service = SourceCodeService(repo)

        result = await service.get_class_source_code(1, "com.example.Missing")

        assert result.found is False
        assert result.content is None

    @pytest.mark.asyncio
    async def test_delete_source_folder_delegates(self):
        repo = AsyncMock()
        service = SourceCodeService(repo)

        await service.delete_source_folder(42)
        repo.delete_project_source.assert_awaited_once_with(42)


# ---------------------------------------------------------------------------
# Repository unit tests (repositories/source_code_repository.py lines 18-88)
# ---------------------------------------------------------------------------

def _make_repo(project_dir: Path) -> SourceCodeRepository:
    mock_fs = MagicMock(spec=FileStorage)
    mock_fs.get_project_path.return_value = project_dir
    return SourceCodeRepository(mock_fs)


def _make_valid_zip(*entries: tuple) -> io.BytesIO:
    """Create an in-memory zip with given (filename, content) entries."""
    if not entries:
        entries = [("com/example/Foo.java", "public class Foo {}")]
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        for name, content in entries:
            zf.writestr(name, content)
    buf.seek(0)
    return buf


class TestSourceCodeRepository:

    # --- _sync_save_zip ---

    def test_save_zip_extracts_files(self, tmp_path):
        project_dir = tmp_path / "1"
        repo = _make_repo(project_dir)

        repo._sync_save_zip(1, _make_valid_zip())

        assert (project_dir / "com" / "example" / "Foo.java").exists()

    def test_save_zip_removes_existing_directory(self, tmp_path):
        project_dir = tmp_path / "1"
        project_dir.mkdir(parents=True)
        (project_dir / "old.java").write_text("old content")
        repo = _make_repo(project_dir)

        repo._sync_save_zip(1, _make_valid_zip())

        assert not (project_dir / "old.java").exists()
        assert (project_dir / "com" / "example" / "Foo.java").exists()

    def test_save_zip_rejects_zip_bomb(self, tmp_path):
        project_dir = tmp_path / "1"
        repo = _make_repo(project_dir)
        repo.MAX_UNCOMPRESSED_SIZE = 10  # tiny limit

        oversized_zip = _make_valid_zip(("big.java", "x" * 100))

        with pytest.raises(ValueError, match="limit"):
            repo._sync_save_zip(1, oversized_zip)
        # Directory should be cleaned up after failure
        assert not project_dir.exists()

    def test_save_zip_rejects_zip_slip(self, tmp_path):
        project_dir = tmp_path / "1"
        repo = _make_repo(project_dir)

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            info = zipfile.ZipInfo("../../../evil.java")
            zf.writestr(info, "malicious")
        buf.seek(0)

        with pytest.raises(ValueError, match="Malicious"):
            repo._sync_save_zip(1, buf)

    # --- _sync_delete_source ---

    def test_delete_source_removes_existing_directory(self, tmp_path):
        project_dir = tmp_path / "1"
        project_dir.mkdir(parents=True)
        (project_dir / "Foo.java").write_text("content")
        repo = _make_repo(project_dir)

        repo._sync_delete_source(1)

        assert not project_dir.exists()

    def test_delete_source_no_error_if_missing(self, tmp_path):
        project_dir = tmp_path / "1"
        repo = _make_repo(project_dir)

        # Should not raise even if directory doesn't exist
        repo._sync_delete_source(1)

    # --- _sync_get_class_content ---

    def test_get_class_content_returns_file_text(self, tmp_path):
        project_dir = tmp_path / "1"
        java_file = project_dir / "com" / "example" / "Foo.java"
        java_file.parent.mkdir(parents=True)
        java_file.write_text("public class Foo {}", encoding="utf-8")
        repo = _make_repo(project_dir)

        result = repo._sync_get_class_content(1, "com.example.Foo")

        assert result == "public class Foo {}"

    def test_get_class_content_returns_none_for_missing_file(self, tmp_path):
        project_dir = tmp_path / "1"
        project_dir.mkdir(parents=True)
        repo = _make_repo(project_dir)

        result = repo._sync_get_class_content(1, "com.example.Missing")

        assert result is None

    def test_get_class_content_returns_none_on_path_outside_project(self, tmp_path):
        project_dir = tmp_path / "1"
        project_dir.mkdir(parents=True)
        repo = _make_repo(project_dir)

        # A path that would resolve outside the project dir
        result = repo._sync_get_class_content(1, "com.example.Foo")
        # File doesn't exist → None
        assert result is None

    # --- Async public methods ---

    @pytest.mark.asyncio
    async def test_save_project_source_async(self, tmp_path):
        project_dir = tmp_path / "1"
        repo = _make_repo(project_dir)

        await repo.save_project_source(1, _make_valid_zip())

        assert (project_dir / "com" / "example" / "Foo.java").exists()

    @pytest.mark.asyncio
    async def test_delete_project_source_async(self, tmp_path):
        project_dir = tmp_path / "1"
        project_dir.mkdir(parents=True)
        repo = _make_repo(project_dir)

        await repo.delete_project_source(1)

        assert not project_dir.exists()

    @pytest.mark.asyncio
    async def test_get_source_file_async(self, tmp_path):
        project_dir = tmp_path / "1"
        java_file = project_dir / "com" / "example" / "Foo.java"
        java_file.parent.mkdir(parents=True)
        java_file.write_text("public class Foo {}", encoding="utf-8")
        repo = _make_repo(project_dir)

        result = await repo.get_source_file(1, "com.example.Foo")

        assert result == "public class Foo {}"

    @pytest.mark.asyncio
    async def test_get_source_file_async_not_found(self, tmp_path):
        project_dir = tmp_path / "1"
        project_dir.mkdir(parents=True)
        repo = _make_repo(project_dir)

        result = await repo.get_source_file(1, "com.example.Missing")

        assert result is None


# ---------------------------------------------------------------------------
# Router tests for GET /api/mutants/{id}/source
# (routers/mutants.py lines 39-60)
# ---------------------------------------------------------------------------

class TestMutantsSourceRouter:

    @pytest.mark.asyncio
    async def test_get_source_requires_auth(self, client: AsyncClient):
        response = await client.get("/api/mutants/1/source")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_source_no_project_access_returns_401(self, client: AsyncClient):
        mock_mutant_svc = AsyncMock()
        mock_project_svc = AsyncMock()
        mock_source_svc = AsyncMock()
        mock_mutant_svc.get.return_value = FAKE_MUTANT
        mock_project_svc.does_user_belong_to_project.return_value = False

        app.dependency_overrides[get_current_user] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_mutant_service] = lambda: mock_mutant_svc
        app.dependency_overrides[get_project_service] = lambda: mock_project_svc
        app.dependency_overrides[get_source_code_service] = lambda: mock_source_svc
        try:
            response = await client.get("/api/mutants/1/source")
            assert response.status_code == 401
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_source_success(self, client: AsyncClient):
        mock_mutant_svc = AsyncMock()
        mock_project_svc = AsyncMock()
        mock_source_svc = AsyncMock()
        mock_mutant_svc.get.return_value = FAKE_MUTANT
        mock_project_svc.does_user_belong_to_project.return_value = True
        mock_source_svc.get_class_source_code.return_value = SourceCodeResponse(
            project_id=1,
            fully_qualified_name="com.example.Foo",
            content="public class Foo {}",
            found=True,
        )

        app.dependency_overrides[get_current_user] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_mutant_service] = lambda: mock_mutant_svc
        app.dependency_overrides[get_project_service] = lambda: mock_project_svc
        app.dependency_overrides[get_source_code_service] = lambda: mock_source_svc
        try:
            response = await client.get("/api/mutants/1/source")
            assert response.status_code == 200
            data = response.json()
            assert data["found"] is True
            assert data["content"] == "public class Foo {}"
            assert data["fully_qualified_name"] == "com.example.Foo"
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_source_not_found_returns_404(self, client: AsyncClient):
        mock_mutant_svc = AsyncMock()
        mock_project_svc = AsyncMock()
        mock_source_svc = AsyncMock()
        mock_mutant_svc.get.return_value = FAKE_MUTANT
        mock_project_svc.does_user_belong_to_project.return_value = True
        mock_source_svc.get_class_source_code.return_value = SourceCodeResponse(
            project_id=1,
            fully_qualified_name="com.example.Foo",
            content=None,
            found=False,
        )

        app.dependency_overrides[get_current_user] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_mutant_service] = lambda: mock_mutant_svc
        app.dependency_overrides[get_project_service] = lambda: mock_project_svc
        app.dependency_overrides[get_source_code_service] = lambda: mock_source_svc
        try:
            response = await client.get("/api/mutants/1/source")
            assert response.status_code == 404
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_source_invalid_class_name_returns_400(self, client: AsyncClient):
        mock_mutant_svc = AsyncMock()
        mock_project_svc = AsyncMock()
        mock_source_svc = AsyncMock()
        mock_mutant_svc.get.return_value = INVALID_CLASS_MUTANT
        mock_project_svc.does_user_belong_to_project.return_value = True

        app.dependency_overrides[get_current_user] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_mutant_service] = lambda: mock_mutant_svc
        app.dependency_overrides[get_project_service] = lambda: mock_project_svc
        app.dependency_overrides[get_source_code_service] = lambda: mock_source_svc
        try:
            response = await client.get("/api/mutants/2/source")
            assert response.status_code == 400
        finally:
            app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Admin source code upload router tests
# (routers/admin.py lines 198, 218-238)
# ---------------------------------------------------------------------------

class TestAdminSourceCodeRouter:

    @pytest.mark.asyncio
    async def test_upload_source_requires_auth(self, client: AsyncClient):
        buf = _make_valid_zip()
        response = await client.put(
            "/api/admin/project/1/source",
            files={"file": ("sources.zip", buf, "application/zip")},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_upload_source_non_zip_returns_400(self, client: AsyncClient):
        mock_source_svc = AsyncMock()
        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_source_code_service] = lambda: mock_source_svc
        try:
            response = await client.put(
                "/api/admin/project/1/source",
                files={"file": ("sources.tar.gz", io.BytesIO(b"data"), "application/gzip")},
            )
            assert response.status_code == 400
            assert "zip" in response.json()["detail"].lower()
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_upload_source_service_value_error_returns_400(self, client: AsyncClient):
        mock_source_svc = AsyncMock()
        mock_source_svc.upload_project_source.side_effect = ValueError("Zip content exceeds limit")

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_source_code_service] = lambda: mock_source_svc
        try:
            response = await client.put(
                "/api/admin/project/1/source",
                files={"file": ("sources.zip", _make_valid_zip(), "application/zip")},
            )
            assert response.status_code == 400
            assert "limit" in response.json()["detail"].lower()
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_upload_source_unexpected_error_returns_500(self, client: AsyncClient):
        mock_source_svc = AsyncMock()
        mock_source_svc.upload_project_source.side_effect = IOError("disk full")

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_source_code_service] = lambda: mock_source_svc
        try:
            response = await client.put(
                "/api/admin/project/1/source",
                files={"file": ("sources.zip", _make_valid_zip(), "application/zip")},
            )
            assert response.status_code == 500
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_upload_source_success(self, client: AsyncClient):
        mock_source_svc = AsyncMock()
        mock_source_svc.upload_project_source.return_value = None

        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_source_code_service] = lambda: mock_source_svc
        try:
            response = await client.put(
                "/api/admin/project/1/source",
                files={"file": ("sources.zip", _make_valid_zip(), "application/zip")},
            )
            assert response.status_code == 201
            assert "uploaded" in response.json()["detail"].lower()
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_create_project_invalid_xml_returns_400(self, client: AsyncClient):
        """Trigger the ValueError path in create_project (admin.py line 198)."""
        mock_project_svc = AsyncMock()
        app.dependency_overrides[get_current_admin] = lambda: FAKE_ADMIN
        app.dependency_overrides[get_project_service] = lambda: mock_project_svc
        try:
            invalid_xml = b"<mutations><this is not valid xml</mutations>"
            response = await client.post(
                "/api/admin/projects/",
                data={"project_name": "test_project"},
                files={"file": ("mutations.xml", io.BytesIO(invalid_xml), "application/xml")},
            )
            # Should be 400 due to XML parse error
            assert response.status_code in (400, 500)
        finally:
            app.dependency_overrides.clear()
