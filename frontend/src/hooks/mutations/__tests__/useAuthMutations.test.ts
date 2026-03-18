import {act, renderHook, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {queryClient, queryKeys} from "@/lib/queryClient";
import {createWrapper} from "@/test-utils";
import {
    useChangePassword,
    useChangeUsername,
    useDeactivateAccount,
    useLogin,
    useLogout,
} from "../useAuthMutations";

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => mocks.navigate,
}));

vi.mock("sonner", () => ({
    toast: {
        success: (...args: unknown[]) => mocks.toastSuccess(...args),
        error: (...args: unknown[]) => mocks.toastError(...args),
    },
}));

describe("useAuthMutations", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
        queryClient.clear();
        localStorage.clear();
    });

    describe("useLogin", () => {
        it("stores auth token and navigates to dashboard on success", async () => {
            const login = vi.fn().mockResolvedValue({token: "abc"});
            const wrapper = createWrapper({authService: {login} as any});
            const {result} = renderHook(() => useLogin(), {wrapper});

            await act(async () => {
                result.current.mutate({username: "user", password: "pass"});
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(login).toHaveBeenCalledWith({
                username: "user",
                password: "pass",
            });
            expect(localStorage.getItem("auth_token")).toBe("abc");
            expect(mocks.navigate).toHaveBeenCalledWith({to: "/dashboard"});
        });

        it("exposes mutation error and does not navigate", async () => {
            const login = vi.fn().mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({authService: {login} as any});
            const {result} = renderHook(() => useLogin(), {wrapper});

            await act(async () => {
                result.current.mutate({username: "user", password: "pass"});
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(mocks.navigate).not.toHaveBeenCalled();
            expect(localStorage.getItem("auth_token")).toBeNull();
        });
    });

    describe("useLogout", () => {
        it("clears token cache, resets query cache, and navigates to login", async () => {
            localStorage.setItem("token", "legacy-token");
            localStorage.setItem("auth_token", "auth-token");

            const clearSpy = vi.spyOn(queryClient, "clear");
            const logout = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({authService: {logout} as any});
            const {result} = renderHook(() => useLogout(), {wrapper});

            await act(async () => {
                result.current.mutate();
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(logout).toHaveBeenCalledTimes(1);
            expect(localStorage.getItem("token")).toBeNull();
            expect(localStorage.getItem("auth_token")).toBe("auth-token");
            expect(clearSpy).toHaveBeenCalledTimes(1);
            expect(mocks.navigate).toHaveBeenCalledWith({to: "/login"});
            expect(mocks.toastSuccess).toHaveBeenCalledWith(
                "Logged out successfully",
            );
        });

        it("shows error toast when logout fails", async () => {
            const clearSpy = vi.spyOn(queryClient, "clear");
            const logout = vi.fn().mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({authService: {logout} as any});
            const {result} = renderHook(() => useLogout(), {wrapper});

            await act(async () => {
                result.current.mutate();
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(clearSpy).not.toHaveBeenCalled();
            expect(mocks.navigate).not.toHaveBeenCalled();
            expect(mocks.toastError).toHaveBeenCalledWith("Failed to logout");
        });
    });

    describe("useChangePassword", () => {
        it("calls userService.changePassword with request payload", async () => {
            const changePassword = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                userService: {changePassword} as any,
            });
            const {result} = renderHook(() => useChangePassword(), {wrapper});

            await act(async () => {
                result.current.mutate({
                    old_password: "old",
                    new_password: "new",
                });
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(changePassword).toHaveBeenCalledWith({
                old_password: "old",
                new_password: "new",
            });
        });

        it("handles change password errors", async () => {
            const changePassword = vi.fn().mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                userService: {changePassword} as any,
            });
            const {result} = renderHook(() => useChangePassword(), {wrapper});

            await act(async () => {
                result.current.mutate({
                    old_password: "old",
                    new_password: "new",
                });
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
        });
    });

    describe("useChangeUsername", () => {
        it("invalidates current user query after username change", async () => {
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const changeUsername = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                userService: {changeUsername} as any,
            });
            const {result} = renderHook(() => useChangeUsername(), {wrapper});

            await act(async () => {
                result.current.mutate({new_username: "newuser"});
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(changeUsername).toHaveBeenCalledWith({
                new_username: "newuser",
            });
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.auth.me,
            });
        });

        it("does not invalidate user query when request fails", async () => {
            const invalidateQueriesSpy = vi.spyOn(
                queryClient,
                "invalidateQueries",
            );
            const changeUsername = vi.fn().mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                userService: {changeUsername} as any,
            });
            const {result} = renderHook(() => useChangeUsername(), {wrapper});

            await act(async () => {
                result.current.mutate({new_username: "newuser"});
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
                queryKey: queryKeys.auth.me,
            });
        });
    });

    describe("useDeactivateAccount", () => {
        it("clears token/cache, navigates home, and shows success toast", async () => {
            localStorage.setItem("token", "legacy-token");
            localStorage.setItem("auth_token", "auth-token");

            const clearSpy = vi.spyOn(queryClient, "clear");
            const deactivateAccount = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                userService: {deactivateAccount} as any,
            });
            const {result} = renderHook(() => useDeactivateAccount(), {
                wrapper,
            });

            await act(async () => {
                result.current.mutate();
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(deactivateAccount).toHaveBeenCalledTimes(1);
            expect(clearSpy).toHaveBeenCalledTimes(1);
            expect(localStorage.getItem("token")).toBeNull();
            expect(localStorage.getItem("auth_token")).toBe("auth-token");
            expect(mocks.navigate).toHaveBeenCalledWith({to: "/"});
            expect(mocks.toastSuccess).toHaveBeenCalledWith(
                "Account deactivated successfully.",
            );
        });

        it("shows error toast when account deactivation fails", async () => {
            const clearSpy = vi.spyOn(queryClient, "clear");
            const deactivateAccount = vi
                .fn()
                .mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                userService: {deactivateAccount} as any,
            });
            const {result} = renderHook(() => useDeactivateAccount(), {
                wrapper,
            });

            await act(async () => {
                result.current.mutate();
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(clearSpy).not.toHaveBeenCalled();
            expect(mocks.navigate).not.toHaveBeenCalled();
            expect(mocks.toastError).toHaveBeenCalledWith(
                "Failed to deactivate account. Please try again.",
            );
        });
    });
});
