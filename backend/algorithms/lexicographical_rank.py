from typing import List
from algorithms.base import RankingStrategy, MutantData


class LexicographicalRank(RankingStrategy):
    """
    Default ranking strategy that sorts mutants in natural reading order.

    Mutants are sorted hierarchically by:
    1. Source file path (alphabetically)
    2. Line number (ascending)
    3. Mutator type (alphabetically)
    """

    @property
    def name(self) -> str:
        return "Lexicographical Rank"

    @property
    def description(self) -> str:
        return "Sorts mutants by file path, then line number, then mutator type"

    def rank(self, mutants: List[MutantData]) -> List[int]:
        sorted_mutants = sorted(
            mutants,
            key=lambda m: (m.source_file, m.line_number, m.mutator)
        )
        return [m.id for m in sorted_mutants]
