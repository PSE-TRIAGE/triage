from typing import List

from fastapi import APIRouter, Depends

from dependencies import get_form_field_service, get_current_user
from services.form_field import FormFieldService
from models.auth import UserResponse
from models.form_field import (
    FormFieldResponse,
)
from repositories import http_responses

router = APIRouter(prefix="/api/projects/{project_id}/form-fields", tags=["form-fields"])


@router.get("", response_model=List[FormFieldResponse])
async def get_form_fields(
    project_id: int,
    current_user: UserResponse = Depends(get_current_user),
    service: FormFieldService = Depends(get_form_field_service),
):
    has_access = await service.check_project_access(project_id, current_user.id)
    if not has_access:
        raise http_responses.ACCESS_DENIED
    return await service.get_form_fields(project_id)


@router.get("/{field_id}", response_model=FormFieldResponse)
async def get_form_field(
    project_id: int,
    field_id: int,
    current_user: UserResponse = Depends(get_current_user),
    service: FormFieldService = Depends(get_form_field_service),
):
    has_access = await service.check_project_access(project_id, current_user.id)
    if not has_access:
        raise http_responses.ACCESS_DENIED

    field = await service.get_form_field(field_id)
    if not field or field.project_id != project_id:
        raise http_responses.FORM_FIELD_NOT_FOUND
    return field
