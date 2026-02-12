from pydantic import BaseModel, Field
from typing import Optional, Literal


class MutantResponse(BaseModel):
    id: int
    project_id: int
    detected: bool
    status: Literal['KILLED', 'SURVIVED', 'NO_COVERAGE', 'NON_VIABLE', 'TIMED_OUT', 'MEMORY_ERROR', 'RUN_ERROR']
    numberOfTestsRun: int
    sourceFile: str
    mutatedClass: str
    mutatedMethod: str
    methodDescription: str
    lineNumber: int
    mutator: str
    killingTest: Optional[str]
    description: str
    ranking: int
    additionalFields: dict | None

    class Config:
        from_attributes = True


class MutantOverviewResponse(BaseModel):
    id: int
    detected: bool
    status: Literal['KILLED', 'SURVIVED', 'NO_COVERAGE', 'NON_VIABLE', 'TIMED_OUT', 'MEMORY_ERROR', 'RUN_ERROR']
    sourceFile: str
    lineNumber: int
    mutator: str
    ranking: int
    rated: bool

    class Config:
        from_attributes = True


class RatingRequest(BaseModel):
    mutant_id: int = Field(gt=0)
    rating: int = Field(ge=1, le=5)


class RatingResponse(BaseModel):
    id: int
    mutant_id: int
    user_id: int
    rating: int

    class Config:
        from_attributes = True
