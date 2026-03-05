import {fireEvent, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {UserUpdateModel} from "../UserUpdateModel";
import {renderWithProviders} from "@/test-utils";

const useCreateProjectMock = vi.fn();
const toastSuccessMock = vi.fn();

vi.mock("@/hooks/mutations/useProjectMutations", () => ({
	useCreateProject: () => useCreateProjectMock(),
}));

vi.mock("sonner", () => ({
	toast: {
		success: (...args: unknown[]) => toastSuccessMock(...args),
	},
}));

describe("UserUpdateModel", () => {
	beforeEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
		useCreateProjectMock.mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
	});

	it("renders when open", () => {
		renderWithProviders(
			<UserUpdateModel open={true} handleClose={vi.fn()} />,
		);
		expect(screen.getByText("Update User:")).toBeInTheDocument();
	});

	it("shows validation error when password is empty", async () => {
		const handleClose = vi.fn();
		renderWithProviders(
			<UserUpdateModel open={true} handleClose={handleClose} />,
		);

		fireEvent.click(screen.getByRole("button", {name: "Create User"}));

		expect(await screen.findByText("Password is required")).toBeInTheDocument();
		expect(toastSuccessMock).not.toHaveBeenCalled();
		expect(handleClose).not.toHaveBeenCalled();
	});

	it("submits and closes modal on success", async () => {
		const handleClose = vi.fn();
		renderWithProviders(
			<UserUpdateModel open={true} handleClose={handleClose} />,
		);

		fireEvent.change(screen.getByPlaceholderText("e.g., Dr. Sarah Cheng"), {
			target: {value: "Dr. Sarah Cheng"},
		});
		fireEvent.change(screen.getByPlaceholderText("New password..."), {
			target: {value: "new-pass-123"},
		});
		fireEvent.click(screen.getByRole("button", {name: "Create User"}));

		await waitFor(() => {
			expect(toastSuccessMock).toHaveBeenCalledWith(
				"User was edited successfully!",
			);
		}, {timeout: 2500});
		await waitFor(() => {
			expect(handleClose).toHaveBeenCalledTimes(1);
		});
	});

	it("disables actions when mutation is pending", () => {
		useCreateProjectMock.mockReturnValue({
			mutate: vi.fn(),
			isPending: true,
		});
		renderWithProviders(
			<UserUpdateModel open={true} handleClose={vi.fn()} />,
		);

		expect(screen.getByRole("button", {name: "Cancel"})).toBeDisabled();
		expect(screen.getByRole("button", {name: "Creating..."})).toBeDisabled();
	});

	it("does not render when closed", () => {
		renderWithProviders(
			<UserUpdateModel open={false} handleClose={vi.fn()} />,
		);
		expect(screen.queryByText("Update User:")).not.toBeInTheDocument();
	});
});
