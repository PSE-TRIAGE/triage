from typing import Optional, List

from core.database import Database


class FormFieldValueRepository:
    def __init__(self, db: Database):
        self.db = db

    async def create(self, form_field_id: int, rating_id: int, value: str) -> int:
        async with self.db.acquire() as conn:
            value_id = await conn.fetchval(
                """
                INSERT INTO form_field_values (form_field_id, rating_id, value)
                VALUES ($1, $2, $3)
                RETURNING id
                """,
                form_field_id, rating_id, value
            )
            return value_id

    async def create_many(self, rating_id: int, field_values: List[dict]) -> List[int]:
        async with self.db.acquire() as conn:
            async with conn.transaction():
                ids = []
                for fv in field_values:
                    value_id = await conn.fetchval(
                        """
                        INSERT INTO form_field_values (form_field_id, rating_id, value)
                        VALUES ($1, $2, $3)
                        RETURNING id
                        """,
                        fv['form_field_id'], rating_id, fv['value']
                    )
                    ids.append(value_id)
                return ids

    async def find_by_rating_id(self, rating_id: int) -> List[dict]:
        async with self.db.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, form_field_id, rating_id, value
                FROM form_field_values
                WHERE rating_id = $1
                """,
                rating_id
            )
            return [dict(row) for row in rows]

    async def find_by_id(self, value_id: int) -> Optional[dict]:
        async with self.db.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, form_field_id, rating_id, value
                FROM form_field_values
                WHERE id = $1
                """,
                value_id
            )
            return dict(row) if row else None

    async def update(self, value_id: int, value: str) -> Optional[dict]:
        async with self.db.acquire() as conn:
            row = await conn.fetchrow(
                """
                UPDATE form_field_values
                SET value = $2
                WHERE id = $1
                RETURNING id, form_field_id, rating_id, value
                """,
                value_id, value
            )
            return dict(row) if row else None

    async def delete_by_rating_id(self, rating_id: int) -> int:
        async with self.db.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM form_field_values WHERE rating_id = $1",
                rating_id
            )
            count = int(result.split()[-1]) if result else 0
            return count

    async def upsert_many(self, rating_id: int, field_values: List[dict]) -> List[dict]:
        async with self.db.acquire() as conn:
            async with conn.transaction():
                await conn.execute(
                    "DELETE FROM form_field_values WHERE rating_id = $1",
                    rating_id
                )
                results = []
                for fv in field_values:
                    row = await conn.fetchrow(
                        """
                        INSERT INTO form_field_values (form_field_id, rating_id, value)
                        VALUES ($1, $2, $3)
                        RETURNING id, form_field_id, rating_id, value
                        """,
                        fv['form_field_id'], rating_id, fv['value']
                    )
                    results.append(dict(row))
                return results
