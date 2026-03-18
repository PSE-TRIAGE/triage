import {fireEvent, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {useMutantStore} from "@/stores/mutantStore";
import {renderWithProviders} from "@/test-utils";

vi.mock("@/routes/_auth/project/$projectId/review", () => ({
    Route: {
        useRouteContext: () => ({project: {id: 1, name: "Test Project"}}),
    },
}));

const mockUseProjectMutants = vi.fn();
vi.mock("@/hooks/queries/useMutantQueries", () => ({
    useProjectMutants: (...args: any[]) => mockUseProjectMutants(...args),
}));

const mockUseFormFields = vi.fn();
vi.mock("@/hooks/queries/useFormFieldQueries", () => ({
    useFormFields: (...args: any[]) => mockUseFormFields(...args),
}));

vi.mock("@/components/review/MutationListPanel", () => ({
    MutationListPanel: () => <div>MutationListPanel</div>,
}));

vi.mock("@/components/review/DetailPanel", () => ({
    DetailPanel: () => <div>DetailPanel</div>,
}));

vi.mock("@/components/review/ReviewFormPanel", () => ({
    ReviewFormPanel: () => <div>ReviewFormPanel</div>,
}));

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => mockNavigate,
}));

describe("ReviewView", () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        useMutantStore.setState({
            selectedMutant: null,
            mutants: [],
            projectId: undefined,
            isLoading: false,
        });
        mockUseProjectMutants.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
        });
        mockUseFormFields.mockReturnValue({data: [], isLoading: false});
    });

    async function renderReviewView() {
        const {ReviewView} = await import("../ReviewView");
        renderWithProviders(<ReviewView />);
    }

    it("shows loading state when either mutants or form fields are loading", async () => {
        mockUseProjectMutants.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
        });
        mockUseFormFields.mockReturnValue({data: [], isLoading: true});
        await renderReviewView();

        expect(screen.getByText("Loading mutants...")).toBeInTheDocument();
    });

    it("shows error state when mutant query fails", async () => {
        mockUseProjectMutants.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error("fail"),
        });
        await renderReviewView();

        expect(screen.getByText("Failed to load mutants")).toBeInTheDocument();
    });

    it("shows empty state when no mutant is selected", async () => {
        await renderReviewView();

        expect(screen.getByText("No Mutant Selected")).toBeInTheDocument();
        expect(screen.getByText("Navigate Back")).toBeInTheDocument();
    });

    it("navigates back when the empty-state action is clicked", async () => {
        await renderReviewView();
        fireEvent.click(screen.getByRole("button", {name: /Navigate Back/i}));

        expect(mockNavigate).toHaveBeenCalledWith({to: "/"});
    });

    it("auto-selects the first fetched mutant and renders review panels", async () => {
        const mockMutant = {
            id: 1,
            mutator: "Test",
            status: "SURVIVED",
            lineNumber: 1,
            rated: false,
            ranking: 1,
        };
        mockUseProjectMutants.mockReturnValue({
            data: [mockMutant],
            isLoading: false,
            error: null,
        });

        await renderReviewView();

        await waitFor(() => {
            expect(useMutantStore.getState().selectedMutant?.id).toBe(1);
        });
        expect(screen.getByText("MutationListPanel")).toBeInTheDocument();
        expect(screen.getByText("DetailPanel")).toBeInTheDocument();
        expect(screen.getByText("ReviewFormPanel")).toBeInTheDocument();
    });
});
