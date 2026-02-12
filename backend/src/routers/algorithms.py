from fastapi import APIRouter, Depends, status, HTTPException

from dependencies import get_current_admin, get_algorithm_service
from services.algorithm import AlgorithmService, AlgorithmNotFoundError, AlgorithmError
from models.auth import UserResponse
from models.algorithm import (
    AlgorithmListResponse,
    AlgorithmInfo,
    ApplyAlgorithmRequest,
    ApplyAlgorithmResponse
)


router = APIRouter(prefix="/api", tags=["algorithms"])


@router.get("/algorithms", response_model=AlgorithmListResponse)
async def list_algorithms(
    user: UserResponse = Depends(get_current_admin),
    algorithm_service: AlgorithmService = Depends(get_algorithm_service)
):
    """List all available sorting algorithms."""
    algorithms = algorithm_service.get_available_algorithms()
    return AlgorithmListResponse(
        algorithms=[AlgorithmInfo(**algo) for algo in algorithms]
    )


@router.post(
    "/projects/{project_id}/algorithm",
    response_model=ApplyAlgorithmResponse,
    status_code=status.HTTP_200_OK
)
async def apply_algorithm(
    project_id: int,
    request: ApplyAlgorithmRequest,
    user: UserResponse = Depends(get_current_admin),
    algorithm_service: AlgorithmService = Depends(get_algorithm_service)
):
    """Apply a sorting algorithm to all mutants in a project."""
    try:
        result = await algorithm_service.apply_algorithm(
            project_id=project_id,
            algorithm_id=request.algorithm
        )
        return ApplyAlgorithmResponse(**result)
    except AlgorithmNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except AlgorithmError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Algorithm execution failed: {str(e)}"
        )
