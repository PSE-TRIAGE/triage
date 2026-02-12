from fastapi import APIRouter, Depends, status

from dependencies import get_current_admin, get_export_service
from repositories import http_responses
from services.export import ExportService
from models.auth import UserResponse
from models.export import ExportPreviewResponse, ExportDataResponse


router = APIRouter(prefix="/api/admin/projects/{project_id}/export", tags=["export"])


@router.get("/preview", status_code=status.HTTP_200_OK, response_model=ExportPreviewResponse)
async def get_export_preview(
    project_id: int,
    user: UserResponse = Depends(get_current_admin),
    export_service: ExportService = Depends(get_export_service)
):
    if not await export_service.does_user_have_access(user.id, project_id):
        raise http_responses.NO_ACCESS_TO_PROJECT

    preview = await export_service.get_export_preview(project_id)
    if not preview:
        raise http_responses.PROJECT_NOT_FOUND

    return preview


@router.get("", status_code=status.HTTP_200_OK, response_model=ExportDataResponse)
async def download_export(
    project_id: int,
    user: UserResponse = Depends(get_current_admin),
    export_service: ExportService = Depends(get_export_service)
):
    if not await export_service.does_user_have_access(user.id, project_id):
        raise http_responses.NO_ACCESS_TO_PROJECT

    export_data = await export_service.get_export_data(project_id)
    if not export_data:
        raise http_responses.PROJECT_NOT_FOUND

    return export_data
