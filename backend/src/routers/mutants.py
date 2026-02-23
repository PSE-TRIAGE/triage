from fastapi import APIRouter, Depends, status, Query, HTTPException

from dependencies import get_current_user, get_project_service, get_mutant_service, get_source_code_service
from repositories import http_responses
from services.mutant import MutantService
from services.project import ProjectService
from services.source_code import SourceCodeService
from models.auth import UserResponse
from models.source_code import SourceCodeResponse, SourceClassQuery
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

@router.get("/{mutant_id}/source", response_model=SourceCodeResponse, status_code=status.HTTP_200_OK)
async def get_project_class_source(
    project_id: int,
    mutant_id: int,
    user: UserResponse = Depends(get_current_user),
    mutant_service: MutantService = Depends(get_mutant_service),
    project_service: ProjectService = Depends(get_project_service),
    source_service: SourceCodeService = Depends(get_source_code_service)
):
    mutant = await mutant_service.get(mutant_id)
    project_id = mutant.project_id
    if not await project_service.does_user_belong_to_project(user.id, project_id):
        raise http_responses.NO_ACCESS_TO_PROJECT

    fully_qualified_name: str = mutant.mutatedClass

    try:
        SourceClassQuery(fully_qualified_name=fully_qualified_name)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


    result = await source_service.get_class_source_code(project_id, fully_qualified_name)

    if not result.found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Source code for '{fully_qualified_name}' not found in project {project_id}"
        )

    return result
