import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {ProjectMembersTab} from "../ProjectMembersTab";
import {renderWithProviders} from "@/test-utils";

vi.mock("@tanstack/react-router", () => ({
    useRouteContext: () => ({project: {id: 1, name: "Test Project"}}),
}));

vi.mock("@/hooks/queries/useAdminQueries", () => ({
    useAdminUsers: () => ({
        data: [
            {id: 1, username: "alice", isAdmin: true, isActive: true},
            {id: 2, username: "bob", isAdmin: false, isActive: true},
        ],
        isLoading: false,
        error: null,
    }),
}));

vi.mock("@/hooks/queries/useProjectQueries", () => ({
    useProjectUsers: () => ({
        data: [{id: 1, username: "alice"}],
        isLoading: false,
        error: null,
    }),
}));

vi.mock("@/hooks/queries/useUserQueries", () => ({
    useMe: () => ({data: {id: "99", username: "admin"}}),
}));

vi.mock("@/hooks/mutations/useProjectMutations", () => ({
    useAddProjectUser: () => ({mutate: vi.fn(), isPending: false}),
    useRemoveProjectUser: () => ({mutate: vi.fn(), isPending: false}),
}));

describe("ProjectMembersTab", () => {
    it("renders project members title", () => {
        renderWithProviders(<ProjectMembersTab />);
        expect(screen.getByText("Project Members")).toBeInTheDocument();
    });

    it("renders search input", () => {
        renderWithProviders(<ProjectMembersTab />);
        expect(screen.getByLabelText("Search users")).toBeInTheDocument();
    });

    it("renders user rows", () => {
        renderWithProviders(<ProjectMembersTab />);
        expect(screen.getByText("alice")).toBeInTheDocument();
        expect(screen.getByText("bob")).toBeInTheDocument();
    });

    it("shows Assigned badge for assigned user", () => {
        renderWithProviders(<ProjectMembersTab />);
        expect(screen.getByText("Assigned")).toBeInTheDocument();
    });

    it("shows Not Assigned badge for non-assigned user", () => {
        renderWithProviders(<ProjectMembersTab />);
        expect(screen.getByText("Not Assigned")).toBeInTheDocument();
    });

    it("shows assigned count", () => {
        renderWithProviders(<ProjectMembersTab />);
        expect(screen.getByText("1 assigned")).toBeInTheDocument();
    });
});
