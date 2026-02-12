from typing import List, Optional

from core.database import Database


class ExportRepository:
    def __init__(self, db: Database):
        self.db = db

    async def get_project_info(self, project_id: int) -> Optional[dict]:
        async with self.db.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, name FROM projects WHERE id = $1",
                project_id
            )
            return dict(row) if row else None

    async def get_export_stats(self, project_id: int) -> dict:
        async with self.db.acquire() as conn:
            stats = await conn.fetchrow(
                """
                SELECT
                    (SELECT COUNT(*) FROM mutants WHERE project_id = $1) AS total_mutants,
                    (SELECT COUNT(*) FROM rating r
                     INNER JOIN mutants m ON r.mutant_id = m.id
                     WHERE m.project_id = $1) AS total_ratings,
                    (SELECT COUNT(DISTINCT r.user_id) FROM rating r
                     INNER JOIN mutants m ON r.mutant_id = m.id
                     WHERE m.project_id = $1) AS unique_reviewers,
                    (SELECT COUNT(DISTINCT r.mutant_id) FROM rating r
                     INNER JOIN mutants m ON r.mutant_id = m.id
                     WHERE m.project_id = $1) AS mutants_with_ratings
                """,
                project_id
            )
            return dict(stats)

    async def get_all_ratings_with_details(self, project_id: int) -> List[dict]:
        async with self.db.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT
                    m.id AS mutant_id,
                    m.sourcefile AS source_file,
                    m.mutatedclass AS mutated_class,
                    m.mutatedmethod AS mutated_method,
                    m.linenumber AS line_number,
                    m.mutator,
                    m.status,
                    m.description,
                    m.ranking,
                    m.additionalfields AS additional_fields,
                    u.username AS reviewer_username,
                    r.id AS rating_id
                FROM rating r
                INNER JOIN mutants m ON r.mutant_id = m.id
                INNER JOIN users u ON r.user_id = u.id
                WHERE m.project_id = $1
                ORDER BY m.id, u.username
                """,
                project_id
            )
            return [dict(row) for row in rows]

    async def get_form_field_values_for_ratings(self, rating_ids: List[int]) -> List[dict]:
        if not rating_ids:
            return []
        async with self.db.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT
                    fv.rating_id,
                    ff.label AS field_label,
                    ff.type AS field_type,
                    fv.value
                FROM form_field_values fv
                INNER JOIN form_fields ff ON fv.form_field_id = ff.id
                WHERE fv.rating_id = ANY($1)
                ORDER BY ff.position
                """,
                rating_ids
            )
            return [dict(row) for row in rows]
