import {describe, expect, it, vi, beforeEach} from "vitest";
import {renderHook, waitFor, act} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {
	useCreateProject,
	useDeleteProject,
	useRenameProject,
	useAddProjectUser,
	useUploadSourceCode,
	useRemoveProjectUser,
} from "../useProjectMutations";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
}));

describe("useCreateProject", () => {
	it("calls projectsService.createProject", async () => {
		const createProject = vi.fn().mockResolvedValue({id: 1});
		const wrapper = createWrapper({projectsService: {createProject} as any});

		const {result} = renderHook(() => useCreateProject(), {wrapper});

		await act(async () => {
			result.current.mutate({name: "New Project"});
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(createProject).toHaveBeenCalledWith({name: "New Project"});
	});

	it("handles error", async () => {
		const createProject = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({projectsService: {createProject} as any});

		const {result} = renderHook(() => useCreateProject(), {wrapper});

		await act(async () => {
			result.current.mutate({name: "New Project"});
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useDeleteProject", () => {
	it("calls projectsService.deleteProject", async () => {
		const deleteProject = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({projectsService: {deleteProject} as any});

		const {result} = renderHook(() => useDeleteProject(), {wrapper});

		await act(async () => {
			result.current.mutate(1);
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(deleteProject).toHaveBeenCalledWith(1);
	});

	it("handles error", async () => {
		const deleteProject = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({projectsService: {deleteProject} as any});

		const {result} = renderHook(() => useDeleteProject(), {wrapper});

		await act(async () => {
			result.current.mutate(1);
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useRenameProject", () => {
	it("calls projectsService.renameProject", async () => {
		const renameProject = vi.fn().mockResolvedValue({id: 1, name: "Renamed"});
		const wrapper = createWrapper({projectsService: {renameProject} as any});

		const {result} = renderHook(() => useRenameProject(), {wrapper});

		await act(async () => {
			result.current.mutate({projectId: 1, name: "Renamed"});
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(renameProject).toHaveBeenCalledWith(1, {name: "Renamed"});
	});

	it("handles error", async () => {
		const renameProject = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({projectsService: {renameProject} as any});

		const {result} = renderHook(() => useRenameProject(), {wrapper});

		await act(async () => {
			result.current.mutate({projectId: 1, name: "Renamed"});
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useAddProjectUser", () => {
	it("calls projectsService.addUserToProject", async () => {
		const addUserToProject = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({projectsService: {addUserToProject} as any});

		const {result} = renderHook(() => useAddProjectUser(1), {wrapper});

		await act(async () => {
			result.current.mutate(2);
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(addUserToProject).toHaveBeenCalledWith(1, 2);
	});

	it("handles error", async () => {
		const addUserToProject = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({projectsService: {addUserToProject} as any});

		const {result} = renderHook(() => useAddProjectUser(1), {wrapper});

		await act(async () => {
			result.current.mutate(2);
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useUploadSourceCode", () => {
	it("calls projectsService.uploadSourceCode", async () => {
		const uploadSourceCode = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({projectsService: {uploadSourceCode} as any});

		const {result} = renderHook(() => useUploadSourceCode(), {wrapper});
		const file = new File(["content"], "test.zip");

		await act(async () => {
			result.current.mutate({projectId: 1, file});
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(uploadSourceCode).toHaveBeenCalledWith(1, file);
	});

	it("handles error", async () => {
		const uploadSourceCode = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({projectsService: {uploadSourceCode} as any});

		const {result} = renderHook(() => useUploadSourceCode(), {wrapper});

		await act(async () => {
			result.current.mutate({projectId: 1, file: new File([""], "test.zip")});
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useRemoveProjectUser", () => {
	it("calls projectsService.removeUserFromProject", async () => {
		const removeUserFromProject = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({projectsService: {removeUserFromProject} as any});

		const {result} = renderHook(() => useRemoveProjectUser(1), {wrapper});

		await act(async () => {
			result.current.mutate(2);
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(removeUserFromProject).toHaveBeenCalledWith(1, 2);
	});

	it("handles error", async () => {
		const removeUserFromProject = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({projectsService: {removeUserFromProject} as any});

		const {result} = renderHook(() => useRemoveProjectUser(1), {wrapper});

		await act(async () => {
			result.current.mutate(2);
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});
