import {beforeEach, describe, expect, it, vi} from "vitest";
import {ProjectsServiceImpl} from "../projects.service";

vi.mock("@/api/client", () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        uploadFile: vi.fn(),
    },
}));

describe("ProjectsServiceImpl", () => {
    let service: ProjectsServiceImpl;

    beforeEach(() => {
        service = new ProjectsServiceImpl();
        vi.clearAllMocks();
    });

    it("listProjects calls get", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        const result = await service.listProjects();
        expect(apiClient.get).toHaveBeenCalledWith(
            "/projects",
            expect.any(Object),
        );
        expect(result).toEqual([]);
    });

    it("deleteProject calls delete with correct endpoint", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.delete as ReturnType<typeof vi.fn>).mockResolvedValue(
            undefined,
        );
        await service.deleteProject(42);
        expect(apiClient.delete).toHaveBeenCalledWith(
            "/admin/projects/42",
            expect.any(Object),
        );
    });

    it("renameProject calls patch with correct endpoint", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: 1,
            name: "New Name",
        });
        const result = await service.renameProject(1, {name: "New Name"});
        expect(apiClient.patch).toHaveBeenCalledWith(
            "/admin/projects/1/name",
            expect.any(Object),
            {name: "New Name"},
        );
        expect(result.name).toBe("New Name");
    });

    it("listAdminProjects calls get", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        await service.listAdminProjects();
        expect(apiClient.get).toHaveBeenCalledWith(
            "/admin/projects",
            expect.any(Object),
        );
    });

    it("listProjectUsers calls get with project id", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        await service.listProjectUsers(5);
        expect(apiClient.get).toHaveBeenCalledWith(
            "/admin/projects/5/users",
            expect.any(Object),
        );
    });

    it("addUserToProject calls patch", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue(
            undefined,
        );
        await service.addUserToProject(5, 3);
        expect(apiClient.patch).toHaveBeenCalledWith(
            "/admin/projects/5/users/add/3",
            expect.any(Object),
        );
    });

    it("removeUserFromProject calls patch", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue(
            undefined,
        );
        await service.removeUserFromProject(5, 3);
        expect(apiClient.patch).toHaveBeenCalledWith(
            "/admin/projects/5/users/remove/3",
            expect.any(Object),
        );
    });

    it("createProject calls uploadFile", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.uploadFile as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: 1,
            name: "Test",
        });
        const file = new File(["content"], "test.xml");
        const result = await service.createProject({projectName: "Test", file});
        expect(apiClient.uploadFile).toHaveBeenCalledWith(
            "/admin/projects/",
            expect.any(Object),
            file,
            {project_name: "Test"},
        );
        expect(result.name).toBe("Test");
    });

    it("uploadSourceCode calls uploadFile with PUT", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.uploadFile as ReturnType<typeof vi.fn>).mockResolvedValue({
            detail: "ok",
        });
        const file = new File(["content"], "source.zip");
        await service.uploadSourceCode(7, file);
        expect(apiClient.uploadFile).toHaveBeenCalledWith(
            "/admin/project/7/source",
            expect.any(Object),
            file,
            undefined,
            "PUT",
        );
    });
});
