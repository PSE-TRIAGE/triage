from fastapi import APIRouter, Depends, status

from repositories import http_responses
from dependencies import get_auth_service
from services.auth import AuthService
from models.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/login", tags=["auth"])


@router.post("", status_code=status.HTTP_200_OK, response_model=TokenResponse)
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    success, token = await auth_service.login(request.username, request.password)
    if not success:
        raise http_responses.INVALID_LOGIN
    return TokenResponse(token=token)
