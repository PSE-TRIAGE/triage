import {fireEvent, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {renderWithProviders} from "@/test-utils";
import {Dashboard} from "../Dashboard";

vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => vi.fn(),
}));

const mockUseProjects = vi.fn();
vi.mock("@/hooks/queries/useProjectQueries", () => ({
    useProjects: (...args: any[]) => mockUseProjects(...args),
}));

const mockUseMe = vi.fn();
vi.mock("@/hooks/queries/useUserQueries", () => ({
    useMe: (...args: any[]) => mockUseMe(...args),
}));

vi.mock("@/hooks/mutations/useProjectMutations", () => ({
    useCreateProject: () => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
    }),
    useUploadSourceCode: () => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
    }),
}));

vi.mock("@/components/dashboard/ProjectCard", () => ({
    ProjectCard: ({project}: {project: {name: string}}) => (
        <div data-testid="project-card">{project.name}</div>
    ),
}));

vi.mock("@/components/dashboard/CreateProjectModal", () => ({
    CreateProjectModal: ({open}: {open: boolean}) =>
        open ? <div>CreateProjectModal</div> : null,
}));

describe("Dashboard", () => {
    beforeEach(() => {
        mockUseProjects.mockReset();
        mockUseMe.mockReset();
        mockUseProjects.mockReturnValue({
            data: [
                {
                    id: 1,
                    name: "Project Alpha",
                    createdAt: "2024-01-01",
                    reviewedMutants: 10,
                    totalMutants: 20,
                },
                {
                    id: 2,
                    name: "Project Beta",
                    createdAt: "2024-02-01",
                    reviewedMutants: 5,
                    totalMutants: 10,
                },
            ],
            isLoading: false,
        });
        mockUseMe.mockReturnValue({data: {username: "admin", isAdmin: true}});
    });

    it("renders projects returned by the query", () => {
        renderWithProviders(<Dashboard />);
        expect(screen.getByText("Project Alpha")).toBeInTheDocument();
        expect(screen.getByText("Project Beta")).toBeInTheDocument();
        expect(screen.getAllByTestId("project-card")).toHaveLength(2);
    });

    it("filters projects by search query", () => {
        renderWithProviders(<Dashboard />);
        fireEvent.change(screen.getByLabelText("Search projects"), {
            target: {value: "beta"},
        });

        expect(screen.getByText("Project Beta")).toBeInTheDocument();
        expect(screen.queryByText("Project Alpha")).not.toBeInTheDocument();
    });

    it("shows no-results state when search has no matches", () => {
        renderWithProviders(<Dashboard />);
        fireEvent.change(screen.getByLabelText("Search projects"), {
            target: {value: "missing"},
        });

        expect(
            screen.getByText(
                'No projects found for "missing". Try a different search term',
            ),
        ).toBeInTheDocument();
    });

    it("shows empty state when no projects are available and no search is active", () => {
        mockUseProjects.mockReturnValue({data: [], isLoading: false});
        renderWithProviders(<Dashboard />);
        expect(screen.getByText("No projects found")).toBeInTheDocument();
    });

    it("shows loading skeletons while projects are loading", () => {
        mockUseProjects.mockReturnValue({data: [], isLoading: true});
        const {container} = renderWithProviders(<Dashboard />);

        const skeletons = container.querySelectorAll("[data-slot='skeleton']");
        expect(skeletons.length).toBeGreaterThan(0);
        expect(screen.queryByText("No projects found")).not.toBeInTheDocument();
    });

    it("hides create button for non-admin users", () => {
        mockUseMe.mockReturnValue({data: {username: "member", isAdmin: false}});
        renderWithProviders(<Dashboard />);
        expect(
            screen.queryByText("Create New Project"),
        ).not.toBeInTheDocument();
    });

    it("opens the create project modal when admin clicks create", () => {
        renderWithProviders(<Dashboard />);
        fireEvent.click(
            screen.getByRole("button", {name: /Create New Project/i}),
        );

        expect(screen.getByText("CreateProjectModal")).toBeInTheDocument();
    });
});
