from typing import List

from asyncpg.exceptions import UniqueViolationError

from models.project import ProjectListResponse
from models.mutant import MutantOverviewResponse
from repositories.project_repository import ProjectRepository
from repositories.mutant_repository import MutantRepository
from repositories.form_field_repository import FormFieldRepository
from repositories.rating_repository import RatingRepository


class ProjectNameExistsError(Exception):
    """Raised when attempting to create a project with a duplicate name"""
    pass


class ProjectService:
    def __init__(
        self,
        project_repository: ProjectRepository,
        mutant_repository: MutantRepository,
        form_field_repository: FormFieldRepository,
        rating_repository: RatingRepository
    ):
        self.project_repo = project_repository
        self.mutant_repo = mutant_repository
        self.form_field_repo = form_field_repository
        self.rating_repo = rating_repository

    async def create(self, project_name: str, mutants: List[list]) -> int:
        """Create a new project with mutants.

        Returns the project id.
        Raises ProjectNameExistsError if a project with that name already exists.
        """
        try:
            project_id = await self.project_repo.create(project_name)

            # Add default rating form field
            await self.form_field_repo.create(project_id, "Rating", "rating", True)

            for mutant in mutants:
                mutant[0] = project_id

            await self.mutant_repo.create_many(mutants)
            return project_id
        except UniqueViolationError:
            raise ProjectNameExistsError(f"Project with name '{project_name}' already exists")

    async def delete(self, project_id: int):
        await self.project_repo.delete(project_id)

    async def rename(self, project_id: int, name: str) -> None:
        try:
            await self.project_repo.update_name(project_id, name)
        except UniqueViolationError:
            raise ProjectNameExistsError(f"Project with name '{name}' already exists")

    async def add_form_field(
        self, project_id: int, label: str, field_type: str, is_required: bool
    ) -> int:
        """Add a form field to a project. Returns the field id."""
        return await self.form_field_repo.create(project_id, label, field_type, is_required)

    async def add_user(self, project_id: int, user_id: int) -> None:
        """Assign a user to a project."""
        await self.project_repo.add_user(project_id, user_id)

    async def remove_user(self, project_id: int, user_id: int) -> None:
        """Remove a user from a project."""
        await self.project_repo.remove_user(project_id, user_id)

    async def get_user_projects(self, user_id: int) -> List[ProjectListResponse]:
        """Get all projects assigned to a user with aggregated metrics."""
        projects = await self.project_repo.find_by_user_id(user_id)

        result = []
        for project in projects:
            mutant_count = await self.mutant_repo.count_by_project_id(project['id'])
            reviewed_count = await self.rating_repo.count_reviewed_by_project_and_user(
                project['id'], user_id
            )

            if mutant_count == 0:
                status = 'empty'
            elif mutant_count == reviewed_count:
                status = 'completed'
            else:
                status = 'in_progress'

            result.append(ProjectListResponse(
                id=project['id'],
                name=project['name'],
                created_at=project['created_at'],
                total_mutants=mutant_count,
                reviewed_mutants=reviewed_count,
                current_status=status
            ))

        return result

    async def get_project_users(self, project_id: int) -> List[dict]:
        """Get all users assigned to a project."""
        return await self.project_repo.find_users_by_project_id(project_id)

    async def does_user_belong_to_project(self, user_id, project_id):
        return await self.project_repo.does_user_belong_to_project(user_id, project_id)

    async def does_project_exsist(self, project_id):
        return await self.project_repo.does_project_exsist(project_id)
    
    async def get_mutant_list(self, user_id, project_id):
        
        mutants = await self.project_repo.get_mutant_list(user_id, project_id)
        
        result = []
        for mutant in mutants:
            result.append(MutantOverviewResponse(
                id=mutant['id'],
                detected=mutant['detected'],
                status=mutant['status'],
                sourceFile=mutant['sourcefile'],
                lineNumber=mutant['linenumber'],
                mutator=mutant['mutator'],
                ranking=mutant['ranking'],
                rated=mutant['rated']
            ))
        return result
            


    
    async def get_all_projects(self) -> List[ProjectListResponse]:
        projects = await self.project_repo.find_all_projects()

        result = []
        for project in projects:
            mutant_count = await self.mutant_repo.count_by_project_id(project['id'])

            result.append(ProjectListResponse(
                id=project['id'],
                name=project['name'],
                created_at=project['created_at'],
                total_mutants=mutant_count,
                reviewed_mutants=0,
                current_status='admin_view'
            ))

        return result

