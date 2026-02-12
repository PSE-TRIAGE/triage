from fastapi import Request

from core.database import db
from repositories.user_repository import UserRepository
from repositories.session_repository import SessionRepository
from repositories.project_repository import ProjectRepository
from repositories.mutant_repository import MutantRepository
from repositories.form_field_repository import FormFieldRepository
from repositories.form_field_value_repository import FormFieldValueRepository
from repositories.rating_repository import RatingRepository
from repositories.export_repository import ExportRepository
from services.auth import AuthService
from services.project import ProjectService
from services.mutant import MutantService
from services.form_field import FormFieldService
from services.export import ExportService
from services.algorithm import AlgorithmService
from repositories import http_responses
from models.auth import UserResponse


# Repository factories
def get_user_repository() -> UserRepository:
    return UserRepository(db)


def get_session_repository() -> SessionRepository:
    return SessionRepository(db)


def get_project_repository() -> ProjectRepository:
    return ProjectRepository(db)


def get_mutant_repository() -> MutantRepository:
    return MutantRepository(db)


def get_form_field_repository() -> FormFieldRepository:
    return FormFieldRepository(db)


def get_form_field_value_repository() -> FormFieldValueRepository:
    return FormFieldValueRepository(db)


def get_rating_repository() -> RatingRepository:
    return RatingRepository(db)


def get_export_repository() -> ExportRepository:
    return ExportRepository(db)


# Service factories
def get_auth_service() -> AuthService:
    return AuthService(
        user_repository=get_user_repository(),
        session_repository=get_session_repository(),
        rating_repository=get_rating_repository()
    )


def get_project_service() -> ProjectService:
    return ProjectService(
        project_repository=get_project_repository(),
        mutant_repository=get_mutant_repository(),
        form_field_repository=get_form_field_repository(),
        rating_repository=get_rating_repository()
    )

def get_mutant_service() -> MutantService:
    return MutantService(
        project_repository=get_project_repository(),
        mutant_repository=get_mutant_repository(),
        form_field_repository=get_form_field_repository(),
        rating_repository=get_rating_repository()
    )


def get_form_field_service() -> FormFieldService:
    return FormFieldService(
        form_field_repository=get_form_field_repository(),
        form_field_value_repository=get_form_field_value_repository(),
        rating_repository=get_rating_repository(),
        project_repository=get_project_repository()
    )


def get_export_service() -> ExportService:
    return ExportService(
        export_repository=get_export_repository(),
        project_repository=get_project_repository()
    )


def get_algorithm_service() -> AlgorithmService:
    return AlgorithmService(
        mutant_repository=get_mutant_repository(),
        project_repository=get_project_repository()
    )


# Auth dependencies
async def get_current_user(request: Request) -> UserResponse:
    """Dependency that returns the current authenticated user."""
    auth_service = get_auth_service()
    header = request.headers
    auth_header = header.get("Authorization")
    if not auth_header:
        raise http_responses.NO_SESSION
    try:
        token = auth_header.split()[1]
    except (IndexError, AttributeError):
        raise http_responses.NO_SESSION
    user = await auth_service.get_user_from_token(token)
    if user is None:
        raise http_responses.NO_SESSION
    return user


async def get_current_admin(request: Request) -> UserResponse:
    """Dependency that returns the current authenticated admin user."""
    user = await get_current_user(request)
    if not user.is_admin:
        raise http_responses.NO_ADMIN_SESSION
    return user
