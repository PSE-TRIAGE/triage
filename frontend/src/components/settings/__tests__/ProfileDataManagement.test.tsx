import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {ProfileDataManagement} from "../ProfileDataManagement";
import {renderWithProviders} from "@/test-utils";

vi.mock("@/hooks/mutations/useAuthMutations", () => ({
    useChangePassword: () => ({mutateAsync: vi.fn(), isPending: false}),
    useChangeUsername: () => ({mutateAsync: vi.fn(), isPending: false}),
}));

vi.mock("@/hooks/queries/useUserQueries", () => ({
    useMe: () => ({data: {username: "testuser", isAdmin: false}}),
}));

describe("ProfileDataManagement", () => {
    it("renders profile information card", () => {
        renderWithProviders(<ProfileDataManagement />);
        expect(screen.getByText("Profile Information")).toBeInTheDocument();
    });

    it("renders change password card", () => {
        renderWithProviders(<ProfileDataManagement />);
        expect(screen.getByText("Change Password")).toBeInTheDocument();
    });

    it("renders save changes button", () => {
        renderWithProviders(<ProfileDataManagement />);
        expect(screen.getByText("Save Changes")).toBeInTheDocument();
    });

    it("renders update password button", () => {
        renderWithProviders(<ProfileDataManagement />);
        expect(screen.getByText("Update Password")).toBeInTheDocument();
    });

    it("renders password input fields", () => {
        renderWithProviders(<ProfileDataManagement />);
        expect(
            screen.getByPlaceholderText("Your current password..."),
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Your new password..."),
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Your new password again..."),
        ).toBeInTheDocument();
    });
});
