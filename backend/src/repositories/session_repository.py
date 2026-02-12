from typing import Optional

from core.database import Database


class SessionRepository:
    def __init__(self, db: Database):
        self.db = db

    async def create(self, user_id: int, token: str) -> None:
        """Creates a new session for a user."""
        async with self.db.acquire() as conn:
            await conn.execute(
                "INSERT INTO sessions (user_id, token) VALUES ($1, $2)",
                user_id, token
            )

    async def delete_by_token(self, token: str) -> None:
        """Deletes a session by token (logout)."""
        async with self.db.acquire() as conn:
            await conn.execute(
                "DELETE FROM sessions WHERE token = $1",
                token
            )

    async def find_user_by_token(self, token: str) -> Optional[dict]:
        """Finds user data associated with a valid session token."""
        async with self.db.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT users.id, username, is_admin, is_active
                FROM users
                JOIN sessions ON users.id = sessions.user_id
                WHERE sessions.token = $1
                AND (sessions.expires_at IS NULL OR sessions.expires_at > NOW())
                """,
                token
            )
            return dict(row) if row else None

    async def disable_by_user_id(self, user_id: int) -> None:
        """Deletes all sessions for a user (used when disabling a user)."""
        async with self.db.acquire() as conn:
            await conn.execute(
                "DELETE FROM sessions WHERE user_id = $1",
                user_id
            )
