import {fireEvent, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {renderWithProviders} from "@/test-utils";
import {CreateUserModal} from "../CreateUserModel";

const useAdminCreateUserMock = vi.fn();
const mutateAsyncMock = vi.fn();

vi.mock("@/hooks/mutations/useAdminMutations", () => ({
    useAdminCreateUser: () => useAdminCreateUserMock(),
}));

describe("CreateUserModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mutateAsyncMock.mockResolvedValue(undefined);
        useAdminCreateUserMock.mockReturnValue({
            mutateAsync: mutateAsyncMock,
            isPending: false,
        });
    });

    it("renders when open", () => {
        renderWithProviders(
            <CreateUserModal open={true} handleClose={vi.fn()} />,
        );
        expect(screen.getByText("Create New User")).toBeInTheDocument();
    });

    it("shows validation errors and blocks submit for empty form", async () => {
        const handleClose = vi.fn();
        renderWithProviders(
            <CreateUserModal open={true} handleClose={handleClose} />,
        );

        fireEvent.click(screen.getByRole("button", {name: "Create User"}));

        expect(
            await screen.findByText("Username is required"),
        ).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();
        expect(mutateAsyncMock).not.toHaveBeenCalled();
        expect(handleClose).not.toHaveBeenCalled();
    });

    it("submits valid values and closes on success", async () => {
        const handleClose = vi.fn();
        renderWithProviders(
            <CreateUserModal open={true} handleClose={handleClose} />,
        );

        fireEvent.change(screen.getByPlaceholderText("e.g., john_doe"), {
            target: {value: "john_doe"},
        });
        fireEvent.change(screen.getByPlaceholderText("Enter password"), {
            target: {value: "supersecret"},
        });
        fireEvent.click(screen.getByRole("button", {name: "Create User"}));

        await waitFor(() => {
            expect(mutateAsyncMock).toHaveBeenCalledWith({
                username: "john_doe",
                password: "supersecret",
            });
        });
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("does not close when create request fails", async () => {
        const handleClose = vi.fn();
        mutateAsyncMock.mockRejectedValueOnce(new Error("create failed"));
        renderWithProviders(
            <CreateUserModal open={true} handleClose={handleClose} />,
        );

        fireEvent.change(screen.getByPlaceholderText("e.g., john_doe"), {
            target: {value: "john_doe"},
        });
        fireEvent.change(screen.getByPlaceholderText("Enter password"), {
            target: {value: "supersecret"},
        });
        fireEvent.click(screen.getByRole("button", {name: "Create User"}));

        await waitFor(() => {
            expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
        });
        expect(handleClose).not.toHaveBeenCalled();
    });

    it("calls handleClose when cancel is clicked", () => {
        const handleClose = vi.fn();
        renderWithProviders(
            <CreateUserModal open={true} handleClose={handleClose} />,
        );

        fireEvent.click(screen.getByRole("button", {name: "Cancel"}));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("does not render when closed", () => {
        renderWithProviders(
            <CreateUserModal open={false} handleClose={vi.fn()} />,
        );
        expect(screen.queryByText("Create New User")).not.toBeInTheDocument();
    });
});
