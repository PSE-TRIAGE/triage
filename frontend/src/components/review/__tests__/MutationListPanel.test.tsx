import {screen} from "@testing-library/react";
import {beforeEach, describe, expect, it} from "vitest";
import {useMutantStore} from "@/stores/mutantStore";
import {renderWithProviders} from "@/test-utils";
import {MutationListPanel} from "../MutationListPanel";

const mockMutants = [
    {
        id: 1,
        mutator: "ConditionalsBoundary",
        status: "SURVIVED",
        lineNumber: 10,
        rated: false,
        ranking: 1,
        detected: false,
        sourceFile: "A.java",
    },
    {
        id: 2,
        mutator: "NegateConditionals",
        status: "KILLED",
        lineNumber: 20,
        rated: true,
        ranking: 2,
        detected: true,
        sourceFile: "B.java",
    },
    {
        id: 3,
        mutator: "VoidMethod",
        status: "NO_COVERAGE",
        lineNumber: 30,
        rated: false,
        ranking: 3,
        detected: false,
        sourceFile: "C.java",
    },
];

describe("MutationListPanel", () => {
    beforeEach(() => {
        useMutantStore.setState({
            mutants: mockMutants as any[],
            selectedMutant: null,
        });
    });

    it("renders title", () => {
        renderWithProviders(<MutationListPanel />);
        expect(screen.getByText("Mutants")).toBeInTheDocument();
    });

    it("renders filter dropdown", () => {
        renderWithProviders(<MutationListPanel />);
        expect(screen.getByLabelText("Filter mutants")).toBeInTheDocument();
    });

    it("renders unreviewed mutants by default", () => {
        renderWithProviders(<MutationListPanel />);
        expect(screen.getByText("Mutant ID: 1")).toBeInTheDocument();
        expect(screen.getByText("Mutant ID: 3")).toBeInTheDocument();
    });

    it("does not show reviewed mutants in unreviewed filter", () => {
        renderWithProviders(<MutationListPanel />);
        expect(screen.queryByText("Mutant ID: 2")).not.toBeInTheDocument();
    });

    it("shows empty state when all mutants are reviewed", () => {
        const allReviewed = mockMutants.map((m) => ({...m, rated: true}));
        useMutantStore.setState({
            mutants: allReviewed as any[],
            selectedMutant: null,
        });
        renderWithProviders(<MutationListPanel />);
        expect(
            screen.getByText(/No unreviewed mutants left/),
        ).toBeInTheDocument();
    });

    it("shows empty state with no mutants", () => {
        useMutantStore.setState({mutants: [], selectedMutant: null});
        renderWithProviders(<MutationListPanel />);
        // Default filter is "unreviewed", with empty list it shows "No unreviewed mutants left"
        expect(
            screen.getByText(/No unreviewed mutants left/),
        ).toBeInTheDocument();
    });

    it("renders mutant line numbers", () => {
        renderWithProviders(<MutationListPanel />);
        expect(screen.getByText("Line number: 10")).toBeInTheDocument();
    });

    it("renders mutator text", () => {
        renderWithProviders(<MutationListPanel />);
        // formatMutatorForLineBreaks adds zero-width space after dots
        expect(
            screen.getAllByText(
                (_, el) =>
                    el?.textContent?.includes("ConditionalsBoundary") ?? false,
            ).length,
        ).toBeGreaterThan(0);
    });
});
