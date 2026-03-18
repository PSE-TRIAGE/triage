import {act, renderHook, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {queryClient, queryKeys} from "@/lib/queryClient";
import {createWrapper} from "@/test-utils";
import {
    useAdminChangeRole,
    useAdminCreateUser,
    useAdminDeleteUser,
    useAdminDisableUser,
    useAdminEnableUser,
} from "../useAdminMutations";

const mocks = vi.hoisted(() => ({
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        success: (...args: unknown[]) => mocks.toastSuccess(...args),
        error: (...args: unknown[]) => mocks.toastError(...args),
    },
}));

function findSetQueryDataCall(
    setQueryDataSpy: {mock: {calls: unknown[][]}},
    queryKey: readonly unknown[],
) {
    return setQueryDataSpy.mock.calls.find(
        ([key]) => JSON.stringify(key) === JSON.stringify(queryKey),
    );
}

describe("useAdminMutations", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
        queryClient.clear();
    });

    describe("useAdminCreateUser", () => {
        it("calls createUser, invalidates users query, and shows success toast", async () => {
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const createUser = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                adminUsersService: {createUser} as any,
            });
            const {result} = renderHook(() => useAdminCreateUser(), {wrapper});

            await act(async () => {
                result.current.mutate({username: "new", password: "pass1234"});
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(createUser).toHaveBeenCalledWith({
                username: "new",
                password: "pass1234",
            });
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.admin.users,
            });
            expect(mocks.toastSuccess).toHaveBeenCalledWith(
                "User created successfully",
            );
        });

        it("shows error toast when create user fails", async () => {
            const createUser = vi.fn().mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                adminUsersService: {createUser} as any,
            });
            const {result} = renderHook(() => useAdminCreateUser(), {wrapper});

            await act(async () => {
                result.current.mutate({username: "new", password: "pass1234"});
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(mocks.toastError).toHaveBeenCalledWith(
                "Failed to create user",
            );
        });
    });

    describe("useAdminDeleteUser", () => {
        it("removes user from cache and invalidates users query", async () => {
            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const deleteUser = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                adminUsersService: {deleteUser} as any,
            });
            const {result} = renderHook(() => useAdminDeleteUser(), {wrapper});

            await act(async () => {
                result.current.mutate(1);
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(deleteUser).toHaveBeenCalledWith(1);

            const usersCall = findSetQueryDataCall(
                setQueryDataSpy,
                queryKeys.admin.users,
            );
            expect(usersCall).toBeDefined();
            const usersUpdater = usersCall?.[1] as
                | ((
                      users: Array<{id: number; username: string}>,
                  ) => Array<{id: number; username: string}>)
                | undefined;
            expect(
                usersUpdater?.([
                    {id: 1, username: "a"},
                    {id: 2, username: "b"},
                ]),
            ).toEqual([{id: 2, username: "b"}]);

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.admin.users,
            });
            expect(mocks.toastSuccess).toHaveBeenCalledWith(
                "User data deleted successfully",
            );
        });

        it("shows error toast when delete fails", async () => {
            const deleteUser = vi.fn().mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                adminUsersService: {deleteUser} as any,
            });
            const {result} = renderHook(() => useAdminDeleteUser(), {wrapper});

            await act(async () => {
                result.current.mutate(1);
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(mocks.toastError).toHaveBeenCalledWith(
                "Failed to delete user data",
            );
        });
    });

    describe("useAdminDisableUser", () => {
        it("marks user inactive in cache and invalidates users query", async () => {
            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const disableUser = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                adminUsersService: {disableUser} as any,
            });
            const {result} = renderHook(() => useAdminDisableUser(), {wrapper});

            await act(async () => {
                result.current.mutate(1);
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(disableUser).toHaveBeenCalledWith(1);

            const usersCall = findSetQueryDataCall(
                setQueryDataSpy,
                queryKeys.admin.users,
            );
            const usersUpdater = usersCall?.[1] as
                | ((
                      users: Array<{id: number; isActive: boolean}>,
                  ) => Array<{id: number; isActive: boolean}>)
                | undefined;
            expect(
                usersUpdater?.([
                    {id: 1, isActive: true},
                    {id: 2, isActive: true},
                ]),
            ).toEqual([
                {id: 1, isActive: false},
                {id: 2, isActive: true},
            ]);
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.admin.users,
            });
            expect(mocks.toastSuccess).toHaveBeenCalledWith(
                "User deactivated successfully",
            );
        });

        it("shows error toast when disable fails", async () => {
            const disableUser = vi.fn().mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                adminUsersService: {disableUser} as any,
            });
            const {result} = renderHook(() => useAdminDisableUser(), {wrapper});

            await act(async () => {
                result.current.mutate(1);
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(mocks.toastError).toHaveBeenCalledWith(
                "Failed to deactivate user",
            );
        });
    });

    describe("useAdminEnableUser", () => {
        it("marks user active in cache and invalidates users query", async () => {
            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const enableUser = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                adminUsersService: {enableUser} as any,
            });
            const {result} = renderHook(() => useAdminEnableUser(), {wrapper});

            await act(async () => {
                result.current.mutate(1);
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(enableUser).toHaveBeenCalledWith(1);

            const usersCall = findSetQueryDataCall(
                setQueryDataSpy,
                queryKeys.admin.users,
            );
            const usersUpdater = usersCall?.[1] as
                | ((
                      users: Array<{id: number; isActive: boolean}>,
                  ) => Array<{id: number; isActive: boolean}>)
                | undefined;
            expect(
                usersUpdater?.([
                    {id: 1, isActive: false},
                    {id: 2, isActive: false},
                ]),
            ).toEqual([
                {id: 1, isActive: true},
                {id: 2, isActive: false},
            ]);
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.admin.users,
            });
            expect(mocks.toastSuccess).toHaveBeenCalledWith(
                "User reactivated successfully",
            );
        });

        it("shows error toast when enable fails", async () => {
            const enableUser = vi.fn().mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                adminUsersService: {enableUser} as any,
            });
            const {result} = renderHook(() => useAdminEnableUser(), {wrapper});

            await act(async () => {
                result.current.mutate(1);
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(mocks.toastError).toHaveBeenCalledWith(
                "Failed to reactivate user",
            );
        });
    });

    describe("useAdminChangeRole", () => {
        it("promotes user and shows success toast", async () => {
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const promoteUser = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                adminUsersService: {promoteUser} as any,
            });
            const {result} = renderHook(() => useAdminChangeRole(), {wrapper});

            await act(async () => {
                result.current.mutate({userId: 1, promote: true});
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(promoteUser).toHaveBeenCalledWith(1);
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.admin.users,
            });
            expect(mocks.toastSuccess).toHaveBeenCalledWith(
                "User promoted to admin",
            );
        });

        it("demotes user and shows success toast", async () => {
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const demoteUser = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                adminUsersService: {demoteUser} as any,
            });
            const {result} = renderHook(() => useAdminChangeRole(), {wrapper});

            await act(async () => {
                result.current.mutate({userId: 1, promote: false});
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(demoteUser).toHaveBeenCalledWith(1);
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.admin.users,
            });
            expect(mocks.toastSuccess).toHaveBeenCalledWith(
                "User demoted to member",
            );
        });

        it("shows error toast when role change fails", async () => {
            const promoteUser = vi.fn().mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                adminUsersService: {promoteUser} as any,
            });
            const {result} = renderHook(() => useAdminChangeRole(), {wrapper});

            await act(async () => {
                result.current.mutate({userId: 1, promote: true});
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(mocks.toastError).toHaveBeenCalledWith(
                "Failed to change user role",
            );
        });
    });
});
