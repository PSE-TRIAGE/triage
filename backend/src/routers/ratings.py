from typing import Optional, List

from fastapi import APIRouter, Depends, Path

from dependencies import get_form_field_service, get_current_user
from services.form_field import FormFieldService
from models.auth import UserResponse
from models.form_field import RatingWithValuesCreate, RatingWithValuesResponse

router = APIRouter(prefix="/api", tags=["ratings"])


@router.post("/mutants/{mutant_id}/ratings", response_model=RatingWithValuesResponse, status_code=201)
async def submit_rating(
    data: RatingWithValuesCreate,
    mutant_id: int = Path(gt=0),
    current_user: UserResponse = Depends(get_current_user),
    service: FormFieldService = Depends(get_form_field_service),
):
    return await service.submit_rating(
        mutant_id=mutant_id,
        user_id=current_user.id,
        data=data
    )


@router.get(
    "/mutants/{mutant_id}/ratings",
    response_model=Optional[RatingWithValuesResponse]
)
async def get_my_rating(
    mutant_id: int,
    current_user: UserResponse = Depends(get_current_user),
    service: FormFieldService = Depends(get_form_field_service),
):
    rating = await service.get_rating(mutant_id, current_user.id)
    return rating
