import importlib
import importlib.util
import os
import sys
from pathlib import Path
from typing import Dict, List, Type
import math

from repositories.mutant_repository import MutantRepository
from repositories.project_repository import ProjectRepository

# Add parent directory (backend/) to path so we can import algorithms
BACKEND_DIR = Path(__file__).parent.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from algorithms.base import RankingStrategy, MutantData


class AlgorithmError(Exception):
    """Raised when an algorithm fails to execute."""
    pass


class AlgorithmNotFoundError(Exception):
    """Raised when a requested algorithm is not found."""
    pass


class AlgorithmService:
    def __init__(
        self,
        mutant_repository: MutantRepository,
        project_repository: ProjectRepository
    ):
        self.mutant_repository = mutant_repository
        self.project_repository = project_repository
        self._algorithms: Dict[str, Type[RankingStrategy]] = {}
        self._load_algorithms()

    def _load_algorithms(self) -> None:
        """Dynamically load all algorithm classes from the algorithms directory."""
        algorithms_dir = BACKEND_DIR / "algorithms"
        for file_path in algorithms_dir.glob("*.py"):
            if file_path.name.startswith("_") or file_path.name == "base.py":
                continue

            module_name = file_path.stem
            try:
                spec = importlib.util.spec_from_file_location(
                    f"algorithms.{module_name}",
                    file_path
                )
                if spec and spec.loader:
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)

                    for attr_name in dir(module):
                        attr = getattr(module, attr_name)
                        if (isinstance(attr, type) and
                            issubclass(attr, RankingStrategy) and
                            attr is not RankingStrategy):
                            algorithm_id = self._class_to_id(attr_name)
                            self._algorithms[algorithm_id] = attr
            except Exception as e:
                print(f"Warning: Failed to load algorithm from {file_path}: {e}")

    def _class_to_id(self, class_name: str) -> str:
        """Convert class name to algorithm ID (e.g., LexicographicalRank -> lexicographical_rank)."""
        result = []
        for i, char in enumerate(class_name):
            if char.isupper() and i > 0:
                result.append('_')
            result.append(char.lower())
        return ''.join(result)

    def get_available_algorithms(self) -> List[Dict]:
        """Get list of all available algorithms."""
        algorithms = []
        for algorithm_id, algorithm_class in self._algorithms.items():
            instance = algorithm_class()
            algorithms.append({
                "id": algorithm_id,
                "name": instance.name,
                "description": instance.description
            })
        return sorted(algorithms, key=lambda x: x["name"])

    async def apply_algorithm(
        self,
        project_id: int,
        algorithm_id: str
    ) -> Dict:
        """
        Apply a ranking algorithm to all mutants in a project.

        Returns dict with success status, algorithm name, and count of ranked mutants.
        """
        if algorithm_id not in self._algorithms:
            raise AlgorithmNotFoundError(f"Algorithm '{algorithm_id}' not found")

        algorithm_class = self._algorithms[algorithm_id]
        algorithm = algorithm_class()

        mutants_data = await self.mutant_repository.get_all_for_ranking(project_id)
        if not mutants_data:
            return {
                "success": True,
                "algorithm_name": algorithm.name,
                "mutants_ranked": 0,
                "message": "No mutants found in project"
            }

        mutants = [
            MutantData(
                id=m["id"],
                source_file=m["sourcefile"],
                mutated_class=m["mutatedclass"],
                mutated_method=m["mutatedmethod"],
                line_number=m["linenumber"],
                mutator=m["mutator"],
                status=m["status"],
                detected=m["detected"],
                description=m["description"]
            )
            for m in mutants_data
        ]

        try:
            ranked_ids = algorithm.rank(mutants)
        except Exception as e:
            raise AlgorithmError(f"Algorithm execution failed: {str(e)}")

        ranked_ids = self._validate_and_fix_ranking(ranked_ids, mutants)

        rankings = {mutant_id: rank for rank, mutant_id in enumerate(ranked_ids)}

        await self.mutant_repository.bulk_update_rankings(project_id, rankings)
        await self.project_repository.update_last_algorithm(project_id, algorithm.name)

        return {
            "success": True,
            "algorithm_name": algorithm.name,
            "mutants_ranked": len(rankings),
            "message": f"Successfully applied '{algorithm.name}' to {len(rankings)} mutants"
        }

    def _validate_and_fix_ranking(
        self,
        ranked_ids: List[int],
        original_mutants: List[MutantData]
    ) -> List[int]:
        """
        Validate and fix the ranking output according to the algorithm contract.

        - Removes duplicates (keeps first occurrence)
        - Adds missing mutants at the end
        - Validates all values are valid integers
        """
        original_ids = {m.id for m in original_mutants}
        seen = set()
        valid_ranked = []

        for mutant_id in ranked_ids:
            if not isinstance(mutant_id, int):
                continue
            if math.isnan(mutant_id) if isinstance(mutant_id, float) else False:
                continue
            if mutant_id in seen:
                continue
            if mutant_id not in original_ids:
                continue
            seen.add(mutant_id)
            valid_ranked.append(mutant_id)

        missing_ids = original_ids - seen
        valid_ranked.extend(sorted(missing_ids))

        return valid_ranked
