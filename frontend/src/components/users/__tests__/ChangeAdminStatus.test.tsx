import {fireEvent, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {ChangeAdminStatus} from "../ChangeAdminStatus";
import {renderWithProviders} from "@/test-utils";

const useAdminChangeRoleMock = vi.fn();
const mutateAsyncMock = vi.fn();

vi.mock("@/hooks/mutations/useAdminMutations", () => ({
	useAdminChangeRole: () => useAdminChangeRoleMock(),
}));

const regularUser = {id: 1, username: "user1", isAdmin: false, isActive: true};
const adminUser = {id: 2, username: "admin1", isAdmin: true, isActive: true};

describe("ChangeAdminStatus", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mutateAsyncMock.mockResolvedValue(undefined);
		useAdminChangeRoleMock.mockReturnValue({
			mutateAsync: mutateAsyncMock,
			isPending: false,
		});
	});

	it("promotes a regular user when confirmed", async () => {
		renderWithProviders(<ChangeAdminStatus user={regularUser as any} />);

		fireEvent.click(screen.getByRole("button", {name: "Make Admin"}));
		expect(screen.getByText("Grant admin privileges?")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", {name: "Yes, grant access"}));

		await waitFor(() => {
			expect(mutateAsyncMock).toHaveBeenCalledWith({
				userId: 1,
				promote: true,
			});
		});
	});

	it("demotes an admin user when confirmed", async () => {
		renderWithProviders(<ChangeAdminStatus user={adminUser as any} />);

		fireEvent.click(screen.getByRole("button", {name: "Remove Admin"}));
		expect(screen.getByText("Revoke admin privileges?")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", {name: "Yes, remove access"}));

		await waitFor(() => {
			expect(mutateAsyncMock).toHaveBeenCalledWith({
				userId: 2,
				promote: false,
			});
		});
	});

	it("shows loading state when update is pending", () => {
		useAdminChangeRoleMock.mockReturnValueOnce({
			mutateAsync: mutateAsyncMock,
			isPending: true,
		});
		renderWithProviders(<ChangeAdminStatus user={regularUser as any} />);

		fireEvent.click(screen.getByRole("button", {name: "Make Admin"}));
		const confirmButton = screen.getByRole("button", {name: "Updating..."});
		expect(confirmButton).toBeDisabled();
	});
});
