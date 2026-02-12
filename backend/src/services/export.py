from typing import List, Optional
from datetime import datetime
from collections import defaultdict

from repositories.export_repository import ExportRepository
from repositories.project_repository import ProjectRepository
from models.export import (
    ExportPreviewStats,
    ExportFormFieldValue,
    ExportRatingEntry,
    ExportPreviewResponse,
    ExportDataResponse
)


class ExportService:
    def __init__(
        self,
        export_repository: ExportRepository,
        project_repository: ProjectRepository
    ):
        self.export_repository = export_repository
        self.project_repository = project_repository

    async def does_user_have_access(self, user_id: int, project_id: int) -> bool:
        return await self.project_repository.does_user_belong_to_project(user_id, project_id)

    async def get_export_preview(self, project_id: int, sample_limit: int = 5) -> Optional[ExportPreviewResponse]:
        project_info = await self.export_repository.get_project_info(project_id)
        if not project_info:
            return None

        stats_data = await self.export_repository.get_export_stats(project_id)
        total_mutants = stats_data["total_mutants"]

        stats = ExportPreviewStats(
            total_mutants=total_mutants,
            total_ratings=stats_data["total_ratings"],
            unique_reviewers=stats_data["unique_reviewers"],
            mutants_with_ratings=stats_data["mutants_with_ratings"],
            completion_percentage=round(
                (stats_data["mutants_with_ratings"] / total_mutants * 100) if total_mutants > 0 else 0,
                2
            )
        )

        all_entries = await self._build_rating_entries(project_id)
        sample_entries = all_entries[:sample_limit]

        return ExportPreviewResponse(
            project_id=project_id,
            project_name=project_info["name"],
            stats=stats,
            sample_entries=sample_entries
        )

    async def get_export_data(self, project_id: int) -> Optional[ExportDataResponse]:
        project_info = await self.export_repository.get_project_info(project_id)
        if not project_info:
            return None

        stats_data = await self.export_repository.get_export_stats(project_id)
        total_mutants = stats_data["total_mutants"]

        stats = ExportPreviewStats(
            total_mutants=total_mutants,
            total_ratings=stats_data["total_ratings"],
            unique_reviewers=stats_data["unique_reviewers"],
            mutants_with_ratings=stats_data["mutants_with_ratings"],
            completion_percentage=round(
                (stats_data["mutants_with_ratings"] / total_mutants * 100) if total_mutants > 0 else 0,
                2
            )
        )

        all_entries = await self._build_rating_entries(project_id)

        return ExportDataResponse(
            project_id=project_id,
            project_name=project_info["name"],
            exported_at=datetime.utcnow(),
            stats=stats,
            ratings=all_entries
        )

    async def _build_rating_entries(self, project_id: int) -> List[ExportRatingEntry]:
        ratings_data = await self.export_repository.get_all_ratings_with_details(project_id)

        if not ratings_data:
            return []

        rating_ids = [r["rating_id"] for r in ratings_data]
        field_values_data = await self.export_repository.get_form_field_values_for_ratings(rating_ids)

        values_by_rating = defaultdict(list)
        for fv in field_values_data:
            values_by_rating[fv["rating_id"]].append(
                ExportFormFieldValue(
                    field_label=fv["field_label"],
                    field_type=fv["field_type"],
                    value=fv["value"]
                )
            )

        entries = []
        for rating in ratings_data:
            entries.append(ExportRatingEntry(
                mutant_id=rating["mutant_id"],
                source_file=rating["source_file"],
                mutated_class=rating["mutated_class"],
                mutated_method=rating["mutated_method"],
                line_number=rating["line_number"],
                mutator=rating["mutator"],
                status=rating["status"],
                description=rating["description"],
                ranking=rating.get("ranking"),
                additional_fields=rating.get("additional_fields"),
                reviewer_username=rating["reviewer_username"],
                field_values=values_by_rating.get(rating["rating_id"], [])
            ))

        return entries
