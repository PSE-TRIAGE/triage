import {describe, expect, it, vi, beforeEach} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useAdminUsers, useAdminProjects, useAdminUserProjects} from "../useAdminQueries";

describe("useAdminUsers", () => {
	beforeEach(() => {
		localStorage.setItem("auth_token", "test-token");
	});

	it("calls adminUsersService.listUsers", async () => {
		const listUsers = vi.fn().mockResolvedValue([{id: 1, username: "admin"}]);
		const wrapper = createWrapper({adminUsersService: {listUsers} as any});

		const {result} = renderHook(() => useAdminUsers(), {wrapper});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(listUsers).toHaveBeenCalled();
	});
});

describe("useAdminProjects", () => {
	beforeEach(() => {
		localStorage.setItem("auth_token", "test-token");
	});

	it("calls projectsService.listAdminProjects", async () => {
		const listAdminProjects = vi.fn().mockResolvedValue([{id: 1}]);
		const wrapper = createWrapper({projectsService: {listAdminProjects} as any});

		const {result} = renderHook(() => useAdminProjects(), {wrapper});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(listAdminProjects).toHaveBeenCalled();
	});
});

describe("useAdminUserProjects", () => {
	beforeEach(() => {
		localStorage.setItem("auth_token", "test-token");
	});

	it("calls adminUsersService.listUserProjects", async () => {
		const listUserProjects = vi.fn().mockResolvedValue([{id: 1}]);
		const wrapper = createWrapper({adminUsersService: {listUserProjects} as any});

		const {result} = renderHook(() => useAdminUserProjects(1), {wrapper});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(listUserProjects).toHaveBeenCalledWith(1);
	});
});
