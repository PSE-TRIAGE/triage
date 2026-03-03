import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {UserUpdateModel} from "../UserUpdateModel";
import {renderWithProviders} from "@/test-utils";

vi.mock("@/hooks/mutations/useProjectMutations", () => ({
	useCreateProject: () => ({mutate: vi.fn(), isPending: false}),
}));

describe("UserUpdateModel", () => {
	it("renders when open", () => {
		renderWithProviders(
			<UserUpdateModel open={true} handleClose={vi.fn()} />,
		);
		expect(screen.getByText("Update User:")).toBeInTheDocument();
	});

	it("renders form fields", () => {
		renderWithProviders(
			<UserUpdateModel open={true} handleClose={vi.fn()} />,
		);
		expect(screen.getByPlaceholderText("e.g., Dr. Sarah Cheng")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("New password...")).toBeInTheDocument();
	});

	it("renders cancel and create buttons", () => {
		renderWithProviders(
			<UserUpdateModel open={true} handleClose={vi.fn()} />,
		);
		expect(screen.getByText("Cancel")).toBeInTheDocument();
		expect(screen.getByText("Create User")).toBeInTheDocument();
	});

	it("does not render when closed", () => {
		renderWithProviders(
			<UserUpdateModel open={false} handleClose={vi.fn()} />,
		);
		expect(screen.queryByText("Update User:")).not.toBeInTheDocument();
	});
});
