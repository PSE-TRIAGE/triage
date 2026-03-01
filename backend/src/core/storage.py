import os
from pathlib import Path
from .config import config

class FileStorage:
    def __init__(self):
        self.root_path = Path(config.STORAGE_ROOT)

    def setup(self):
        """
        Ensures the root storage directory exists.
        Call this on startup in main.py similar to db.connect()
        """
        self.root_path.mkdir(parents=True, exist_ok=True)
        print(f"File storage initialized at {self.root_path}")

    def get_project_path(self, project_id: int) -> Path:
        return self.root_path / str(project_id)

# Singleton instance
storage = FileStorage()
