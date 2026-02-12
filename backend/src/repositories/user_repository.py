from typing import Optional

from core.database import Database


class UserRepository:
    def __init__(self, db: Database):
        self.db = db

    async def find_by_username(self, username: str) -> Optional[dict]:
        async with self.db.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, username, is_admin, is_active FROM users WHERE username = $1",
                username
            )
            return dict(row) if row else None

    async def find_by_username_with_password(self, username: str) -> Optional[dict]:
        """Returns user with password_hash for authentication."""
        async with self.db.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, username, is_admin, is_active, password_hash FROM users WHERE username = $1",
                username
            )
            return dict(row) if row else None

    async def create(self, username: str, password_hash: str) -> int:
        """Creates a new user and returns the user id."""
        async with self.db.acquire() as conn:
            user_id = await conn.fetchval(
                "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id",
                username, password_hash
            )
            return user_id

    async def update_password(self, user_id: int, password_hash: str) -> None:
        async with self.db.acquire() as conn:
            await conn.execute(
                "UPDATE users SET password_hash = $1 WHERE id = $2",
                password_hash, user_id
            )

    async def update_username(self, user_id: int, new_username: str) -> None:
        async with self.db.acquire() as conn:
            await conn.execute(
                "UPDATE users SET username = $1 WHERE id = $2",
                new_username, user_id
            )
    
    async def find_all_users(self) -> list[dict]:
        async with self.db.acquire() as conn:
            rows = await conn.fetch(
                "SELECT id, username, is_admin, is_active FROM users"
            )
            return [dict(row) for row in rows]

    async def delete_by_id(self, user_id: int) -> None:
        async with self.db.acquire() as conn:
            await conn.execute(
                "DELETE FROM users WHERE id = $1",
                user_id
            )

    async def update_admin_status(self, user_id: int, is_admin: bool) -> None:
        async with self.db.acquire() as conn:
            await conn.execute(
                "UPDATE users SET is_admin = $1 WHERE id = $2",
                is_admin, user_id
            )

    async def update_active_status(self, user_id: int, is_active: bool) -> None:
        async with self.db.acquire() as conn:
            await conn.execute(
                "UPDATE users SET is_active = $1 WHERE id = $2",
                is_active, user_id
            )

    async def find_by_id(self, user_id: int) -> Optional[dict]:
        async with self.db.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, username, is_admin, is_active FROM users WHERE id = $1",
                user_id
            )
            return dict(row) if row else None
