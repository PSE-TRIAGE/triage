from typing import List
import asyncio
from fastapi import APIRouter, Depends, File, Form, UploadFile, status, HTTPException, Query, Response

from dependencies import get_auth_service, get_current_admin, get_project_service, get_form_field_service, get_source_code_service
from repositories import http_responses
from services.auth import AuthService
from services.project import ProjectService, ProjectNameExistsError
from services.source_code import SourceCodeService
from services.form_field import FormFieldService
from services import xml_parser
from models.project import ProjectRenameRequest
from models.source_code import SourceCodeResponse, SourceClassQuery
from models.auth import UserResponse, RegisterRequest, ResetPasswordRequest
from models.form_field import (
    FormFieldCreate,
    FormFieldUpdate,
    FormFieldResponse,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/users", status_code=status.HTTP_200_OK)
async def register(
    register_data: RegisterRequest,
    user: UserResponse = Depends(get_current_admin),
    auth_service: AuthService = Depends(get_auth_service)
):
    await auth_service.register(register_data.username, register_data.password)


@router.patch("/users/{user_id}/reset", status_code=status.HTTP_200_OK)
async def reset(
    user_id: int,
    reset_data: ResetPasswordRequest,
    user: UserResponse = Depends(get_current_admin),
    auth_service: AuthService = Depends(get_auth_service)
):
    await auth_service.reset(user_id, reset_data.new_password)

@router.delete("/projects/{project_id}", status_code=status.HTTP_200_OK)
async def delete_project(
    project_id: int,
    user: UserResponse = Depends(get_current_admin),
    project_service: ProjectService = Depends(get_project_service)
):
    if not await project_service.does_project_exsist(project_id):
        raise http_responses.INVALID_PROJECT
    await project_service.delete(project_id)

@router.get("/users", status_code=status.HTTP_200_OK)
async def get_all_users(
    user: UserResponse = Depends(get_current_admin),
    auth_service: AuthService = Depends(get_auth_service)
):
    users = await auth_service.get_all_users()
    return users

@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(
    user_id: int,
    user: UserResponse = Depends(get_current_admin),
    auth_service: AuthService = Depends(get_auth_service)
):
    if user_id == user.id:
        raise HTTPException(403, "User cannot delete themselves!")
    await auth_service.delete_user(user_id)

@router.patch("/users/promote/{user_id}", status_code=status.HTTP_200_OK)
async def promote_user(
    user_id: int,
    user: UserResponse = Depends(get_current_admin),
    auth_service: AuthService = Depends(get_auth_service)
):
    await auth_service.set_user_admin_status(user_id, True)


@router.patch("/users/demote/{user_id}", status_code=status.HTTP_200_OK)
async def demote_user(
    user_id: int,
    user: UserResponse = Depends(get_current_admin),
    auth_service: AuthService = Depends(get_auth_service)
):
    if user.id == user_id:
        raise HTTPException(400, "Admin users cannot demote themselves")
    await auth_service.set_user_admin_status(user_id, False)


@router.patch("/users/{user_id}/disable", status_code=status.HTTP_200_OK)
async def disable_user(
    user_id: int,
    user: UserResponse = Depends(get_current_admin),
    auth_service: AuthService = Depends(get_auth_service)
):
    if user.id == user_id:
        raise HTTPException(400, "Admin users cannot disable themselves")
    target_user = await auth_service.get_user_by_id(user_id)
    if target_user is None:
        raise HTTPException(404, "User not found")
    await auth_service.disable_user(user_id)


@router.patch("/users/{user_id}/enable", status_code=status.HTTP_200_OK)
async def enable_user(
    user_id: int,
    user: UserResponse = Depends(get_current_admin),
    auth_service: AuthService = Depends(get_auth_service)
):
    target_user = await auth_service.get_user_by_id(user_id)
    if target_user is None:
        raise HTTPException(404, "User not found")
    await auth_service.enable_user(user_id)


@router.get("/users/{user_id}/projects", status_code=status.HTTP_200_OK)
async def get_user_projects(
    user_id: int,
    user: UserResponse = Depends(get_current_admin),
    auth_service: AuthService = Depends(get_auth_service),
    project_service: ProjectService = Depends(get_project_service)
):
    target_user = await auth_service.get_user_by_id(user_id)
    if target_user is None:
        raise HTTPException(404, "User not found")
    return await project_service.get_user_projects(user_id)

@router.patch("/projects/{project_id}/name", status_code=status.HTTP_200_OK)
async def rename_project(
    project_id: int,
    data: ProjectRenameRequest,
    user: UserResponse = Depends(get_current_admin),
    project_service: ProjectService = Depends(get_project_service)
):
    if not await project_service.does_project_exsist(project_id):
        raise http_responses.INVALID_PROJECT
    try:
        await project_service.rename(project_id, data.name)
    except ProjectNameExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    return {"id": project_id, "name": data.name}

@router.get("/projects/{project_id}/users", status_code=status.HTTP_200_OK)
async def get_project_users(
    project_id: int,
    user: UserResponse = Depends(get_current_admin),
    project_service: ProjectService = Depends(get_project_service)
):
    if not await project_service.does_project_exsist(project_id):
        raise http_responses.INVALID_PROJECT
    return await project_service.get_project_users(project_id)

@router.patch("/projects/{project_id}/users/add/{user_id}", status_code=status.HTTP_201_CREATED)
async def add_user_to_project(
    project_id: int,
    user_id: int,
    user: UserResponse = Depends(get_current_admin),
    project_service: ProjectService = Depends(get_project_service)
):
    await project_service.add_user(project_id, user_id)

@router.patch("/projects/{project_id}/users/remove/{user_id}", status_code=status.HTTP_200_OK)
async def remove_user_from_project(
    project_id: int,
    user_id: int,
    user: UserResponse = Depends(get_current_admin),
    project_service: ProjectService = Depends(get_project_service)
):
    if user.id == user_id:
        raise HTTPException(400, "Admin users cannot remove themselves from a project")
    await project_service.remove_user(project_id, user_id)

@router.get("/projects", status_code=status.HTTP_200_OK)
async def get_all_projects(
    user: UserResponse = Depends(get_current_admin),
    project_service: ProjectService = Depends(get_project_service)
):
    projects = await project_service.get_all_projects()
    return projects

@router.post("/projects/", status_code=status.HTTP_201_CREATED)
async def create_project(
    project_name: str = Form(...),
    file: UploadFile = File(...),
    user: UserResponse = Depends(get_current_admin),
    project_service: ProjectService = Depends(get_project_service)
):
    if not file.filename or not file.filename.endswith('.xml'):
        raise HTTPException(400, "File must be an .xml file")

    content = await file.read()

    loop = asyncio.get_running_loop()
    try:
        # Pass 0 as temp project_id, we fill it later
        parsed_data = await loop.run_in_executor(None, xml_parser.parse_mutations, content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Server error during parsing")

    try:
        project_id = await project_service.create(project_name, parsed_data)
    except ProjectNameExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))

    await project_service.add_user(project_id, user.id)

    return {"id": project_id, "name": project_name}

@router.put("/project/{project_id}/source", status_code=status.HTTP_201_CREATED)
async def upload_project_source_code(
    project_id: int,
    file: UploadFile = File(...),
    user: UserResponse = Depends(get_current_admin),
    source_service: SourceCodeService = Depends(get_source_code_service)
):
    if not file.filename or not file.filename.endswith('.zip'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="File must be a .zip file"
        )

    try:
        # file.file is the standard python file interface needed by the service
        await source_service.upload_project_source(project_id, file)
    except ValueError as e:
        # Catches zip bombs, invalid class names, or malicious paths
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        # Catches IO errors or permission issues
        print(f"Upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to process source code archive"
        )

    return {"detail": "Source code uploaded and extracted successfully"}





@router.post("/projects/{project_id}/form-fields", response_model=FormFieldResponse, status_code=201)
async def create_form_field(
    project_id: int,
    data: FormFieldCreate,
    current_user: UserResponse = Depends(get_current_admin),
    service: FormFieldService = Depends(get_form_field_service),
):
    return await service.create_form_field(project_id, data)

@router.patch("/projects/{project_id}/form-fields/reorder", response_model=List[FormFieldResponse])
async def reorder_form_fields(
    project_id: int,
    field_ids: List[int],
    current_user: UserResponse = Depends(get_current_admin),
    service: FormFieldService = Depends(get_form_field_service),
):
    return await service.reorder_form_fields(project_id, field_ids)

@router.delete("/projects/{project_id}/form-fields/{field_id}", status_code=200)
async def delete_form_field(
    project_id: int,
    field_id: int,
    current_user: UserResponse = Depends(get_current_admin),
    service: FormFieldService = Depends(get_form_field_service),
):
    existing = await service.get_form_field(field_id)
    if not existing or existing.project_id != project_id:
        raise http_responses.FORM_FIELD_NOT_FOUND

    await service.delete_form_field(field_id)
    return {"success": True}

@router.put("/projects/{project_id}/form-fields/{field_id}", response_model=FormFieldResponse)
async def update_form_field(
    project_id: int,
    field_id: int,
    data: FormFieldUpdate,
    current_user: UserResponse = Depends(get_current_admin),
    service: FormFieldService = Depends(get_form_field_service),
):
    existing = await service.get_form_field(field_id)
    if not existing or existing.project_id != project_id:
        raise http_responses.FORM_FIELD_NOT_FOUND

    updated = await service.update_form_field(field_id, data)
    if not updated:
        raise http_responses.FORM_FIELD_NOT_FOUND
    return updated




