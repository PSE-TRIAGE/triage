import {screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {renderWithProviders} from "@/test-utils";
import {AlgorithmSettingsTab} from "../AlgorithmSettingsTab";

vi.mock("@tanstack/react-router", () => ({
    useRouteContext: () => ({project: {id: 1, name: "Test Project"}}),
}));

const mockUseAlgorithms = vi.fn();
vi.mock("@/hooks/queries/useAlgorithms", () => ({
    useAlgorithms: (...args: Parameters<typeof mockUseAlgorithms>) =>
        mockUseAlgorithms(...args),
}));

vi.mock("@/hooks/mutations/useApplyAlgorithm", () => ({
    useApplyAlgorithm: () => ({mutateAsync: vi.fn(), isPending: false}),
}));

describe("AlgorithmSettingsTab", () => {
    beforeEach(() => {
        mockUseAlgorithms.mockReturnValue({
            data: [
                {
                    id: "algo1",
                    name: "Random Sort",
                    description: "Randomly sort mutants",
                },
                {
                    id: "algo2",
                    name: "Priority Sort",
                    description: "Sort by priority",
                },
            ],
            isLoading: false,
            error: null,
        });
    });

    it("renders title", () => {
        renderWithProviders(<AlgorithmSettingsTab />);
        expect(screen.getByText("Sorting Algorithm")).toBeInTheDocument();
    });

    it("renders algorithm options", () => {
        renderWithProviders(<AlgorithmSettingsTab />);
        expect(screen.getByText("Random Sort")).toBeInTheDocument();
        expect(screen.getByText("Priority Sort")).toBeInTheDocument();
    });

    it("renders descriptions", () => {
        renderWithProviders(<AlgorithmSettingsTab />);
        expect(screen.getByText("Randomly sort mutants")).toBeInTheDocument();
        expect(screen.getByText("Sort by priority")).toBeInTheDocument();
    });

    it("renders select buttons", () => {
        renderWithProviders(<AlgorithmSettingsTab />);
        const selectButtons = screen.getAllByText("Select");
        expect(selectButtons).toHaveLength(2);
    });

    it("shows loading state", () => {
        mockUseAlgorithms.mockReturnValue({
            data: [],
            isLoading: true,
            error: null,
        });
        renderWithProviders(<AlgorithmSettingsTab />);
        expect(screen.getByText("Loading algorithms...")).toBeInTheDocument();
    });

    it("shows error state", () => {
        mockUseAlgorithms.mockReturnValue({
            data: [],
            isLoading: false,
            error: new Error("fail"),
        });
        renderWithProviders(<AlgorithmSettingsTab />);
        expect(
            screen.getByText("Failed to load algorithms. Please try again."),
        ).toBeInTheDocument();
    });

    it("shows empty state", () => {
        mockUseAlgorithms.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
        });
        renderWithProviders(<AlgorithmSettingsTab />);
        expect(
            screen.getByText("No algorithms available yet."),
        ).toBeInTheDocument();
    });

    it("renders description text", () => {
        renderWithProviders(<AlgorithmSettingsTab />);
        expect(
            screen.getByText(/Choose the mutation sorting algorithm/),
        ).toBeInTheDocument();
    });
});
