from fastapi import APIRouter, Depends, status

from dependencies import get_current_user, get_project_service, get_mutant_service
from repositories import http_responses
from services.mutant import MutantService
from services.project import ProjectService
from models.auth import UserResponse
from models.mutant import MutantResponse
from repositories.http_responses import NO_ACCESS_TO_PROJECT


router = APIRouter(prefix="/api/mutants", tags=["mutants"])


@router.get("/{mutant_id}", status_code=status.HTTP_200_OK, response_model=MutantResponse)
async def get_mutant(
    mutant_id: int,
    user: UserResponse = Depends(get_current_user),
    mutant_service: MutantService = Depends(get_mutant_service),
    project_service: ProjectService = Depends(get_project_service)
):

    mutant = await mutant_service.get(mutant_id)
    project_id = mutant.project_id
    if not await project_service.does_user_belong_to_project(user.id, project_id):
        raise http_responses.NO_ACCESS_TO_PROJECT
    return mutant


