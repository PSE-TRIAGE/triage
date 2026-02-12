from pydantic import BaseModel, Field, field_validator
from typing import Optional


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=1)


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)

    @field_validator('username')
    def validate_username(cls, v):
        v = v.strip()
        if not v.replace('_', '').isalnum():
            raise ValueError('Username must be alphanumeric (underscores allowed)')
        return v


class ResetPasswordRequest(BaseModel):
    """Admin reset - only needs username and new password"""
    username: str = Field(min_length=3, max_length=50)
    new_password: str = Field(min_length=8)


class UserResetPasswordRequest(BaseModel):
    """User reset - requires old password verification"""
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8)


class ResetUsernameRequest(BaseModel):
    new_username: str = Field(min_length=3, max_length=50)

    @field_validator('new_username')
    def validate_username(cls, v):
        v = v.strip()
        if not v.replace('_', '').isalnum():
            raise ValueError('Username must be alphanumeric (underscores allowed)')
        return v


class UserResponse(BaseModel):
    id: int
    username: str
    is_admin: bool
    is_active: bool = True
    mutants_reviewed: int = 0


class TokenResponse(BaseModel):
    token: str
