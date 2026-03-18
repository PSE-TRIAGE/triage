import {fireEvent, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {renderWithProviders} from "@/test-utils";
import {Settings} from "../Settings";

const mockDeactivateAccount = vi.fn();
const mockChangePassword = vi.fn();
const mockChangeUsername = vi.fn();
const mockMutations = {
    deactivate: {mutateAsync: mockDeactivateAccount, isPending: false},
    changePassword: {mutateAsync: mockChangePassword, isPending: false},
    changeUsername: {mutateAsync: mockChangeUsername, isPending: false},
};

vi.mock("@/hooks/mutations/useAuthMutations", () => ({
    useDeactivateAccount: () => mockMutations.deactivate,
    useChangePassword: () => mockMutations.changePassword,
    useChangeUsername: () => mockMutations.changeUsername,
}));

vi.mock("@/hooks/queries/useUserQueries", () => ({
    useMe: () => ({data: {username: "testuser", isAdmin: false}}),
}));

describe("Settings", () => {
    beforeEach(() => {
        mockDeactivateAccount.mockReset();
        mockChangePassword.mockReset();
        mockChangeUsername.mockReset();
        mockDeactivateAccount.mockResolvedValue(undefined);
        mockChangePassword.mockResolvedValue(undefined);
        mockChangeUsername.mockResolvedValue(undefined);
        mockMutations.deactivate.isPending = false;
        mockMutations.changePassword.isPending = false;
        mockMutations.changeUsername.isPending = false;
    });

    it("renders account settings layout", () => {
        renderWithProviders(<Settings />);
        expect(screen.getByText("Account Settings")).toBeInTheDocument();
        expect(screen.getByText("Profile Information")).toBeInTheDocument();
        expect(screen.getByText("Danger Zone")).toBeInTheDocument();
    });

    it("submits username change only after input value changes", async () => {
        renderWithProviders(<Settings />);
        const usernameInput = screen.getByPlaceholderText("Your username...");
        const saveButton = screen.getByRole("button", {name: "Save Changes"});

        expect(saveButton).toBeDisabled();
        fireEvent.change(usernameInput, {target: {value: "new-user-name"}});
        expect(saveButton).toBeEnabled();

        fireEvent.click(saveButton);
        await waitFor(() => {
            expect(mockChangeUsername).toHaveBeenCalledWith({
                new_username: "new-user-name",
            });
        });
    });

    it("shows validation error and blocks password mutation when confirmation does not match", async () => {
        renderWithProviders(<Settings />);
        fireEvent.change(
            screen.getByPlaceholderText("Your current password..."),
            {
                target: {value: "current-123"},
            },
        );
        fireEvent.change(screen.getByPlaceholderText("Your new password..."), {
            target: {value: "new-password-123"},
        });
        fireEvent.change(
            screen.getByPlaceholderText("Your new password again..."),
            {
                target: {value: "different-password"},
            },
        );

        fireEvent.click(screen.getByRole("button", {name: "Update Password"}));

        expect(
            await screen.findByText(
                "Passwords do not match. Please ensure both password fields are identical.",
            ),
        ).toBeInTheDocument();
        expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("confirms and triggers account deactivation", async () => {
        renderWithProviders(<Settings />);
        fireEvent.click(
            screen.getByRole("button", {name: "Deactivate this account"}),
        );
        fireEvent.click(
            screen.getByRole("button", {name: "Yes, deactivate my account"}),
        );

        await waitFor(() => {
            expect(mockDeactivateAccount).toHaveBeenCalledTimes(1);
        });
    });
});
