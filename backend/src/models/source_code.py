import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator

class SourceClassQuery(BaseModel):
    fully_qualified_name: str = Field(..., description="e.g. com.example.math.PrimeChecker")

    @field_validator('fully_qualified_name')
    def validate_java_name(cls, v):
        # Prevent path traversal (..) and enforce Java package naming conventions
        if not re.match(r'^[a-zA-Z_$][a-zA-Z\d_$]*(\.[a-zA-Z_$][a-zA-Z\d_$]*)*$', v):
            raise ValueError('Invalid Java class name format')
        return v

class SourceCodeResponse(BaseModel):
    project_id: int
    fully_qualified_name: str
    content: Optional[str] = None
    found: bool
