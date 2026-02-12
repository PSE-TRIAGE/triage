from typing import Optional, List

from core.database import Database


class RatingRepository:
    def __init__(self, db: Database):
        self.db = db

    async def create(self, mutant_id: int, user_id: int) -> int:
        async with self.db.acquire() as conn:
            rating_id = await conn.fetchval(
                """
                INSERT INTO rating (mutant_id, user_id)
                VALUES ($1, $2)
                RETURNING id
                """,
                mutant_id, user_id
            )
            return rating_id

    async def find_by_id(self, rating_id: int) -> Optional[dict]:
        async with self.db.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, mutant_id, user_id
                FROM rating
                WHERE id = $1
                """,
                rating_id
            )
            return dict(row) if row else None

    async def find_by_mutant_and_user(self, mutant_id: int, user_id: int) -> Optional[dict]:
        async with self.db.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, mutant_id, user_id
                FROM rating
                WHERE mutant_id = $1 AND user_id = $2
                """,
                mutant_id, user_id
            )
            return dict(row) if row else None

    async def upsert(self, mutant_id: int, user_id: int) -> int:
        async with self.db.acquire() as conn:
            rating_id = await conn.fetchval(
                """
                INSERT INTO rating (mutant_id, user_id)
                VALUES ($1, $2)
                ON CONFLICT (mutant_id, user_id) DO UPDATE SET mutant_id = EXCLUDED.mutant_id
                RETURNING id
                """,
                mutant_id, user_id
            )
            return rating_id

    async def delete(self, rating_id: int) -> bool:
        async with self.db.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM rating WHERE id = $1",
                rating_id
            )
            return result == "DELETE 1"

    async def count_reviewed_by_project_and_user(self, project_id: int, user_id: int) -> int:
        async with self.db.acquire() as conn:
            count = await conn.fetchval(
                """
                SELECT COUNT(DISTINCT r.mutant_id)
                FROM rating r
                INNER JOIN mutants m ON r.mutant_id = m.id
                WHERE m.project_id = $1 AND r.user_id = $2
                """,
                project_id, user_id
            )
            return count or 0

    async def count_total_by_user(self, user_id: int) -> int:
        async with self.db.acquire() as conn:
            count = await conn.fetchval(
                """
                SELECT COUNT(DISTINCT mutant_id)
                FROM rating
                WHERE user_id = $1
                """,
                user_id
            )
            return count or 0

    async def find_by_project_and_user(self, project_id: int, user_id: int) -> List[dict]:
        async with self.db.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT r.id, r.mutant_id, r.user_id
                FROM rating r
                INNER JOIN mutants m ON r.mutant_id = m.id
                WHERE m.project_id = $1 AND r.user_id = $2
                """,
                project_id, user_id
            )
            return [dict(row) for row in rows]

    async def find_by_project(self, project_id: int) -> List[dict]:
        async with self.db.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT r.id, r.mutant_id, r.user_id
                FROM rating r
                INNER JOIN mutants m ON r.mutant_id = m.id
                WHERE m.project_id = $1
                ORDER BY r.id
                """,
                project_id
            )
            return [dict(row) for row in rows]
