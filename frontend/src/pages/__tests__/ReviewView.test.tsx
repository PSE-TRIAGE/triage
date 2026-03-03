import {describe, expect, it, vi, beforeEach} from "vitest";
import {screen} from "@testing-library/react";
import {renderWithProviders} from "@/test-utils";
import {useMutantStore} from "@/stores/mutantStore";

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

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
}));

describe("ReviewView", () => {
	beforeEach(() => {
		useMutantStore.setState({selectedMutant: null, mutants: [], projectId: undefined, isLoading: false});
		mockUseProjectMutants.mockReturnValue({data: undefined, isLoading: false, error: null});
		mockUseFormFields.mockReturnValue({data: [], isLoading: false});
	});

	it("shows empty state when no mutants exist", async () => {
		const {ReviewView} = await import("../ReviewView");
		renderWithProviders(<ReviewView />);
		expect(screen.getByText("No Mutant Selected")).toBeInTheDocument();
	});

	it("shows back button in empty state", async () => {
		const {ReviewView} = await import("../ReviewView");
		renderWithProviders(<ReviewView />);
		expect(screen.getByText("Navigate Back")).toBeInTheDocument();
	});

	it("shows loading state", async () => {
		mockUseProjectMutants.mockReturnValue({data: undefined, isLoading: true, error: null});
		const {ReviewView} = await import("../ReviewView");
		renderWithProviders(<ReviewView />);
		expect(screen.getByText("Loading mutants...")).toBeInTheDocument();
	});

	it("shows error state", async () => {
		mockUseProjectMutants.mockReturnValue({data: undefined, isLoading: false, error: new Error("fail")});
		const {ReviewView} = await import("../ReviewView");
		renderWithProviders(<ReviewView />);
		expect(screen.getByText("Failed to load mutants")).toBeInTheDocument();
	});

	it("renders panels when mutant is selected", async () => {
		const mockMutant = {id: 1, mutator: "Test", status: "SURVIVED", lineNumber: 1, rated: false, ranking: 1};
		mockUseProjectMutants.mockReturnValue({data: [mockMutant], isLoading: false, error: null});
		useMutantStore.setState({selectedMutant: mockMutant as any, mutants: [mockMutant as any]});
		const {ReviewView} = await import("../ReviewView");
		renderWithProviders(<ReviewView />);
		expect(screen.getByText("MutationListPanel")).toBeInTheDocument();
		expect(screen.getByText("DetailPanel")).toBeInTheDocument();
		expect(screen.getByText("ReviewFormPanel")).toBeInTheDocument();
	});
});
