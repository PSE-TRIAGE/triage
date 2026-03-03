import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {ReactivateUser} from "../ReactivateUser";
import {renderWithProviders} from "@/test-utils";

vi.mock("@/hooks/mutations/useAdminMutations", () => ({
	useAdminEnableUser: () => ({mutateAsync: vi.fn(), isPending: false}),
}));

const mockUser = {id: 1, username: "deactivated_user", isAdmin: false, isActive: false};

describe("ReactivateUser", () => {
	it("renders dialog when open", () => {
		renderWithProviders(
			<ReactivateUser user={mockUser as any} open={true} onOpenChange={vi.fn()} />,
		);
		expect(screen.getByText("Reactivate this user?")).toBeInTheDocument();
	});

	it("shows user name in description", () => {
		renderWithProviders(
			<ReactivateUser user={mockUser as any} open={true} onOpenChange={vi.fn()} />,
		);
		expect(screen.getByText("deactivated_user")).toBeInTheDocument();
	});

	it("renders action buttons", () => {
		renderWithProviders(
			<ReactivateUser user={mockUser as any} open={true} onOpenChange={vi.fn()} />,
		);
		expect(screen.getByText("Cancel")).toBeInTheDocument();
		expect(screen.getByText("Yes, reactivate user")).toBeInTheDocument();
	});

	it("does not render when closed", () => {
		renderWithProviders(
			<ReactivateUser user={mockUser as any} open={false} onOpenChange={vi.fn()} />,
		);
		expect(screen.queryByText("Reactivate this user?")).not.toBeInTheDocument();
	});
});
