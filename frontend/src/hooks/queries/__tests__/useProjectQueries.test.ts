import {describe, expect, it, vi, beforeEach} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useProjects, useProjectUsers} from "../useProjectQueries";

describe("useProjects", () => {
	beforeEach(() => {
		localStorage.setItem("auth_token", "test-token");
	});

	it("calls projectsService.listProjects", async () => {
		const listProjects = vi.fn().mockResolvedValue([{id: 1, name: "P1"}]);
		const wrapper = createWrapper({projectsService: {listProjects} as any});

		const {result} = renderHook(() => useProjects(), {wrapper});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(listProjects).toHaveBeenCalled();
		expect(result.current.data).toEqual([{id: 1, name: "P1"}]);
	});

	it("does not fetch without auth_token", () => {
		localStorage.clear();
		const listProjects = vi.fn();
		const wrapper = createWrapper({projectsService: {listProjects} as any});

		const {result} = renderHook(() => useProjects(), {wrapper});
		expect(result.current.fetchStatus).toBe("idle");
	});
});

describe("useProjectUsers", () => {
	beforeEach(() => {
		localStorage.setItem("auth_token", "test-token");
	});

	it("calls projectsService.listProjectUsers", async () => {
		const listProjectUsers = vi.fn().mockResolvedValue([{id: 1, username: "user1"}]);
		const wrapper = createWrapper({projectsService: {listProjectUsers} as any});

		const {result} = renderHook(() => useProjectUsers(1), {wrapper});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(listProjectUsers).toHaveBeenCalledWith(1);
	});
});
