from pydantic import BaseModel, Field
from datetime import datetime


class ProjectCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)


class ProjectRenameRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)


class ProjectResponse(BaseModel):
    id: int
    name: str
    last_algorithm: str
    created_at: datetime


class ProjectListResponse(BaseModel):
    id: int
    name: str
    created_at: str
    total_mutants: int
    reviewed_mutants: int
    current_status: str

    class Config:
        from_attributes = True
