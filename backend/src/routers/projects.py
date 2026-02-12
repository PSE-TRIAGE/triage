from fastapi import APIRouter, Depends, status

from dependencies import get_current_user, get_project_service
from repositories import http_responses
from services.project import ProjectService
from models.auth import UserResponse
from models.project import ProjectListResponse
from models.mutant import MutantOverviewResponse


router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", status_code=status.HTTP_200_OK, response_model=list[ProjectListResponse])
async def list_projects(
    user: UserResponse = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service)
):
    """
    Get all projects assigned to the authenticated user.
    Returns project information including progress metrics.
    """
    projects = await project_service.get_user_projects(user.id)
    return projects



@router.get("/{project_id}/mutants", status_code=status.HTTP_200_OK, response_model=list[MutantOverviewResponse])
async def list_mutants(
    project_id: int,
    user: UserResponse = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service)
):
    if not await project_service.does_user_belong_to_project(user.id, project_id):
        raise http_responses.NO_ACCESS_TO_PROJECT
    mutants = await project_service.get_mutant_list(user.id, project_id)
    return mutants

