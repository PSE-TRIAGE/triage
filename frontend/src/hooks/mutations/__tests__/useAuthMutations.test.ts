import {describe, expect, it, vi, beforeEach} from "vitest";
import {renderHook, waitFor, act} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useLogin, useLogout, useChangePassword, useChangeUsername, useDeactivateAccount} from "../useAuthMutations";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
}));

describe("useLogin", () => {
	beforeEach(() => {
		localStorage.setItem("auth_token", "test-token");
	});

	it("calls authService.login on mutate", async () => {
		const login = vi.fn().mockResolvedValue({token: "abc"});
		const wrapper = createWrapper({authService: {login} as any});

		const {result} = renderHook(() => useLogin(), {wrapper});

		await act(async () => {
			result.current.mutate({username: "user", password: "pass"});
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(login).toHaveBeenCalledWith({username: "user", password: "pass"});
		expect(localStorage.getItem("auth_token")).toBe("abc");
	});

	it("handles login error", async () => {
		const login = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({authService: {login} as any});

		const {result} = renderHook(() => useLogin(), {wrapper});

		await act(async () => {
			result.current.mutate({username: "user", password: "pass"});
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useLogout", () => {
	it("calls authService.logout", async () => {
		const logout = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({authService: {logout} as any});

		const {result} = renderHook(() => useLogout(), {wrapper});

		await act(async () => {
			result.current.mutate();
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(logout).toHaveBeenCalled();
	});

	it("handles logout error", async () => {
		const logout = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({authService: {logout} as any});

		const {result} = renderHook(() => useLogout(), {wrapper});

		await act(async () => {
			result.current.mutate();
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useChangePassword", () => {
	it("calls userService.changePassword", async () => {
		const changePassword = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({userService: {changePassword} as any});

		const {result} = renderHook(() => useChangePassword(), {wrapper});

		await act(async () => {
			result.current.mutate({old_password: "old", new_password: "new"});
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(changePassword).toHaveBeenCalledWith({old_password: "old", new_password: "new"});
	});

	it("handles error", async () => {
		const changePassword = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({userService: {changePassword} as any});

		const {result} = renderHook(() => useChangePassword(), {wrapper});

		await act(async () => {
			result.current.mutate({old_password: "old", new_password: "new"});
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useChangeUsername", () => {
	it("calls userService.changeUsername", async () => {
		const changeUsername = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({userService: {changeUsername} as any});

		const {result} = renderHook(() => useChangeUsername(), {wrapper});

		await act(async () => {
			result.current.mutate({new_username: "newuser"});
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(changeUsername).toHaveBeenCalledWith({new_username: "newuser"});
	});

	it("handles error", async () => {
		const changeUsername = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({userService: {changeUsername} as any});

		const {result} = renderHook(() => useChangeUsername(), {wrapper});

		await act(async () => {
			result.current.mutate({new_username: "newuser"});
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useDeactivateAccount", () => {
	it("calls userService.deactivateAccount", async () => {
		const deactivateAccount = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({userService: {deactivateAccount} as any});

		const {result} = renderHook(() => useDeactivateAccount(), {wrapper});

		await act(async () => {
			result.current.mutate();
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(deactivateAccount).toHaveBeenCalled();
	});

	it("handles error", async () => {
		const deactivateAccount = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({userService: {deactivateAccount} as any});

		const {result} = renderHook(() => useDeactivateAccount(), {wrapper});

		await act(async () => {
			result.current.mutate();
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});
