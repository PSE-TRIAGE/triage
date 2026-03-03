import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {Dashboard} from "../Dashboard";
import {renderWithProviders} from "@/test-utils";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
}));

const mockUseProjects = vi.fn();
vi.mock("@/hooks/queries/useProjectQueries", () => ({
	useProjects: (...args: any[]) => mockUseProjects(...args),
}));

vi.mock("@/hooks/queries/useUserQueries", () => ({
	useMe: () => ({data: {username: "admin", isAdmin: true}}),
}));

vi.mock("@/hooks/mutations/useProjectMutations", () => ({
	useCreateProject: () => ({mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false}),
	useUploadSourceCode: () => ({mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false}),
}));

describe("Dashboard", () => {
	beforeEach(() => {
		mockUseProjects.mockReturnValue({
			data: [
				{id: 1, name: "Project Alpha", createdAt: "2024-01-01", reviewedMutants: 10, totalMutants: 20},
				{id: 2, name: "Project Beta", createdAt: "2024-02-01", reviewedMutants: 5, totalMutants: 10},
			],
			isLoading: false,
		});
	});

	it("renders page title", () => {
		renderWithProviders(<Dashboard />);
		expect(screen.getByText("Projects")).toBeInTheDocument();
	});

	it("renders project cards", () => {
		renderWithProviders(<Dashboard />);
		expect(screen.getByText("Project Alpha")).toBeInTheDocument();
		expect(screen.getByText("Project Beta")).toBeInTheDocument();
	});

	it("renders search input", () => {
		renderWithProviders(<Dashboard />);
		expect(screen.getByLabelText("Search projects")).toBeInTheDocument();
	});

	it("renders create button for admin", () => {
		renderWithProviders(<Dashboard />);
		expect(screen.getByText("Create New Project")).toBeInTheDocument();
	});

	it("renders subtitle", () => {
		renderWithProviders(<Dashboard />);
		expect(screen.getByText("Manage and review mutation testing projects")).toBeInTheDocument();
	});

	it("shows loading skeletons", () => {
		mockUseProjects.mockReturnValue({data: [], isLoading: true});
		const {container} = renderWithProviders(<Dashboard />);
		// Skeletons use data-slot="skeleton"
		const skeletons = container.querySelectorAll("[data-slot='skeleton']");
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it("shows empty state when no projects and no search", () => {
		mockUseProjects.mockReturnValue({data: [], isLoading: false});
		renderWithProviders(<Dashboard />);
		expect(screen.getByText("No projects found")).toBeInTheDocument();
	});
});
