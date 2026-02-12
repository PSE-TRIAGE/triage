import pytest
import asyncio
import sys
import os
from pathlib import Path
from httpx import AsyncClient, ASGITransport
from dotenv import load_dotenv

load_dotenv()

# Add src to path so we can import from it
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from main import app
from core.database import db


# Test credentials - can be overridden via environment variables
TEST_ADMIN_USERNAME = os.getenv("TEST_ADMIN_USERNAME", "admin")
TEST_ADMIN_PASSWORD = os.getenv("TEST_ADMIN_PASSWORD", "admin")


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def client():
    """Create a test client for the FastAPI app."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture(scope="function", autouse=True)
async def setup_database():
    """Setup and teardown database connection for each test."""
    await db.connect()
    yield
    await db.disconnect()
