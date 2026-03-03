import {describe, expect, it, vi} from "vitest";
import {renderHook, waitFor, act} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {
	useAdminCreateUser,
	useAdminDeleteUser,
	useAdminDisableUser,
	useAdminEnableUser,
	useAdminChangeRole,
} from "../useAdminMutations";

describe("useAdminCreateUser", () => {
	it("calls adminUsersService.createUser", async () => {
		const createUser = vi.fn().mockResolvedValue({id: 1});
		const wrapper = createWrapper({adminUsersService: {createUser} as any});

		const {result} = renderHook(() => useAdminCreateUser(), {wrapper});

		await act(async () => {
			result.current.mutate({username: "new", password: "pass", is_admin: false});
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(createUser).toHaveBeenCalled();
	});

	it("handles error", async () => {
		const createUser = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({adminUsersService: {createUser} as any});

		const {result} = renderHook(() => useAdminCreateUser(), {wrapper});

		await act(async () => {
			result.current.mutate({username: "new", password: "pass", is_admin: false});
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useAdminDeleteUser", () => {
	it("calls adminUsersService.deleteUser", async () => {
		const deleteUser = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({adminUsersService: {deleteUser} as any});

		const {result} = renderHook(() => useAdminDeleteUser(), {wrapper});

		await act(async () => {
			result.current.mutate(1);
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(deleteUser).toHaveBeenCalledWith(1);
	});

	it("handles error", async () => {
		const deleteUser = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({adminUsersService: {deleteUser} as any});

		const {result} = renderHook(() => useAdminDeleteUser(), {wrapper});

		await act(async () => {
			result.current.mutate(1);
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useAdminDisableUser", () => {
	it("calls adminUsersService.disableUser", async () => {
		const disableUser = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({adminUsersService: {disableUser} as any});

		const {result} = renderHook(() => useAdminDisableUser(), {wrapper});

		await act(async () => {
			result.current.mutate(1);
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(disableUser).toHaveBeenCalledWith(1);
	});

	it("handles error", async () => {
		const disableUser = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({adminUsersService: {disableUser} as any});

		const {result} = renderHook(() => useAdminDisableUser(), {wrapper});

		await act(async () => {
			result.current.mutate(1);
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useAdminEnableUser", () => {
	it("calls adminUsersService.enableUser", async () => {
		const enableUser = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({adminUsersService: {enableUser} as any});

		const {result} = renderHook(() => useAdminEnableUser(), {wrapper});

		await act(async () => {
			result.current.mutate(1);
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(enableUser).toHaveBeenCalledWith(1);
	});

	it("handles error", async () => {
		const enableUser = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({adminUsersService: {enableUser} as any});

		const {result} = renderHook(() => useAdminEnableUser(), {wrapper});

		await act(async () => {
			result.current.mutate(1);
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useAdminChangeRole", () => {
	it("calls adminUsersService.promoteUser when promote=true", async () => {
		const promoteUser = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({adminUsersService: {promoteUser} as any});

		const {result} = renderHook(() => useAdminChangeRole(), {wrapper});

		await act(async () => {
			result.current.mutate({userId: 1, promote: true});
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(promoteUser).toHaveBeenCalledWith(1);
	});

	it("calls adminUsersService.demoteUser when promote=false", async () => {
		const demoteUser = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({adminUsersService: {demoteUser} as any});

		const {result} = renderHook(() => useAdminChangeRole(), {wrapper});

		await act(async () => {
			result.current.mutate({userId: 1, promote: false});
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(demoteUser).toHaveBeenCalledWith(1);
	});

	it("handles error", async () => {
		const promoteUser = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({adminUsersService: {promoteUser} as any});

		const {result} = renderHook(() => useAdminChangeRole(), {wrapper});

		await act(async () => {
			result.current.mutate({userId: 1, promote: true});
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});
