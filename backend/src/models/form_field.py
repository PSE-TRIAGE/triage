from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Literal, List


FieldType = Literal['rating', 'checkbox', 'text', 'integer']


class FormFieldCreate(BaseModel):
    label: str = Field(min_length=1, max_length=200)
    type: FieldType
    is_required: bool = False


class FormFieldUpdate(BaseModel):
    label: Optional[str] = Field(default=None, min_length=1, max_length=200)
    type: Optional[FieldType] = None
    is_required: Optional[bool] = None
    position: Optional[int] = Field(default=None, ge=0)


class FormFieldResponse(BaseModel):
    id: int
    project_id: int
    label: str
    type: FieldType
    is_required: bool
    position: int

    model_config = ConfigDict(from_attributes=True)


class FormFieldValueCreate(BaseModel):
    form_field_id: int = Field(gt=0)
    value: str


class FormFieldValueResponse(BaseModel):
    id: int
    form_field_id: int
    rating_id: int
    value: str

    model_config = ConfigDict(from_attributes=True)


class RatingWithValuesCreate(BaseModel):
    field_values: List[FormFieldValueCreate]


class RatingWithValuesResponse(BaseModel):
    id: int
    mutant_id: int
    user_id: int
    field_values: List[FormFieldValueResponse]

    model_config = ConfigDict(from_attributes=True)
