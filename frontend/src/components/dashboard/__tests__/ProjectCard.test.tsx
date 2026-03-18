import {render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import type {Project} from "@/api/services/projects.service";
import {ProjectCard} from "../ProjectCard";

vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock("@/hooks/queries/useUserQueries", () => ({
    useMe: () => ({data: {username: "admin", isAdmin: true}}),
}));

const mockProject: Project = {
    id: 1,
    name: "Test Project",
    createdAt: "2024-01-15T10:00:00Z",
    reviewedMutants: 50,
    totalMutants: 100,
    currentStatus: undefined,
    formSchema: undefined,
};

const completeProject: Project = {
    ...mockProject,
    reviewedMutants: 100,
    totalMutants: 100,
};

describe("ProjectCard", () => {
    it("renders project name", () => {
        render(<ProjectCard project={mockProject} />);
        expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    it("shows reviewed and total mutant counts", () => {
        render(<ProjectCard project={mockProject} />);
        expect(screen.getByText("50")).toBeInTheDocument();
        expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("shows In Progress badge for incomplete project", () => {
        render(<ProjectCard project={mockProject} />);
        expect(screen.getByText("In Progress")).toBeInTheDocument();
    });

    it("shows Continue Review button for incomplete project", () => {
        render(<ProjectCard project={mockProject} />);
        expect(screen.getByText("Continue Review")).toBeInTheDocument();
    });

    it("shows Complete badge for 100% progress", () => {
        render(<ProjectCard project={completeProject} />);
        expect(screen.getByText("Complete")).toBeInTheDocument();
    });

    it("shows Review Complete button for 100% project", () => {
        render(<ProjectCard project={completeProject} />);
        expect(screen.getByText("Review Complete")).toBeInTheDocument();
    });

    it("shows settings icon for admin users", () => {
        render(<ProjectCard project={mockProject} />);
        expect(
            screen.getByLabelText("Manage project Test Project"),
        ).toBeInTheDocument();
    });

    it("shows progress percentage", () => {
        render(<ProjectCard project={mockProject} />);
        expect(screen.getByText("50.0%")).toBeInTheDocument();
    });
});
