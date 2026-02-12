from typing import Optional, List

from core.database import Database


class MutantRepository:
    def __init__(self, db: Database):
        self.db = db

    async def create_many(self, mutants: List[list]) -> None:
        """Bulk insert mutants.

        Each mutant is a list with:
        [project_id, detected, status, numberOfTestsRun, sourceFile,
         mutatedClass, mutatedMethod, methodDescription, lineNumber,
         mutator, killingTest, description, additionalFields]
        """
        async with self.db.acquire() as conn:
            await conn.executemany(
                """
                INSERT INTO mutants
                (project_id, detected, status, numberOfTestsRun, sourceFile,
                 mutatedClass, mutatedMethod, methodDescription, lineNumber,
                 mutator, killingTest, description, additionalFields)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                """,
                mutants
            )

    async def count_by_project_id(self, project_id: int) -> int:
        async with self.db.acquire() as conn:
            count = await conn.fetchval(
                "SELECT COUNT(*) FROM mutants WHERE project_id = $1",
                project_id
            )
            return count or 0

    
    async def get_mutant(self, mutant_id: int):
        async with self.db.acquire() as conn:
            mutant = await conn.fetchrow(
                "SELECT * FROM mutants WHERE id = $1",
                mutant_id
            )
            return dict(mutant)

    async def get_all_for_ranking(self, project_id: int) -> List[dict]:
        """Get all mutants for a project with fields needed for ranking."""
        async with self.db.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, sourcefile, mutatedclass, mutatedmethod,
                       linenumber, mutator, status, detected, description, additionalfields
                FROM mutants
                WHERE project_id = $1
                """,
                project_id
            )
            return [dict(row) for row in rows]

    async def bulk_update_rankings(self, project_id: int, rankings: dict) -> None:
        """Bulk update ranking values for mutants in a project."""
        if not rankings:
            return
        async with self.db.acquire() as conn:
            await conn.executemany(
                "UPDATE mutants SET ranking = $1 WHERE id = $2 AND project_id = $3",
                [(rank, mutant_id, project_id) for mutant_id, rank in rankings.items()]
            )

