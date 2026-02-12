import secrets
from typing import Optional

from core import security
from models.auth import UserResponse
from repositories.user_repository import UserRepository
from repositories.session_repository import SessionRepository
from repositories.rating_repository import RatingRepository


class AuthService:
    def __init__(
        self,
        user_repository: UserRepository,
        session_repository: SessionRepository,
        rating_repository: RatingRepository,
    ):
        self.user_repo = user_repository
        self.session_repo = session_repository
        self.rating_repo = rating_repository

    async def logout(self, token: str) -> None:
        await self.session_repo.delete_by_token(token)

    async def reset(self, user_id: int, password: str) -> None:
        password_hash = security.hash_password(password)
        await self.user_repo.update_password(user_id, password_hash)

    async def change_username(self, user_id: int, new_username: str) -> None:
        """
        Change a user's username.
        Raises USERNAME_TAKEN if the username is already in use by another user.
        """
        from repositories import http_responses

        existing = await self.user_repo.find_by_username(new_username)
        if existing is not None:
            if existing["id"] == user_id:
                # Same user, no change needed
                return
            raise http_responses.USERNAME_TAKEN

        await self.user_repo.update_username(user_id, new_username)

    async def get_user_from_token(self, token: str) -> Optional[UserResponse]:
        row = await self.session_repo.find_user_by_token(token)
        if row is None:
            return None
        return UserResponse(
            id=row["id"],
            username=row["username"],
            is_admin=row["is_admin"],
            is_active=row["is_active"]
        )

    async def get_user_from_username(self, username: str) -> Optional[UserResponse]:
        row = await self.user_repo.find_by_username(username)
        if row is None:
            return None
        return UserResponse(
            id=row["id"],
            username=row["username"],
            is_admin=row["is_admin"],
            is_active=row["is_active"]
        )
    

    async def get_all_users(self) -> list[UserResponse]:
        rows = await self.user_repo.find_all_users()
        users = []
        for row in rows:
            mutants_reviewed = await self.rating_repo.count_total_by_user(row["id"])
            users.append(UserResponse(
                id=row["id"],
                username=row["username"],
                is_admin=row["is_admin"],
                is_active=row["is_active"],
                mutants_reviewed=mutants_reviewed,
            ))
        return users

    async def delete_user(self, user_id: int) -> None:
        await self.user_repo.delete_by_id(user_id)

    async def set_user_admin_status(self, user_id: int, is_admin: bool) -> None:
        await self.user_repo.update_admin_status(user_id, is_admin)

    async def is_admin(self, token: str) -> bool:
        user = await self.get_user_from_token(token)
        if user is None:
            return False
        return user.is_admin

    async def register(self, username: str, password: str) -> None:
        password_hash = security.hash_password(password)
        await self.user_repo.create(username, password_hash)

    async def authorize(self, username: str, password: str) -> bool:
        row = await self.user_repo.find_by_username_with_password(username)
        if row is None:
            return False
        if not row["is_active"]:
            return False
        return security.verify_password(password, row["password_hash"])

    async def login(self, username: str, password: str) -> tuple[bool, str]:
        is_valid = await self.authorize(username, password)
        if not is_valid:
            return False, ""

        token = secrets.token_urlsafe(32)

        user = await self.get_user_from_username(username)
        if user is None:
            raise ValueError(f"User {username} not found after successful authorization")

        await self.session_repo.create(user.id, token)
        return True, token

    async def disable_user(self, user_id: int) -> None:
        await self.user_repo.update_active_status(user_id, False)
        await self.session_repo.disable_by_user_id(user_id)

    async def enable_user(self, user_id: int) -> None:
        await self.user_repo.update_active_status(user_id, True)

    async def get_user_by_id(self, user_id: int) -> Optional[UserResponse]:
        row = await self.user_repo.find_by_id(user_id)
        if row is None:
            return None
        return UserResponse(
            id=row["id"],
            username=row["username"],
            is_admin=row["is_admin"],
            is_active=row["is_active"]
        )
