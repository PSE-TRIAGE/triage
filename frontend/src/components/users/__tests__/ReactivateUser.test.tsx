import {fireEvent, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {ReactivateUser} from "../ReactivateUser";
import {renderWithProviders} from "@/test-utils";

const useAdminEnableUserMock = vi.fn();
const mutateAsyncMock = vi.fn();

vi.mock("@/hooks/mutations/useAdminMutations", () => ({
    useAdminEnableUser: () => useAdminEnableUserMock(),
}));

const mockUser = {
    id: 1,
    username: "deactivated_user",
    isAdmin: false,
    isActive: false,
};

describe("ReactivateUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mutateAsyncMock.mockResolvedValue(undefined);
        useAdminEnableUserMock.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isPending: false,
        });
    });

    it("renders dialog when open", () => {
        renderWithProviders(
            <ReactivateUser
                user={mockUser as any}
                open={true}
                onOpenChange={vi.fn()}
            />,
        );
        expect(screen.getByText("Reactivate this user?")).toBeInTheDocument();
    });

    it("reactivates user and closes dialog on confirm", async () => {
        const onOpenChange = vi.fn();
        renderWithProviders(
            <ReactivateUser
                user={mockUser as any}
                open={true}
                onOpenChange={onOpenChange}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", {name: "Yes, reactivate user"}),
        );

        await waitFor(() => {
            expect(mutateAsyncMock).toHaveBeenCalledWith(1);
        });
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("shows loading state while mutation is pending", () => {
        useAdminEnableUserMock.mockReturnValueOnce({
            mutateAsync: mutateAsyncMock,
            isPending: true,
        });
        renderWithProviders(
            <ReactivateUser
                user={mockUser as any}
                open={true}
                onOpenChange={vi.fn()}
            />,
        );

        const confirmButton = screen.getByRole("button", {
            name: "Reactivating...",
        });
        expect(confirmButton).toBeDisabled();
        expect(
            screen.getByRole("button", {name: "Cancel"}),
        ).toBeInTheDocument();
    });

    it("calls onOpenChange(false) when cancel is clicked", async () => {
        const onOpenChange = vi.fn();
        renderWithProviders(
            <ReactivateUser
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
            <ReactivateUser
                user={mockUser as any}
                open={false}
                onOpenChange={vi.fn()}
            />,
        );
        expect(
            screen.queryByText("Reactivate this user?"),
        ).not.toBeInTheDocument();
    });
});
