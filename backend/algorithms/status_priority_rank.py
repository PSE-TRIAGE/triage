from typing import List
from algorithms.base import RankingStrategy, MutantData


class StatusPriorityRank(RankingStrategy):
    """
    Example custom ranking strategy that prioritizes mutants by status.

    Mutants are sorted by:
    1. Status priority (SURVIVED > NO_COVERAGE > KILLED > others)
    2. Line number (ascending)

    This is an example of how researchers can create custom ranking algorithms.
    """

    STATUS_PRIORITY = {
        'SURVIVED': 0,
        'NO_COVERAGE': 1,
        'KILLED': 2,
        'TIMED_OUT': 3,
        'MEMORY_ERROR': 4,
        'RUN_ERROR': 5,
        'NON_VIABLE': 6,
    }

    @property
    def name(self) -> str:
        return "Status Priority Rank"

    @property
    def description(self) -> str:
        return "Prioritizes survived mutants, then no-coverage, then killed"

    def rank(self, mutants: List[MutantData]) -> List[int]:
        sorted_mutants = sorted(
            mutants,
            key=lambda m: (
                self.STATUS_PRIORITY.get(m.status, 99),
                m.source_file,
                m.line_number
            )
        )
        return [m.id for m in sorted_mutants]
