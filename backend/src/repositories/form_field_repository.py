from typing import Optional, List

from core.database import Database


class FormFieldRepository:
    def __init__(self, db: Database):
        self.db = db

    async def create(self, project_id: int, label: str, field_type: str, is_required: bool) -> int:
        async with self.db.acquire() as conn:
            field_id = await conn.fetchval(
                """
                INSERT INTO form_fields (project_id, label, type, is_required, position)
                VALUES ($1, $2, $3, $4, COALESCE((
                    SELECT MAX(position) + 1
                    FROM form_fields
                    WHERE project_id = $1
                ), 0))
                RETURNING id
                """,
                project_id, label, field_type, is_required
            )
            return field_id

    async def find_by_project_id(self, project_id: int) -> List[dict]:
        async with self.db.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, project_id, label, type, is_required, position
                FROM form_fields
                WHERE project_id = $1
                ORDER BY position ASC
                """,
                project_id
            )
            return [dict(row) for row in rows]

    async def find_by_id(self, field_id: int) -> Optional[dict]:
        async with self.db.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, project_id, label, type, is_required, position
                FROM form_fields
                WHERE id = $1
                """,
                field_id
            )
            return dict(row) if row else None

    async def update(self, field_id: int, label: Optional[str] = None,
                     field_type: Optional[str] = None, is_required: Optional[bool] = None,
                     position: Optional[int] = None) -> Optional[dict]:
        async with self.db.acquire() as conn:
            current = await conn.fetchrow(
                "SELECT id, project_id, label, type, is_required, position FROM form_fields WHERE id = $1",
                field_id
            )
            if not current:
                return None

            new_label = label if label is not None else current['label']
            new_type = field_type if field_type is not None else current['type']
            new_required = is_required if is_required is not None else current['is_required']
            new_position = position if position is not None else current['position']

            row = await conn.fetchrow(
                """
                UPDATE form_fields
                SET label = $2, type = $3, is_required = $4, position = $5
                WHERE id = $1
                RETURNING id, project_id, label, type, is_required, position
                """,
                field_id, new_label, new_type, new_required, new_position
            )
            return dict(row) if row else None

    async def delete(self, field_id: int) -> bool:
        async with self.db.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM form_fields WHERE id = $1",
                field_id
            )
            return result == "DELETE 1"

    async def reorder_fields(self, project_id: int, field_ids: List[int]) -> bool:
        async with self.db.acquire() as conn:
            async with conn.transaction():
                # First set all positions to negative values to avoid unique constraint violation
                for idx, field_id in enumerate(field_ids):
                    await conn.execute(
                        """
                        UPDATE form_fields
                        SET position = $1
                        WHERE id = $2 AND project_id = $3
                        """,
                        -(idx + 1000), field_id, project_id
                    )
                # Then set to the actual positions
                for position, field_id in enumerate(field_ids):
                    await conn.execute(
                        """
                        UPDATE form_fields
                        SET position = $1
                        WHERE id = $2 AND project_id = $3
                        """,
                        position, field_id, project_id
                    )
            return True
