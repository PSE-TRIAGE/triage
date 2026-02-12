from fastapi import APIRouter, Depends, status, Request, HTTPException

from repositories import http_responses
from dependencies import get_auth_service, get_current_user
from services.auth import AuthService
from models.auth import UserResponse, UserResetPasswordRequest, ResetUsernameRequest

router = APIRouter(prefix="/api/user", tags=["user"])


@router.get("", status_code=status.HTTP_200_OK, response_model=UserResponse)
async def get_user(user: UserResponse = Depends(get_current_user)):
    return user


@router.delete("", status_code=status.HTTP_403_FORBIDDEN)
async def delete(
    _user: UserResponse = Depends(get_current_user),
):
    raise HTTPException(403, "User deletion is disabled. Please deactivate your account.")


@router.patch("/disable", status_code=status.HTTP_200_OK)
async def disable(
    user: UserResponse = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    if user.is_admin:
        raise HTTPException(403, "Admins cannot disable themselves!")
    await auth_service.disable_user(user.id)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    request: Request,
    auth_service: AuthService = Depends(get_auth_service)
):
    header = request.headers
    token = header["Authorization"].split()[1]
    await auth_service.logout(token)


@router.patch("/password", status_code=status.HTTP_200_OK)
async def resetPassword(
    reset_data: UserResetPasswordRequest,
    user: UserResponse = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    if not await auth_service.authorize(user.username, reset_data.current_password):
        raise http_responses.INVALID_LOGIN
    await auth_service.reset(user.id, reset_data.new_password)


@router.patch("/username", status_code=status.HTTP_200_OK, response_model=UserResponse)
async def resetUsername(
    reset_data: ResetUsernameRequest,
    user: UserResponse = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    await auth_service.change_username(user.id, reset_data.new_username)
    return UserResponse(
        id=user.id,
        username=reset_data.new_username,
        is_admin=user.is_admin
    )
