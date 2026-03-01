import os
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

@dataclass
class Config:
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.getenv("DB_NAME", "triage_database")
    DB_USER: str = os.getenv("DB_USER", "triage_backend")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "password")
    STORAGE_ROOT: str = os.getenv("STORAGE_ROOT", "./source")

config = Config()
