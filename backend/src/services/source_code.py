from fastapi import UploadFile
from repositories.source_code_repository import SourceCodeRepository
from models.source_code import SourceCodeResponse

class SourceCodeService:
    def __init__(self, repository: SourceCodeRepository):
        self.repository = repository

    async def upload_project_source(self, project_id: int, file: UploadFile):
        if not file.filename or not file.filename.endswith('.zip'):
            raise ValueError("File must be a .zip file")

        # file.file is the binary file object
        await self.repository.save_project_source(project_id, file.file)

    async def delete_source_folder(self, project_id: int):
        await self.repository.delete_project_source(project_id)

    async def get_class_source_code(self, project_id: int, fully_qualified_name: str) -> SourceCodeResponse:
        content = await self.repository.get_source_file(project_id, fully_qualified_name)
        
        return SourceCodeResponse(
            project_id=project_id,
            fully_qualified_name=fully_qualified_name,
            content=content,
            found=bool(content)
        )
