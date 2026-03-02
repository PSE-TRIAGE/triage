import {beforeEach, describe, expect, it, vi} from "vitest";
import {AdminUsersServiceImpl} from "../admin-users.service";

vi.mock("@/api/client", () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("AdminUsersServiceImpl", () => {
    let service: AdminUsersServiceImpl;

    beforeEach(() => {
        service = new AdminUsersServiceImpl();
        vi.clearAllMocks();
    });

    it("listUsers calls get", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        await service.listUsers();
        expect(apiClient.get).toHaveBeenCalledWith(
            "/admin/users",
            expect.any(Object),
        );
    });

    it("createUser calls post", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(
            undefined,
        );
        await service.createUser({username: "test", password: "pass"});
        expect(apiClient.post).toHaveBeenCalledWith(
            "/admin/users",
            expect.any(Object),
            {username: "test", password: "pass"},
        );
    });

    it("deleteUser calls delete with user id", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.delete as ReturnType<typeof vi.fn>).mockResolvedValue(
            undefined,
        );
        await service.deleteUser(5);
        expect(apiClient.delete).toHaveBeenCalledWith(
            "/admin/users/5",
            expect.any(Object),
        );
    });

    it("disableUser calls patch", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue(
            undefined,
        );
        await service.disableUser(3);
        expect(apiClient.patch).toHaveBeenCalledWith(
            "/admin/users/3/disable",
            expect.any(Object),
        );
    });

    it("enableUser calls patch", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue(
            undefined,
        );
        await service.enableUser(3);
        expect(apiClient.patch).toHaveBeenCalledWith(
            "/admin/users/3/enable",
            expect.any(Object),
        );
    });

    it("promoteUser calls patch", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue(
            undefined,
        );
        await service.promoteUser(2);
        expect(apiClient.patch).toHaveBeenCalledWith(
            "/admin/users/promote/2",
            expect.any(Object),
        );
    });

    it("demoteUser calls patch", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue(
            undefined,
        );
        await service.demoteUser(2);
        expect(apiClient.patch).toHaveBeenCalledWith(
            "/admin/users/demote/2",
            expect.any(Object),
        );
    });

    it("listUserProjects calls get", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        await service.listUserProjects(4);
        expect(apiClient.get).toHaveBeenCalledWith(
            "/admin/users/4/projects",
            expect.any(Object),
        );
    });
});
