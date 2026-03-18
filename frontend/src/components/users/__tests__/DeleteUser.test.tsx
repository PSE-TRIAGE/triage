import {fireEvent, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {renderWithProviders} from "@/test-utils";
import {DeleteUser} from "../DeleteUser";

const useAdminDeleteUserMock = vi.fn();
const useAdminDisableUserMock = vi.fn();
const useMeMock = vi.fn();
const deleteMutateAsyncMock = vi.fn();
const disableMutateAsyncMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("@/hooks/mutations/useAdminMutations", () => ({
    useAdminDeleteUser: () => useAdminDeleteUserMock(),
    useAdminDisableUser: () => useAdminDisableUserMock(),
}));

vi.mock("@/hooks/queries/useUserQueries", () => ({
    useMe: () => useMeMock(),
}));

vi.mock("sonner", () => ({
    toast: {
        error: (...args: unknown[]) => toastErrorMock(...args),
    },
}));

const mockUser = {
    id: 1,
    username: "target_user",
    isAdmin: false,
    isActive: true,
};

describe("DeleteUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        deleteMutateAsyncMock.mockResolvedValue(undefined);
        disableMutateAsyncMock.mockResolvedValue(undefined);
        useAdminDeleteUserMock.mockReturnValue({
            mutateAsync: deleteMutateAsyncMock,
            isPending: false,
        });
        useAdminDisableUserMock.mockReturnValue({
            mutateAsync: disableMutateAsyncMock,
            isPending: false,
        });
        useMeMock.mockReturnValue({data: {id: "99", username: "currentAdmin"}});
    });

    it("deactivates user by default when confirmed", async () => {
        renderWithProviders(
            <DeleteUser
                user={mockUser as any}
                open={true}
                onOpenChange={vi.fn()}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", {name: "Yes, deactivate user"}),
        );

        await waitFor(() => {
            expect(disableMutateAsyncMock).toHaveBeenCalledWith(1);
        });
        expect(deleteMutateAsyncMock).not.toHaveBeenCalled();
    });

    it("deletes user data when checkbox is selected", async () => {
        renderWithProviders(
            <DeleteUser
                user={mockUser as any}
                open={true}
                onOpenChange={vi.fn()}
            />,
        );

        const checkbox = screen.getByRole("checkbox");
        fireEvent.click(checkbox);
        expect(
            screen.getByText("Permanently delete user data?"),
        ).toBeInTheDocument();
        fireEvent.click(
            screen.getByRole("button", {name: "Yes, delete user data"}),
        );

        await waitFor(() => {
            expect(deleteMutateAsyncMock).toHaveBeenCalledWith(1);
        });
        expect(disableMutateAsyncMock).not.toHaveBeenCalled();
    });

    it("prevents self-deactivation and shows toast error", async () => {
        useMeMock.mockReturnValueOnce({
            data: {id: "1", username: "target_user"},
        });
        renderWithProviders(
            <DeleteUser
                user={mockUser as any}
                open={true}
                onOpenChange={vi.fn()}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", {name: "Yes, deactivate user"}),
        );

        await waitFor(() => {
            expect(toastErrorMock).toHaveBeenCalledWith(
                expect.stringContaining(
                    "You cannot deactivate or delete your own account",
                ),
            );
        });
        expect(deleteMutateAsyncMock).not.toHaveBeenCalled();
        expect(disableMutateAsyncMock).not.toHaveBeenCalled();
    });

    it("shows pending state and disables controls", () => {
        useAdminDisableUserMock.mockReturnValueOnce({
            mutateAsync: disableMutateAsyncMock,
            isPending: true,
        });
        renderWithProviders(
            <DeleteUser
                user={mockUser as any}
                open={true}
                onOpenChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("checkbox")).toBeDisabled();
        expect(
            screen.getByRole("button", {name: "Deactivating..."}),
        ).toBeDisabled();
    });

    it("calls onOpenChange(false) when cancel is clicked", async () => {
        const onOpenChange = vi.fn();
        renderWithProviders(
            <DeleteUser
                user={mockUser as any}
                open={true}
                onOpenChange={onOpenChange}
            />,
        );

        fireEvent.click(screen.getByRole("button", {name: "Cancel"}));

        await waitFor(() => {
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });
    });

    it("does not render when closed", () => {
        renderWithProviders(
            <DeleteUser
                user={mockUser as any}
                open={false}
                onOpenChange={vi.fn()}
            />,
        );
        expect(
            screen.queryByText("Deactivate this user?"),
        ).not.toBeInTheDocument();
    });
});
