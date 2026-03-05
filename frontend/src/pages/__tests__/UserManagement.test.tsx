import {describe, expect, it, vi, beforeEach} from "vitest";
import {fireEvent, screen} from "@testing-library/react";
import {UserManagement} from "../UserManagement";
import {renderWithProviders} from "@/test-utils";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
}));

const mockUseAdminUsers = vi.fn();
const mockUseAdminProjects = vi.fn();
const mockUseAdminUserProjects = vi.fn();
vi.mock("@/hooks/queries/useAdminQueries", () => ({
	useAdminUsers: (...args: any[]) => mockUseAdminUsers(...args),
	useAdminProjects: (...args: any[]) => mockUseAdminProjects(...args),
	useAdminUserProjects: (...args: any[]) => mockUseAdminUserProjects(...args),
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

vi.mock("@/components/users/CreateUserModel", () => ({
	CreateUserModal: ({open}: {open: boolean}) => (open ? <div>CreateUserModal Open</div> : null),
}));

const mockUsers = [
	{id: 1, username: "alice", isAdmin: true, isActive: true, mutantsReviewed: 50},
	{id: 2, username: "bob", isAdmin: false, isActive: true, mutantsReviewed: 20},
	{id: 3, username: "charlie", isAdmin: false, isActive: false, mutantsReviewed: 0},
];

describe("UserManagement", () => {
	beforeEach(() => {
		mockUseAdminUsers.mockReset();
		mockUseAdminProjects.mockReset();
		mockUseAdminUserProjects.mockReset();
		mockUseAdminUsers.mockReturnValue({data: mockUsers, isLoading: false, error: null});
		mockUseAdminProjects.mockReturnValue({
			data: [
				{id: 10, name: "Project X"},
				{id: 11, name: "Project Y"},
			],
			isLoading: false,
			error: null,
		});
		mockUseAdminUserProjects.mockImplementation((userId: number) => {
			if (userId === 1) {
				return {
					data: [
						{id: 10, name: "Project X"},
						{id: 11, name: "Project Y"},
					],
					isLoading: false,
					error: null,
				};
			}

			if (userId === 2) {
				return {
					data: [{id: 10, name: "Project X"}],
					isLoading: false,
					error: null,
				};
			}

			return {data: [], isLoading: false, error: null};
		});
	});

	it("renders users returned from query", () => {
		renderWithProviders(<UserManagement />);
		expect(screen.getByText("alice")).toBeInTheDocument();
		expect(screen.getByText("bob")).toBeInTheDocument();
		expect(screen.getByText("charlie")).toBeInTheDocument();
	});

	it("filters displayed users by search input", () => {
		renderWithProviders(<UserManagement />);
		fireEvent.change(screen.getByLabelText("Search users"), {
			target: {value: "char"},
		});

		expect(screen.getByText("charlie")).toBeInTheDocument();
		expect(screen.queryByText("alice")).not.toBeInTheDocument();
		expect(screen.queryByText("bob")).not.toBeInTheDocument();
	});

	it("shows an empty-table message when search has no matches", () => {
		renderWithProviders(<UserManagement />);
		fireEvent.change(screen.getByLabelText("Search users"), {
			target: {value: "nobody"},
		});

		expect(screen.getByText("No users found")).toBeInTheDocument();
	});

	it("opens create user modal when Add User is clicked", () => {
		renderWithProviders(<UserManagement />);
		fireEvent.click(screen.getByRole("button", {name: "Add User"}));

		expect(screen.getByText("CreateUserModal Open")).toBeInTheDocument();
	});

	it("shows role badges based on active/admin status", () => {
		renderWithProviders(<UserManagement />);
		expect(screen.getByText("Admin")).toBeInTheDocument();
		expect(screen.getByText("Member")).toBeInTheDocument();
		expect(screen.getByText("Deactivated")).toBeInTheDocument();
	});

	it("shows project summary badges from per-user project assignments", () => {
		renderWithProviders(<UserManagement />);
		expect(screen.getAllByText("Project X").length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText("Project Y")).toBeInTheDocument();
		expect(screen.getByText("None")).toBeInTheDocument();
	});

	it("shows loading state while user query is pending", () => {
		mockUseAdminUsers.mockReturnValue({data: [], isLoading: true, error: null});
		const {container} = renderWithProviders(<UserManagement />);

		expect(container.querySelector(".animate-spin")).toBeInTheDocument();
	});

	it("shows error state when user query fails", () => {
		mockUseAdminUsers.mockReturnValue({data: [], isLoading: false, error: new Error("fail")});
		renderWithProviders(<UserManagement />);
		expect(screen.getByText("Failed to load users. Please try again.")).toBeInTheDocument();
	});
});
