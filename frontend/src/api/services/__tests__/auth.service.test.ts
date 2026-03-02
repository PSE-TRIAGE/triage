import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthServiceImpl } from "../auth.service";

vi.mock("@/api/client", () => ({
	apiClient: {
		post: vi.fn(),
		get: vi.fn(),
	},
}));

describe("AuthServiceImpl", () => {
	let service: AuthServiceImpl;

	beforeEach(() => {
		service = new AuthServiceImpl();
		vi.clearAllMocks();
	});

	it("login calls post with credentials", async () => {
		const { apiClient } = await import("@/api/client");
		(apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({ token: "abc123" });

		const result = await service.login({ username: "user", password: "pass" });
		expect(apiClient.post).toHaveBeenCalledWith("/login", expect.any(Object), { username: "user", password: "pass" });
		expect(result).toEqual({ token: "abc123" });
	});

	it("logout calls post", async () => {
		const { apiClient } = await import("@/api/client");
		(apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

		await service.logout();
		expect(apiClient.post).toHaveBeenCalledWith("/user/logout", expect.any(Object));
	});

	it("me calls get", async () => {
		const { apiClient } = await import("@/api/client");
		(apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
			id: "1",
			username: "admin",
			isAdmin: true,
			isActive: true,
		});

		const result = await service.me();
		expect(apiClient.get).toHaveBeenCalledWith("/user", expect.any(Object));
		expect(result.username).toBe("admin");
	});
});
