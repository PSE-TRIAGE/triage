from typing import Optional, List

from core.database import Database


class ProjectRepository:
    def __init__(self, db: Database):
        self.db = db

    async def create(self, name: str) -> int:
        """Creates a new project and returns its id."""
        async with self.db.acquire() as conn:
            project_id = await conn.fetchval(
                "INSERT INTO projects (name) VALUES ($1) RETURNING id",
                name
            )
            return project_id

    async def delete(self, project_id: int):
        async with self.db.acquire() as conn:
            project_id = await conn.fetchval(
                "DELETE FROM projects WHERE id = $1",
                project_id
            )

    async def update_name(self, project_id: int, name: str) -> None:
        async with self.db.acquire() as conn:
            await conn.execute(
                "UPDATE projects SET name = $1 WHERE id = $2",
                name,
                project_id
            )


    async def find_by_user_id(self, user_id: int) -> List[dict]:
        """Find all projects assigned to a user."""
        async with self.db.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT p.id, p.name, p.created_at::text
                FROM projects p
                INNER JOIN project_assignments pa ON p.id = pa.project_id
                WHERE pa.user_id = $1
                ORDER BY p.created_at DESC
                """,
                user_id
            )
            return [dict(row) for row in rows]

    async def add_user(self, project_id: int, user_id: int) -> None:
        """Adds a user to a project."""
        async with self.db.acquire() as conn:
            await conn.execute(
                "INSERT INTO project_assignments (user_id, project_id) VALUES ($1, $2)",
                user_id, project_id
            )
    
    async def remove_user(self, project_id: int, user_id: int) -> None:
        """Remove a user from a project."""
        async with self.db.acquire() as conn:
            await conn.execute(
                "DELETE FROM project_assignments WHERE user_id = $1 AND project_id = $2",
                user_id, project_id
            )

    async def find_users_by_project_id(self, project_id: int) -> List[dict]:
        """Find all users assigned to a project."""
        async with self.db.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT u.id, u.username, u.is_admin, u.is_active
                FROM users u
                INNER JOIN project_assignments pa ON u.id = pa.user_id
                WHERE pa.project_id = $1
                ORDER BY u.username ASC
                """,
                project_id
            )
            return [dict(row) for row in rows]

    async def does_user_belong_to_project(self, user_id, project_id) -> bool:
        async with self.db.acquire() as conn:
            exists = await conn.fetchval(
                """
                SELECT EXISTS (
                    SELECT 1 
                    FROM project_assignments 
                    WHERE user_id = $1 AND project_id = $2
                )
                """,
                user_id, project_id
            )
            return exists

    async def get_mutant_list(self, user_id, project_id):
        """Find all projects assigned to a user."""
        async with self.db.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT m.id, m.detected, m.status, m.sourcefile, m.linenumber, m.mutator, m.ranking,
                    CASE 
                        WHEN r.user_id IS NOT NULL THEN TRUE
                        ELSE FALSE
                    END AS rated
                FROM mutants m
                LEFT JOIN rating r ON r.mutant_id = m.id AND r.user_id = $1
                WHERE m.project_id = $2
                ORDER BY m.ranking DESC
                """,
                user_id, project_id
            )
            return [dict(row) for row in rows]

    async def does_project_exsist(self, project_id):
        async with self.db.acquire() as conn:
            exists = await conn.fetchval(
                """
                SELECT EXISTS (
                    SELECT 1 
                    FROM projects
                    WHERE id = $1
                )
                """,
                project_id
            )
            return exists
    
    async def find_all_projects(self) -> List[dict]:
        """Find all projects in the system."""
        async with self.db.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, name, created_at::text
                FROM projects
                ORDER BY created_at DESC
                """
            )
            return [dict(row) for row in rows]

    async def update_last_algorithm(self, project_id: int, algorithm_name: str) -> None:
        """Update the last applied algorithm for a project."""
        async with self.db.acquire() as conn:
            await conn.execute(
                "UPDATE projects SET last_algorithm = $1 WHERE id = $2",
                algorithm_name, project_id
            )
