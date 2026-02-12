from typing import List, Optional

from repositories.form_field_repository import FormFieldRepository
from repositories.form_field_value_repository import FormFieldValueRepository
from repositories.rating_repository import RatingRepository
from repositories.project_repository import ProjectRepository
from models.form_field import (
    FormFieldCreate,
    FormFieldUpdate,
    FormFieldResponse,
    FormFieldValueResponse,
    RatingWithValuesCreate,
    RatingWithValuesResponse,
)


class FormFieldService:
    def __init__(
        self,
        form_field_repository: FormFieldRepository,
        form_field_value_repository: FormFieldValueRepository,
        rating_repository: RatingRepository,
        project_repository: ProjectRepository,
    ):
        self.form_field_repo = form_field_repository
        self.form_field_value_repo = form_field_value_repository
        self.rating_repo = rating_repository
        self.project_repo = project_repository

    async def get_form_fields(self, project_id: int) -> List[FormFieldResponse]:
        fields = await self.form_field_repo.find_by_project_id(project_id)
        return [FormFieldResponse(**f) for f in fields]

    async def get_form_field(self, field_id: int) -> Optional[FormFieldResponse]:
        field = await self.form_field_repo.find_by_id(field_id)
        if not field:
            return None
        return FormFieldResponse(**field)

    async def create_form_field(self, project_id: int, data: FormFieldCreate) -> FormFieldResponse:
        field_id = await self.form_field_repo.create(
            project_id=project_id,
            label=data.label,
            field_type=data.type,
            is_required=data.is_required
        )
        field = await self.form_field_repo.find_by_id(field_id)
        return FormFieldResponse(**field)

    async def update_form_field(self, field_id: int, data: FormFieldUpdate) -> Optional[FormFieldResponse]:
        field = await self.form_field_repo.update(
            field_id=field_id,
            label=data.label,
            field_type=data.type,
            is_required=data.is_required,
            position=data.position
        )
        if not field:
            return None
        return FormFieldResponse(**field)

    async def delete_form_field(self, field_id: int) -> bool:
        return await self.form_field_repo.delete(field_id)

    async def reorder_form_fields(self, project_id: int, field_ids: List[int]) -> List[FormFieldResponse]:
        await self.form_field_repo.reorder_fields(project_id, field_ids)
        return await self.get_form_fields(project_id)

    async def submit_rating(
        self, mutant_id: int, user_id: int, data: RatingWithValuesCreate
    ) -> RatingWithValuesResponse:
        rating_id = await self.rating_repo.upsert(mutant_id, user_id)

        field_values_data = [
            {"form_field_id": fv.form_field_id, "value": fv.value}
            for fv in data.field_values
        ]
        field_values = await self.form_field_value_repo.upsert_many(rating_id, field_values_data)

        return RatingWithValuesResponse(
            id=rating_id,
            mutant_id=mutant_id,
            user_id=user_id,
            field_values=[FormFieldValueResponse(**fv) for fv in field_values]
        )

    async def get_rating(self, mutant_id: int, user_id: int) -> Optional[RatingWithValuesResponse]:
        rating = await self.rating_repo.find_by_mutant_and_user(mutant_id, user_id)
        if not rating:
            return None

        field_values = await self.form_field_value_repo.find_by_rating_id(rating['id'])

        return RatingWithValuesResponse(
            id=rating['id'],
            mutant_id=rating['mutant_id'],
            user_id=rating['user_id'],
            field_values=[FormFieldValueResponse(**fv) for fv in field_values]
        )

    async def check_project_access(self, project_id: int, user_id: int) -> bool:
        projects = await self.project_repo.find_by_user_id(user_id)
        return any(p['id'] == project_id for p in projects)

    async def get_all_project_ratings(self, project_id: int) -> List[RatingWithValuesResponse]:
        ratings = await self.rating_repo.find_by_project(project_id)
        result = []
        for rating in ratings:
            field_values = await self.form_field_value_repo.find_by_rating_id(rating['id'])
            result.append(RatingWithValuesResponse(
                id=rating['id'],
                mutant_id=rating['mutant_id'],
                user_id=rating['user_id'],
                field_values=[FormFieldValueResponse(**fv) for fv in field_values]
            ))
        return result
