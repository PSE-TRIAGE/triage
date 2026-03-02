import {beforeEach, describe, expect, it, vi} from "vitest";
import {UserServiceImpl} from "../user.service";

vi.mock("@/api/client", () => ({
    apiClient: {
        patch: vi.fn(),
    },
}));

describe("UserServiceImpl", () => {
    let service: UserServiceImpl;

    beforeEach(() => {
        service = new UserServiceImpl();
        vi.clearAllMocks();
    });

    it("changeUsername calls patch", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "1",
            username: "new",
            isAdmin: false,
            isActive: true,
        });
        const result = await service.changeUsername({new_username: "new"});
        expect(apiClient.patch).toHaveBeenCalledWith(
            "/user/username",
            expect.any(Object),
            {new_username: "new"},
        );
        expect(result.username).toBe("new");
    });

    it("changePassword calls patch", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue(
            undefined,
        );
        await service.changePassword({
            current_password: "old",
            new_password: "new123",
        });
        expect(apiClient.patch).toHaveBeenCalledWith(
            "/user/password",
            expect.any(Object),
            {current_password: "old", new_password: "new123"},
        );
    });

    it("deactivateAccount calls patch", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue(
            undefined,
        );
        await service.deactivateAccount();
        expect(apiClient.patch).toHaveBeenCalledWith(
            "/user/disable",
            expect.any(Object),
        );
    });
});
