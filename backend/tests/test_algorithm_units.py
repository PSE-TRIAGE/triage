import pytest
from algorithms.base import MutantData
from algorithms.lexicographical_rank import LexicographicalRank
from algorithms.status_priority_rank import StatusPriorityRank


def make_mutant(id, source_file, line_number, mutator="MATH", status="KILLED"):
    return MutantData(
        id=id,
        source_file=source_file,
        mutated_class="com.example.Foo",
        mutated_method="bar",
        line_number=line_number,
        mutator=mutator,
        status=status,
        detected=True,
        description="test mutant",
    )


class TestLexicographicalRank:

    def test_name_and_description(self):
        algo = LexicographicalRank()
        assert algo.name == "Lexicographical Rank"
        assert len(algo.description) > 0

    def test_empty_list(self):
        algo = LexicographicalRank()
        assert algo.rank([]) == []

    def test_single_mutant(self):
        algo = LexicographicalRank()
        mutants = [make_mutant(1, "Foo.java", 10)]
        assert algo.rank(mutants) == [1]

    def test_sorted_by_source_file(self):
        """Files should be sorted alphabetically."""
        algo = LexicographicalRank()
        mutants = [
            make_mutant(1, "Z.java", 1),
            make_mutant(2, "A.java", 1),
            make_mutant(3, "M.java", 1),
        ]
        result = algo.rank(mutants)
        assert result == [2, 3, 1]  # A, M, Z

    def test_sorted_by_line_number_within_file(self):
        """Same file: lower line number should come first."""
        algo = LexicographicalRank()
        mutants = [
            make_mutant(1, "Foo.java", 100),
            make_mutant(2, "Foo.java", 5),
            make_mutant(3, "Foo.java", 50),
        ]
        result = algo.rank(mutants)
        assert result == [2, 3, 1]  # lines 5, 50, 100

    def test_sorted_by_mutator_within_same_file_and_line(self):
        """Same file + line: mutator name sorted alphabetically."""
        algo = LexicographicalRank()
        mutants = [
            make_mutant(1, "Foo.java", 10, mutator="NEGATE_CONDITIONALS"),
            make_mutant(2, "Foo.java", 10, mutator="MATH"),
            make_mutant(3, "Foo.java", 10, mutator="CONDITIONALS_BOUNDARY"),
        ]
        result = algo.rank(mutants)
        assert result == [3, 2, 1]  # CONDITIONALS_BOUNDARY, MATH, NEGATE_CONDITIONALS

    def test_returns_all_ids(self):
        """Result must contain exactly the same IDs as input."""
        algo = LexicographicalRank()
        mutants = [make_mutant(i, f"File{i}.java", i) for i in range(1, 6)]
        result = algo.rank(mutants)
        assert sorted(result) == [1, 2, 3, 4, 5]


class TestStatusPriorityRank:

    def test_name_and_description(self):
        algo = StatusPriorityRank()
        assert algo.name == "Status Priority Rank"
        assert len(algo.description) > 0

    def test_empty_list(self):
        algo = StatusPriorityRank()
        assert algo.rank([]) == []

    def test_single_mutant(self):
        algo = StatusPriorityRank()
        mutants = [make_mutant(1, "Foo.java", 10, status="SURVIVED")]
        assert algo.rank(mutants) == [1]

    def test_survived_before_no_coverage_before_killed(self):
        """Priority: SURVIVED > NO_COVERAGE > KILLED."""
        algo = StatusPriorityRank()
        mutants = [
            make_mutant(1, "Foo.java", 1, status="KILLED"),
            make_mutant(2, "Foo.java", 2, status="NO_COVERAGE"),
            make_mutant(3, "Foo.java", 3, status="SURVIVED"),
        ]
        result = algo.rank(mutants)
        assert result[0] == 3  # SURVIVED first
        assert result[1] == 2  # NO_COVERAGE second
        assert result[2] == 1  # KILLED last

    def test_all_statuses_ordered(self):
        """All statuses are ranked in priority order."""
        algo = StatusPriorityRank()
        mutants = [
            make_mutant(1, "F.java", 1, status="NON_VIABLE"),
            make_mutant(2, "F.java", 2, status="RUN_ERROR"),
            make_mutant(3, "F.java", 3, status="MEMORY_ERROR"),
            make_mutant(4, "F.java", 4, status="TIMED_OUT"),
            make_mutant(5, "F.java", 5, status="KILLED"),
            make_mutant(6, "F.java", 6, status="NO_COVERAGE"),
            make_mutant(7, "F.java", 7, status="SURVIVED"),
        ]
        result = algo.rank(mutants)
        # SURVIVED(7), NO_COVERAGE(6), KILLED(5), TIMED_OUT(4), MEMORY_ERROR(3), RUN_ERROR(2), NON_VIABLE(1)
        assert result[0] == 7
        assert result[1] == 6
        assert result[2] == 5

    def test_same_status_sorted_by_source_file_then_line(self):
        """Same status: sort by source file then line number."""
        algo = StatusPriorityRank()
        mutants = [
            make_mutant(1, "Z.java", 1, status="SURVIVED"),
            make_mutant(2, "A.java", 5, status="SURVIVED"),
            make_mutant(3, "A.java", 1, status="SURVIVED"),
        ]
        result = algo.rank(mutants)
        assert result == [3, 2, 1]  # A.java:1, A.java:5, Z.java:1

    def test_unknown_status_goes_to_end(self):
        """Unknown status gets priority 99 and goes to the end."""
        algo = StatusPriorityRank()
        mutants = [
            make_mutant(1, "Foo.java", 1, status="UNKNOWN_STATUS"),
            make_mutant(2, "Foo.java", 2, status="SURVIVED"),
        ]
        result = algo.rank(mutants)
        assert result[0] == 2   # SURVIVED first
        assert result[1] == 1   # UNKNOWN_STATUS last

    def test_returns_all_ids(self):
        """Result must contain exactly the same IDs as input."""
        algo = StatusPriorityRank()
        statuses = ["SURVIVED", "KILLED", "NO_COVERAGE", "TIMED_OUT", "NON_VIABLE"]
        mutants = [make_mutant(i, "F.java", i, status=statuses[i - 1]) for i in range(1, 6)]
        result = algo.rank(mutants)
        assert sorted(result) == [1, 2, 3, 4, 5]
