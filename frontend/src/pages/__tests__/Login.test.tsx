import {act, fireEvent, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {ApiError} from "@/api/client";
import {renderWithProviders} from "@/test-utils";
import {Login} from "../Login";

vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => vi.fn(),
}));

const mockUseLogin = vi.fn();
vi.mock("@/hooks/mutations/useAuthMutations", () => ({
    useLogin: (...args: any[]) => mockUseLogin(...args),
}));

describe("Login", () => {
    const mockMutate = vi.fn();

    beforeEach(() => {
        mockMutate.mockReset();
        mockUseLogin.mockReset();
        mockUseLogin.mockReturnValue({
            mutate: mockMutate,
            isPending: false,
            isError: false,
            error: null,
        });
    });

    it("renders the login form", () => {
        renderWithProviders(<Login />);
        expect(
            screen.getByPlaceholderText("e.g. I ❤ Informatik"),
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("e.g. BadPassword123"),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Login"})).toBeInTheDocument();
    });

    it("shows required validation errors when submitting empty credentials", async () => {
        renderWithProviders(<Login />);
        fireEvent.click(screen.getByRole("button", {name: "Login"}));

        expect(
            await screen.findByText("please enter a valid username"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("please enter a valid password"),
        ).toBeInTheDocument();
    });

    it("submits entered credentials via login mutation", async () => {
        renderWithProviders(<Login />);
        fireEvent.change(screen.getByPlaceholderText("e.g. I ❤ Informatik"), {
            target: {value: "alice"},
        });
        fireEvent.change(screen.getByPlaceholderText("e.g. BadPassword123"), {
            target: {value: "sup3rsecret"},
        });

        fireEvent.click(screen.getByRole("button", {name: "Login"}));

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledTimes(1);
        });
        const [payload, options] = mockMutate.mock.calls[0];
        expect(payload).toEqual({username: "alice", password: "sup3rsecret"});
        expect(options).toEqual(
            expect.objectContaining({onError: expect.any(Function)}),
        );
    });

    it("clears only the password field when mutation onError callback runs", async () => {
        renderWithProviders(<Login />);
        const usernameInput = screen.getByPlaceholderText(
            "e.g. I ❤ Informatik",
        ) as HTMLInputElement;
        const passwordInput = screen.getByPlaceholderText(
            "e.g. BadPassword123",
        ) as HTMLInputElement;

        fireEvent.change(usernameInput, {target: {value: "alice"}});
        fireEvent.change(passwordInput, {target: {value: "bad-password"}});
        fireEvent.click(screen.getByRole("button", {name: "Login"}));

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledTimes(1);
        });
        const [, options] = mockMutate.mock.calls[0];
        act(() => {
            options.onError?.(new Error("Unauthorized"));
        });

        expect(usernameInput.value).toBe("alice");
        expect(passwordInput.value).toBe("");
    });

    it("disables submit button and shows loading text while request is pending", () => {
        mockUseLogin.mockReturnValue({
            mutate: mockMutate,
            isPending: true,
            isError: false,
            error: null,
        });

        renderWithProviders(<Login />);
        const button = screen.getByRole("button", {name: "Loggin in.."});
        expect(button).toBeDisabled();
    });

    it.each([
        [new ApiError(401, "Unauthorized"), "Invalid username or password"],
        [
            new ApiError(500, "Internal Server Error"),
            "Server error, please try again later",
        ],
        [new Error("network"), "Login failed. Please try again."],
    ])("shows correct error message for %p", (error, message) => {
        mockUseLogin.mockReturnValue({
            mutate: mockMutate,
            isPending: false,
            isError: true,
            error,
        });

        renderWithProviders(<Login />);
        expect(screen.getByText(message)).toBeInTheDocument();
    });
});
