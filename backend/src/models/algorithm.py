from pydantic import BaseModel, Field
from typing import List


class AlgorithmInfo(BaseModel):
    """Information about an available ranking algorithm."""
    id: str = Field(description="Unique identifier for the algorithm")
    name: str = Field(description="Human-readable name")
    description: str = Field(description="Brief description of the algorithm")


class AlgorithmListResponse(BaseModel):
    """Response containing list of available algorithms."""
    algorithms: List[AlgorithmInfo]


class ApplyAlgorithmRequest(BaseModel):
    """Request to apply a ranking algorithm to a project."""
    algorithm: str = Field(
        min_length=1,
        description="ID of the algorithm to apply"
    )


class ApplyAlgorithmResponse(BaseModel):
    """Response after applying a ranking algorithm."""
    success: bool
    algorithm_name: str
    mutants_ranked: int
    message: str
