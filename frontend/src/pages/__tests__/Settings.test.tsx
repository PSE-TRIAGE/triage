import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {Settings} from "../Settings";
import {renderWithProviders} from "@/test-utils";

vi.mock("@/hooks/mutations/useAuthMutations", () => ({
	useDeactivateAccount: () => ({mutateAsync: vi.fn(), isPending: false}),
	useChangePassword: () => ({mutateAsync: vi.fn(), isPending: false}),
	useChangeUsername: () => ({mutateAsync: vi.fn(), isPending: false}),
}));

vi.mock("@/hooks/queries/useUserQueries", () => ({
	useMe: () => ({data: {username: "testuser", isAdmin: false}}),
}));

describe("Settings", () => {
	it("renders page title", () => {
		renderWithProviders(<Settings />);
		expect(screen.getByText("Account Settings")).toBeInTheDocument();
	});

	it("renders subtitle", () => {
		renderWithProviders(<Settings />);
		expect(screen.getByText("Manage your account information and preferences")).toBeInTheDocument();
	});

	it("renders ProfileDataManagement section", () => {
		renderWithProviders(<Settings />);
		expect(screen.getByText("Profile Information")).toBeInTheDocument();
		expect(screen.getByText("Change Password")).toBeInTheDocument();
	});

	it("renders DeactivateAccount section", () => {
		renderWithProviders(<Settings />);
		expect(screen.getByText("Danger Zone")).toBeInTheDocument();
	});
});
