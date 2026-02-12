from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ExportPreviewStats(BaseModel):
    total_mutants: int
    total_ratings: int
    unique_reviewers: int
    mutants_with_ratings: int
    completion_percentage: float


class ExportFormFieldValue(BaseModel):
    field_label: str
    field_type: str
    value: str


class ExportRatingEntry(BaseModel):
    mutant_id: int
    source_file: str
    mutated_class: str
    mutated_method: str
    line_number: int
    mutator: str
    status: str
    description: str
    ranking: Optional[float]
    additional_fields: Optional[str]
    reviewer_username: str
    field_values: List[ExportFormFieldValue]


class ExportPreviewResponse(BaseModel):
    project_id: int
    project_name: str
    stats: ExportPreviewStats
    sample_entries: List[ExportRatingEntry]


class ExportDataResponse(BaseModel):
    project_id: int
    project_name: str
    exported_at: datetime
    stats: ExportPreviewStats
    ratings: List[ExportRatingEntry]
