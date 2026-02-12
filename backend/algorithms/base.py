from abc import ABC, abstractmethod
from typing import List, Dict, Any
from dataclasses import dataclass


@dataclass
class MutantData:
    """Data structure representing a mutant for ranking algorithms."""
    id: int
    source_file: str
    mutated_class: str
    mutated_method: str
    line_number: int
    mutator: str
    status: str
    detected: bool
    description: str


class RankingStrategy(ABC):
    """
    Abstract base class for mutant ranking strategies.

    All custom ranking algorithms must inherit from this class
    and implement the `rank` method.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable name of the algorithm."""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Brief description of how the algorithm ranks mutants."""
        pass

    @abstractmethod
    def rank(self, mutants: List[MutantData]) -> List[int]:
        """
        Calculate ranking for the given mutants.

        Args:
            mutants: List of MutantData objects to rank

        Returns:
            List of mutant IDs in ranked order (highest priority first).
            The returned list must contain exactly the same IDs as the input,
            with no duplicates and no missing entries.
        """
        pass
