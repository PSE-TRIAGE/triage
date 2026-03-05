import {beforeEach, describe, expect, it, vi} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {
    useAdminProjects,
    useAdminUserProjects,
    useAdminUsers,
} from "../useAdminQueries";

describe("useAdminUsers", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("fetches admin users when auth token exists", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listUsers = vi.fn().mockResolvedValue([{id: 1, username: "admin"}]);
        const wrapper = createWrapper({adminUsersService: {listUsers} as any});
        const {result} = renderHook(() => useAdminUsers(), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(listUsers).toHaveBeenCalledTimes(1);
        expect(result.current.data).toEqual([{id: 1, username: "admin"}]);
    });

    it("does not fetch users without auth token", () => {
        const listUsers = vi.fn();
        const wrapper = createWrapper({adminUsersService: {listUsers} as any});
        const {result} = renderHook(() => useAdminUsers(), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(listUsers).not.toHaveBeenCalled();
    });

    it("surfaces admin users query errors", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listUsers = vi.fn().mockRejectedValue(new Error("failed"));
        const wrapper = createWrapper({adminUsersService: {listUsers} as any});
        const {result} = renderHook(() => useAdminUsers(), {wrapper});

        await waitFor(
            () => {
                expect(result.current.isError).toBe(true);
            },
            {timeout: 2500},
        );
        expect(listUsers).toHaveBeenCalledTimes(2);
    });
});

describe("useAdminProjects", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("fetches admin projects when auth token exists", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listAdminProjects = vi.fn().mockResolvedValue([{id: 1}]);
        const wrapper = createWrapper({
            projectsService: {listAdminProjects} as any,
        });
        const {result} = renderHook(() => useAdminProjects(), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(listAdminProjects).toHaveBeenCalledTimes(1);
        expect(result.current.data).toEqual([{id: 1}]);
    });

    it("does not fetch admin projects without auth token", () => {
        const listAdminProjects = vi.fn();
        const wrapper = createWrapper({
            projectsService: {listAdminProjects} as any,
        });
        const {result} = renderHook(() => useAdminProjects(), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(listAdminProjects).not.toHaveBeenCalled();
    });

    it("surfaces admin projects query errors", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listAdminProjects = vi.fn().mockRejectedValue(new Error("failed"));
        const wrapper = createWrapper({
            projectsService: {listAdminProjects} as any,
        });
        const {result} = renderHook(() => useAdminProjects(), {wrapper});

        await waitFor(
            () => {
                expect(result.current.isError).toBe(true);
            },
            {timeout: 2500},
        );
        expect(listAdminProjects).toHaveBeenCalledTimes(2);
    });
});

describe("useAdminUserProjects", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("fetches projects for valid user id with auth token", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listUserProjects = vi.fn().mockResolvedValue([{id: 1}]);
        const wrapper = createWrapper({
            adminUsersService: {listUserProjects} as any,
        });
        const {result} = renderHook(() => useAdminUserProjects(1), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(listUserProjects).toHaveBeenCalledWith(1);
        expect(result.current.data).toEqual([{id: 1}]);
    });

    it("does not fetch without auth token", () => {
        const listUserProjects = vi.fn();
        const wrapper = createWrapper({
            adminUsersService: {listUserProjects} as any,
        });
        const {result} = renderHook(() => useAdminUserProjects(1), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(listUserProjects).not.toHaveBeenCalled();
    });

    it("does not fetch when user id is not finite", () => {
        localStorage.setItem("auth_token", "test-token");
        const listUserProjects = vi.fn();
        const wrapper = createWrapper({
            adminUsersService: {listUserProjects} as any,
        });
        const {result} = renderHook(
            () => useAdminUserProjects(Number.NaN),
            {wrapper},
        );

        expect(result.current.fetchStatus).toBe("idle");
        expect(listUserProjects).not.toHaveBeenCalled();
    });

    it("surfaces admin user projects query errors", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listUserProjects = vi.fn().mockRejectedValue(new Error("failed"));
        const wrapper = createWrapper({
            adminUsersService: {listUserProjects} as any,
        });
        const {result} = renderHook(() => useAdminUserProjects(1), {wrapper});

        await waitFor(
            () => {
                expect(result.current.isError).toBe(true);
            },
            {timeout: 2500},
        );
        expect(listUserProjects).toHaveBeenCalledTimes(2);
        expect(listUserProjects).toHaveBeenCalledWith(1);
    });
});
