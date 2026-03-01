from models.mutant import MutantResponse
from repositories.project_repository import ProjectRepository
from repositories.mutant_repository import MutantRepository
from repositories.form_field_repository import FormFieldRepository
from repositories.rating_repository import RatingRepository
from repositories.http_responses import MUTANT_NOT_FOUND

class MutantService:
    def __init__(
        self,
        project_repository: ProjectRepository,
        mutant_repository: MutantRepository,
        form_field_repository: FormFieldRepository,
        rating_repository: RatingRepository
    ):
        self.project_repo = project_repository
        self.mutant_repo = mutant_repository
        self.form_field_repo = form_field_repository
        self.rating_repo = rating_repository

    async def get(self, mutant_id):
        mutant = await self.mutant_repo.get_mutant(mutant_id)
        if mutant is None:
            raise MUTANT_NOT_FOUND
        return MutantResponse(
            id=mutant['id'],
            project_id=mutant['project_id'],
            detected=mutant['detected'],
            status=mutant['status'],
            numberOfTestsRun=mutant['numberoftestsrun'],
            sourceFile=mutant['sourcefile'],
            mutatedClass=mutant['mutatedclass'],
            mutatedMethod=mutant['mutatedmethod'],
            methodDescription=mutant['methoddescription'],
            lineNumber=mutant['linenumber'],
            mutator=mutant['mutator'],
            killingTest=mutant['killingtest'],
            description=mutant['description'],
            ranking=mutant['ranking'],
            additionalFields=mutant['additionalfields']
        )


    
