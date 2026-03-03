import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {CreateUserModal} from "../CreateUserModel";
import {renderWithProviders} from "@/test-utils";

vi.mock("@/hooks/mutations/useAdminMutations", () => ({
	useAdminCreateUser: () => ({mutateAsync: vi.fn(), isPending: false}),
}));

describe("CreateUserModal", () => {
	it("renders when open", () => {
		renderWithProviders(
			<CreateUserModal open={true} handleClose={vi.fn()} />,
		);
		expect(screen.getByText("Create New User")).toBeInTheDocument();
	});

	it("renders form fields", () => {
		renderWithProviders(
			<CreateUserModal open={true} handleClose={vi.fn()} />,
		);
		expect(screen.getByPlaceholderText("e.g., john_doe")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
	});

	it("renders cancel and create buttons", () => {
		renderWithProviders(
			<CreateUserModal open={true} handleClose={vi.fn()} />,
		);
		expect(screen.getByText("Cancel")).toBeInTheDocument();
		expect(screen.getByText("Create User")).toBeInTheDocument();
	});

	it("does not render when closed", () => {
		renderWithProviders(
			<CreateUserModal open={false} handleClose={vi.fn()} />,
		);
		expect(screen.queryByText("Create New User")).not.toBeInTheDocument();
	});
});
