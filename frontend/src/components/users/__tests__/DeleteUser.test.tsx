import {describe, expect, it, vi} from "vitest";
import {screen, fireEvent} from "@testing-library/react";
import {DeleteUser} from "../DeleteUser";
import {renderWithProviders} from "@/test-utils";

vi.mock("@/hooks/mutations/useAdminMutations", () => ({
	useAdminDeleteUser: () => ({mutateAsync: vi.fn(), isPending: false}),
	useAdminDisableUser: () => ({mutateAsync: vi.fn(), isPending: false}),
}));

vi.mock("@/hooks/queries/useUserQueries", () => ({
	useMe: () => ({data: {id: "99", username: "currentAdmin"}}),
}));

const mockUser = {id: 1, username: "target_user", isAdmin: false, isActive: true};

describe("DeleteUser", () => {
	it("renders dialog when open", () => {
		renderWithProviders(
			<DeleteUser user={mockUser as any} open={true} onOpenChange={vi.fn()} />,
		);
		expect(screen.getByText("Deactivate this user?")).toBeInTheDocument();
	});

	it("shows user name", () => {
		renderWithProviders(
			<DeleteUser user={mockUser as any} open={true} onOpenChange={vi.fn()} />,
		);
		expect(screen.getByText("target_user")).toBeInTheDocument();
	});

	it("renders delete data checkbox", () => {
		renderWithProviders(
			<DeleteUser user={mockUser as any} open={true} onOpenChange={vi.fn()} />,
		);
		expect(screen.getByText("Also fully delete user data?")).toBeInTheDocument();
	});

	it("renders action buttons", () => {
		renderWithProviders(
			<DeleteUser user={mockUser as any} open={true} onOpenChange={vi.fn()} />,
		);
		expect(screen.getByText("Cancel")).toBeInTheDocument();
		expect(screen.getByText("Yes, deactivate user")).toBeInTheDocument();
	});

	it("does not render when closed", () => {
		renderWithProviders(
			<DeleteUser user={mockUser as any} open={false} onOpenChange={vi.fn()} />,
		);
		expect(screen.queryByText("Deactivate this user?")).not.toBeInTheDocument();
	});

	it("toggles to delete mode when checkbox is checked", () => {
		renderWithProviders(
			<DeleteUser user={mockUser as any} open={true} onOpenChange={vi.fn()} />,
		);
		const checkbox = screen.getByRole("checkbox");
		fireEvent.click(checkbox);
		expect(screen.getByText("Permanently delete user data?")).toBeInTheDocument();
		expect(screen.getByText("Yes, delete user data")).toBeInTheDocument();
	});

	it("shows data retained text", () => {
		renderWithProviders(
			<DeleteUser user={mockUser as any} open={true} onOpenChange={vi.fn()} />,
		);
		expect(screen.getByText(/Their data will be retained/)).toBeInTheDocument();
	});
});
