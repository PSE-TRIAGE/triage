import shutil
import zipfile
import asyncio
import os
from typing import Optional, BinaryIO
from pathlib import Path

from core.storage import FileStorage

class SourceCodeRepository:
    def __init__(self, fs: FileStorage):
        self.fs = fs
        # Safety limit: 100MB max uncompressed size to prevent zip bombs
        self.MAX_UNCOMPRESSED_SIZE = 100 * 1024 * 1024 

    def _sync_save_zip(self, project_id: int, zip_file_obj: BinaryIO):
        """Blocking helper to safely unzip project files."""
        project_dir = self.fs.get_project_path(project_id)

        # 1. Clean up existing directory if present
        if project_dir.exists():
            shutil.rmtree(project_dir)
        
        # 2. Create directory
        project_dir.mkdir(parents=True, exist_ok=True)

        total_size = 0
        
        try:
            with zipfile.ZipFile(zip_file_obj, 'r') as zip_ref:
                for zip_info in zip_ref.infolist():
                    # Calculate potential size to prevent Zip Bombs
                    total_size += zip_info.file_size
                    if total_size > self.MAX_UNCOMPRESSED_SIZE:
                        raise ValueError(f"Zip content exceeds limit of {self.MAX_UNCOMPRESSED_SIZE} bytes")
                    
                    # Security: Prevent Zip Slip (extracting outside target dir)
                    target_path = project_dir / zip_info.filename
                    if not target_path.resolve().is_relative_to(project_dir.resolve()):
                        raise ValueError(f"Malicious zip path detected: {zip_info.filename}")

                    # Extract
                    zip_ref.extract(zip_info, project_dir)
        except Exception as e:
            # Cleanup on failure
            if project_dir.exists():
                shutil.rmtree(project_dir)
            raise e

    def _sync_delete_source(self, project_id: int):
        """Blocking helper to remove directory."""
        project_dir = self.fs.get_project_path(project_id)
        if project_dir.exists():
            shutil.rmtree(project_dir)

    def _sync_get_class_content(self, project_id: int, fully_qualified_name: str) -> Optional[str]:
        """Blocking helper to read java file."""
        project_dir = self.fs.get_project_path(project_id)
        
        # Convert 'com.example.Test' -> 'com/example/Test.java'
        relative_path = fully_qualified_name.replace(".", os.sep) + ".java"
        target_file = project_dir / relative_path

        # Security check: Ensure file is inside project dir
        try:
            if not target_file.resolve().is_relative_to(project_dir.resolve()):
                return None
        except ValueError:
            return None # Path resolution failed

        if not target_file.exists() or not target_file.is_file():
            return None

        try:
            return target_file.read_text(encoding='utf-8')
        except Exception:
            return None

    # --- Async Public Methods (offload blocking work to threads) ---

    async def save_project_source(self, project_id: int, zip_file_obj: BinaryIO):
        await asyncio.to_thread(self._sync_save_zip, project_id, zip_file_obj)

    async def delete_project_source(self, project_id: int):
        await asyncio.to_thread(self._sync_delete_source, project_id)

    async def get_source_file(self, project_id: int, fully_qualified_name: str) -> Optional[str]:
        return await asyncio.to_thread(self._sync_get_class_content, project_id, fully_qualified_name)
