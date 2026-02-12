from fastapi import HTTPException, status


NO_SESSION = HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No valid session"
            )

NO_ADMIN_SESSION = HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No valid admin session"
            )

INVALID_LOGIN = HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )

USERNAME_TAKEN = HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken"
            )

NO_ACCESS_TO_PROJECT = HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="This project does not exist or the user does not have access"
            )

INVALID_PROJECT = HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="This project does not exist"
            )

PROJECT_NOT_FOUND = HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

FORM_FIELD_NOT_FOUND = HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Form field not found"
            )

ACCESS_DENIED = HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this resource"
            )

MUTANT_NOT_FOUND = HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mutant not found"
            )
