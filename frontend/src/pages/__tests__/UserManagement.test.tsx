import {describe, expect, it, vi, beforeEach} from "vitest";
import {screen} from "@testing-library/react";
import {UserManagement} from "../UserManagement";
import {renderWithProviders} from "@/test-utils";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
}));

const mockUseAdminUsers = vi.fn();
vi.mock("@/hooks/queries/useAdminQueries", () => ({
	useAdminUsers: (...args: any[]) => mockUseAdminUsers(...args),
	useAdminProjects: () => ({data: [{id: 10, name: "Project X"}], isLoading: false, error: null}),
	useAdminUserProjects: () => ({data: [{id: 10, name: "Project X"}], isLoading: false, error: null}),
}));

vi.mock("@/hooks/queries/useUserQueries", () => ({
	useMe: () => ({data: {id: "99", username: "currentAdmin", isAdmin: true}}),
}));

vi.mock("@/hooks/mutations/useAdminMutations", () => ({
	useAdminCreateUser: () => ({mutateAsync: vi.fn(), isPending: false}),
	useAdminDeleteUser: () => ({mutateAsync: vi.fn(), isPending: false}),
	useAdminDisableUser: () => ({mutateAsync: vi.fn(), isPending: false}),
	useAdminEnableUser: () => ({mutateAsync: vi.fn(), isPending: false}),
	useAdminChangeRole: () => ({mutateAsync: vi.fn(), isPending: false}),
}));

const mockUsers = [
	{id: 1, username: "alice", isAdmin: true, isActive: true, mutantsReviewed: 50},
	{id: 2, username: "bob", isAdmin: false, isActive: true, mutantsReviewed: 20},
	{id: 3, username: "charlie", isAdmin: false, isActive: false, mutantsReviewed: 0},
];

describe("UserManagement", () => {
	beforeEach(() => {
		mockUseAdminUsers.mockReturnValue({data: mockUsers, isLoading: false, error: null});
	});

	it("renders page title", () => {
		renderWithProviders(<UserManagement />);
		expect(screen.getByText("User Management")).toBeInTheDocument();
	});

	it("renders Add User button", () => {
		renderWithProviders(<UserManagement />);
		expect(screen.getByText("Add User")).toBeInTheDocument();
	});

	it("renders search input", () => {
		renderWithProviders(<UserManagement />);
		expect(screen.getByLabelText("Search users")).toBeInTheDocument();
	});

	it("renders user rows", () => {
		renderWithProviders(<UserManagement />);
		expect(screen.getByText("alice")).toBeInTheDocument();
		expect(screen.getByText("bob")).toBeInTheDocument();
		expect(screen.getByText("charlie")).toBeInTheDocument();
	});

	it("shows Admin badge for admin user", () => {
		renderWithProviders(<UserManagement />);
		expect(screen.getByText("Admin")).toBeInTheDocument();
	});

	it("shows Deactivated badge for inactive user", () => {
		renderWithProviders(<UserManagement />);
		expect(screen.getByText("Deactivated")).toBeInTheDocument();
	});

	it("shows Member badge for regular user", () => {
		renderWithProviders(<UserManagement />);
		expect(screen.getByText("Member")).toBeInTheDocument();
	});

	it("renders table headers", () => {
		renderWithProviders(<UserManagement />);
		expect(screen.getByText("User")).toBeInTheDocument();
		expect(screen.getByText("Role")).toBeInTheDocument();
		expect(screen.getByText("Projects")).toBeInTheDocument();
		expect(screen.getByText("Mutants Reviewed")).toBeInTheDocument();
	});

	it("shows loading state", () => {
		mockUseAdminUsers.mockReturnValue({data: [], isLoading: true, error: null});
		const {container} = renderWithProviders(<UserManagement />);
		// Loader2 spinner should be rendered
		expect(container.querySelector(".animate-spin")).toBeInTheDocument();
	});

	it("shows error state", () => {
		mockUseAdminUsers.mockReturnValue({data: [], isLoading: false, error: new Error("fail")});
		renderWithProviders(<UserManagement />);
		expect(screen.getByText("Failed to load users. Please try again.")).toBeInTheDocument();
	});

	it("shows no users found when table is empty", () => {
		mockUseAdminUsers.mockReturnValue({data: [], isLoading: false, error: null});
		renderWithProviders(<UserManagement />);
		expect(screen.getByText("No users found")).toBeInTheDocument();
	});

	it("renders user project badges", () => {
		renderWithProviders(<UserManagement />);
		// useAdminUserProjects returns Project X for all users
		expect(screen.getAllByText("Project X").length).toBeGreaterThan(0);
	});

	it("renders mutants reviewed count", () => {
		renderWithProviders(<UserManagement />);
		expect(screen.getByText("50")).toBeInTheDocument();
		expect(screen.getByText("20")).toBeInTheDocument();
	});

	it("renders subtitle", () => {
		renderWithProviders(<UserManagement />);
		expect(screen.getByText("Manage user accounts, roles, and permissions")).toBeInTheDocument();
	});
});
