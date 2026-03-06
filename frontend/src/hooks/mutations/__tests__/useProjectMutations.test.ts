import {act, renderHook, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {createWrapper} from "@/test-utils";
import {queryClient, queryKeys} from "@/lib/queryClient";
import {
    useAddProjectUser,
    useCreateProject,
    useDeleteProject,
    useRemoveProjectUser,
    useRenameProject,
    useUploadSourceCode,
} from "../useProjectMutations";

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
    setProjectId: vi.fn(),
    setMutants: vi.fn(),
    setSelectedMutant: vi.fn(),
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

vi.mock("@/stores/mutantStore", () => ({
    useMutantStore: {
        getState: () => ({
            setProjectId: mocks.setProjectId,
            setMutants: mocks.setMutants,
            setSelectedMutant: mocks.setSelectedMutant,
        }),
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

describe("useProjectMutations", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
        queryClient.clear();
    });

    describe("useCreateProject", () => {
        it("invalidates relevant project/mutant queries and clears mutant store", async () => {
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const createProject = vi.fn().mockResolvedValue({id: 1});
            const wrapper = createWrapper({
                projectsService: {createProject} as any,
            });
            const {result} = renderHook(() => useCreateProject(), {wrapper});
            const file = new File(["xml"], "mutations.xml", {
                type: "application/xml",
            });

            await act(async () => {
                result.current.mutate({projectName: "New Project", file});
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(createProject).toHaveBeenCalledWith({
                projectName: "New Project",
                file,
            });
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.projects.all,
            });
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: ["mutants", "source"],
            });
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: ["mutants"],
            });
            expect(mocks.setProjectId).toHaveBeenCalledWith(null);
            expect(mocks.setMutants).toHaveBeenCalledWith([]);
            expect(mocks.setSelectedMutant).toHaveBeenCalledWith(null);
        });

        it("surfaces creation error without clearing store", async () => {
            const invalidateQueriesSpy = vi.spyOn(
                queryClient,
                "invalidateQueries",
            );
            const createProject = vi.fn().mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                projectsService: {createProject} as any,
            });
            const {result} = renderHook(() => useCreateProject(), {wrapper});
            const file = new File(["xml"], "mutations.xml", {
                type: "application/xml",
            });

            await act(async () => {
                result.current.mutate({projectName: "New Project", file});
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(invalidateQueriesSpy).not.toHaveBeenCalled();
            expect(mocks.setProjectId).not.toHaveBeenCalled();
            expect(mocks.setMutants).not.toHaveBeenCalled();
            expect(mocks.setSelectedMutant).not.toHaveBeenCalled();
        });
    });

    describe("useDeleteProject", () => {
        it("updates cache, invalidates queries, resets store and navigates", async () => {
            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const deleteProject = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                projectsService: {deleteProject} as any,
            });
            const {result} = renderHook(() => useDeleteProject(), {wrapper});

            await act(async () => {
                result.current.mutate(1);
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(deleteProject).toHaveBeenCalledWith(1);

            const projectsCall = findSetQueryDataCall(
                setQueryDataSpy,
                queryKeys.projects.all,
            );
            expect(projectsCall).toBeDefined();
            const projectsUpdater = projectsCall?.[1] as
                | ((
                      projects: Array<{id: number; name: string}>,
                  ) => Array<{id: number; name: string}>)
                | undefined;
            expect(
                projectsUpdater?.([
                    {id: 1, name: "A"},
                    {id: 2, name: "B"},
                ]),
            ).toEqual([{id: 2, name: "B"}]);

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.projects.all,
            });
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: ["mutants"],
            });
            expect(mocks.setProjectId).toHaveBeenCalledWith(null);
            expect(mocks.setMutants).toHaveBeenCalledWith([]);
            expect(mocks.setSelectedMutant).toHaveBeenCalledWith(null);
            expect(mocks.toastSuccess).toHaveBeenCalledWith(
                "Project deleted successfully",
            );
            expect(mocks.navigate).toHaveBeenCalledWith({to: "/dashboard"});
        });

        it("shows error toast when delete fails", async () => {
            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
            const invalidateQueriesSpy = vi.spyOn(
                queryClient,
                "invalidateQueries",
            );
            const deleteProject = vi.fn().mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                projectsService: {deleteProject} as any,
            });
            const {result} = renderHook(() => useDeleteProject(), {wrapper});

            await act(async () => {
                result.current.mutate(1);
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(setQueryDataSpy).not.toHaveBeenCalled();
            expect(invalidateQueriesSpy).not.toHaveBeenCalled();
            expect(mocks.toastError).toHaveBeenCalledWith(
                "Failed to delete project",
            );
            expect(mocks.navigate).not.toHaveBeenCalled();
        });
    });

    describe("useRenameProject", () => {
        it("updates project names across project/admin/detail caches", async () => {
            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
            const renameProject = vi
                .fn()
                .mockResolvedValue({id: 1, name: "Renamed"});
            const wrapper = createWrapper({
                projectsService: {renameProject} as any,
            });
            const {result} = renderHook(() => useRenameProject(), {wrapper});

            await act(async () => {
                result.current.mutate({projectId: 1, name: "Renamed"});
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(renameProject).toHaveBeenCalledWith(1, {name: "Renamed"});

            const projectsCall = findSetQueryDataCall(
                setQueryDataSpy,
                queryKeys.projects.all,
            );
            expect(projectsCall).toBeDefined();
            const projectsUpdater = projectsCall?.[1] as
                | ((
                      projects: Array<{id: number; name: string}>,
                  ) => Array<{id: number; name: string}>)
                | undefined;
            expect(
                projectsUpdater?.([
                    {id: 1, name: "Old"},
                    {id: 2, name: "Keep"},
                ]),
            ).toEqual([
                {id: 1, name: "Renamed"},
                {id: 2, name: "Keep"},
            ]);

            const adminProjectsCall = findSetQueryDataCall(
                setQueryDataSpy,
                queryKeys.admin.projects,
            );
            expect(adminProjectsCall).toBeDefined();

            const detailCall = findSetQueryDataCall(setQueryDataSpy, [
                queryKeys.projects,
                "1",
            ]);
            expect(detailCall).toBeDefined();
        });

        it("does not patch cache when rename fails", async () => {
            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
            const renameProject = vi.fn().mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                projectsService: {renameProject} as any,
            });
            const {result} = renderHook(() => useRenameProject(), {wrapper});

            await act(async () => {
                result.current.mutate({projectId: 1, name: "Renamed"});
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(setQueryDataSpy).not.toHaveBeenCalled();
        });
    });

    describe("useAddProjectUser", () => {
        it("adds selected admin user from cache to project users and invalidates", async () => {
            queryClient.setQueryData(queryKeys.admin.users, [
                {id: 2, username: "john", isAdmin: false, isActive: true},
            ]);
            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const addUserToProject = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                projectsService: {addUserToProject} as any,
            });
            const {result} = renderHook(() => useAddProjectUser(1), {wrapper});

            await act(async () => {
                result.current.mutate(2);
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(addUserToProject).toHaveBeenCalledWith(1, 2);

            const usersCall = findSetQueryDataCall(
                setQueryDataSpy,
                queryKeys.projects.users(1),
            );
            expect(usersCall).toBeDefined();
            const usersUpdater = usersCall?.[1] as
                | ((
                      users: Array<{id: number; username: string}>,
                  ) => Array<{id: number; username: string}>)
                | undefined;
            expect(usersUpdater?.([])).toEqual([
                {id: 2, username: "john", isAdmin: false, isActive: true},
            ]);

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.projects.users(1),
            });
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.admin.userProjects(2),
            });
        });

        it("does not duplicate user when already assigned", async () => {
            queryClient.setQueryData(queryKeys.admin.users, [
                {id: 2, username: "john", isAdmin: false, isActive: true},
            ]);
            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
            const addUserToProject = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                projectsService: {addUserToProject} as any,
            });
            const {result} = renderHook(() => useAddProjectUser(1), {wrapper});

            await act(async () => {
                result.current.mutate(2);
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const usersCall = findSetQueryDataCall(
                setQueryDataSpy,
                queryKeys.projects.users(1),
            );
            const usersUpdater = usersCall?.[1] as
                | ((
                      users: Array<{id: number; username: string}>,
                  ) => Array<{id: number; username: string}>)
                | undefined;
            expect(usersUpdater?.([{id: 2, username: "john"}])).toEqual([
                {id: 2, username: "john"},
            ]);
        });
    });

    describe("useUploadSourceCode", () => {
        it("uploads source and invalidates mutant source query", async () => {
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const uploadSourceCode = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                projectsService: {uploadSourceCode} as any,
            });
            const {result} = renderHook(() => useUploadSourceCode(), {wrapper});
            const file = new File(["content"], "source.zip");

            await act(async () => {
                result.current.mutate({projectId: 1, file});
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(uploadSourceCode).toHaveBeenCalledWith(1, file);
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: ["mutants", "source"],
            });
        });
    });

    describe("useRemoveProjectUser", () => {
        it("removes user from project cache and invalidates related queries", async () => {
            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const removeUserFromProject = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                projectsService: {removeUserFromProject} as any,
            });
            const {result} = renderHook(() => useRemoveProjectUser(1), {
                wrapper,
            });

            await act(async () => {
                result.current.mutate(2);
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(removeUserFromProject).toHaveBeenCalledWith(1, 2);

            const usersCall = findSetQueryDataCall(
                setQueryDataSpy,
                queryKeys.projects.users(1),
            );
            expect(usersCall).toBeDefined();
            const usersUpdater = usersCall?.[1] as
                | ((
                      users: Array<{id: number; username: string}>,
                  ) => Array<{id: number; username: string}>)
                | undefined;
            expect(
                usersUpdater?.([
                    {id: 2, username: "john"},
                    {id: 3, username: "jane"},
                ]),
            ).toEqual([{id: 3, username: "jane"}]);

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.projects.users(1),
            });
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.admin.userProjects(2),
            });
        });
    });
});
