import asyncpg
from .config import config

class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        """Creates the connection pool."""
        if self.pool is None:

            dsn = f"postgresql://{config.DB_USER}:{config.DB_PASSWORD}@{config.DB_HOST}:{config.DB_PORT}/{config.DB_NAME}"

            self.pool = await asyncpg.create_pool(
                dsn=dsn,
                min_size=1,
                max_size=10
            )
            print("Database connected.")

    async def disconnect(self):
        """Closes the connection pool."""
        if self.pool:
            await self.pool.close()
            self.pool = None
            print("Database disconnected.")

    def acquire(self):
        """
        Helper method to get a connection from the pool.
        Usage: async with db.acquire() as conn: ...
        """
        if not self.pool:
            raise Exception("Database is not connected. Call connect() first.")
        return self.pool.acquire()

# Create a singleton instance to be imported by other modules
db = Database()
