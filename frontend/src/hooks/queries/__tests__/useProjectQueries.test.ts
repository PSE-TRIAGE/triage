import {beforeEach, describe, expect, it, vi} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useProjects, useProjectUsers} from "../useProjectQueries";

describe("useProjects", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("fetches project list when auth token exists", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listProjects = vi.fn().mockResolvedValue([{id: 1, name: "P1"}]);
        const wrapper = createWrapper({projectsService: {listProjects} as any});
        const {result} = renderHook(() => useProjects(), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(listProjects).toHaveBeenCalledTimes(1);
        expect(result.current.data).toEqual([{id: 1, name: "P1"}]);
    });

    it("does not fetch without auth token", () => {
        const listProjects = vi.fn();
        const wrapper = createWrapper({projectsService: {listProjects} as any});
        const {result} = renderHook(() => useProjects(), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(listProjects).not.toHaveBeenCalled();
    });

    it("surfaces query errors", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listProjects = vi.fn().mockRejectedValue(new Error("failed"));
        const wrapper = createWrapper({projectsService: {listProjects} as any});
        const {result} = renderHook(() => useProjects(), {wrapper});

        await waitFor(
            () => {
                expect(result.current.isError).toBe(true);
            },
            {timeout: 2500},
        );
        expect(listProjects).toHaveBeenCalledTimes(2);
    });
});

describe("useProjectUsers", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("fetches users for a valid project id with auth token", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listProjectUsers = vi
            .fn()
            .mockResolvedValue([{id: 1, username: "user1"}]);
        const wrapper = createWrapper({
            projectsService: {listProjectUsers} as any,
        });
        const {result} = renderHook(() => useProjectUsers(1), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(listProjectUsers).toHaveBeenCalledWith(1);
        expect(result.current.data).toEqual([{id: 1, username: "user1"}]);
    });

    it("does not fetch when project id is falsy", () => {
        localStorage.setItem("auth_token", "test-token");
        const listProjectUsers = vi.fn();
        const wrapper = createWrapper({
            projectsService: {listProjectUsers} as any,
        });
        const {result} = renderHook(() => useProjectUsers(0), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(listProjectUsers).not.toHaveBeenCalled();
    });

    it("does not fetch without auth token", () => {
        const listProjectUsers = vi.fn();
        const wrapper = createWrapper({
            projectsService: {listProjectUsers} as any,
        });
        const {result} = renderHook(() => useProjectUsers(1), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(listProjectUsers).not.toHaveBeenCalled();
    });

    it("surfaces project users query errors", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listProjectUsers = vi.fn().mockRejectedValue(new Error("failed"));
        const wrapper = createWrapper({
            projectsService: {listProjectUsers} as any,
        });
        const {result} = renderHook(() => useProjectUsers(1), {wrapper});

        await waitFor(
            () => {
                expect(result.current.isError).toBe(true);
            },
            {timeout: 2500},
        );
        expect(listProjectUsers).toHaveBeenCalledTimes(2);
        expect(listProjectUsers).toHaveBeenCalledWith(1);
    });
});
