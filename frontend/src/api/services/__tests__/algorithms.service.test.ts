import {beforeEach, describe, expect, it, vi} from "vitest";
import {AlgorithmsServiceImpl} from "../algorithms.service";

vi.mock("@/api/client", () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe("AlgorithmsServiceImpl", () => {
    let service: AlgorithmsServiceImpl;

    beforeEach(() => {
        service = new AlgorithmsServiceImpl();
        vi.clearAllMocks();
    });

    it("listAlgorithms calls get and extracts algorithms", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
            algorithms: [
                {id: "algo1", name: "Algorithm 1", description: "Test"},
            ],
        });
        const result = await service.listAlgorithms();
        expect(apiClient.get).toHaveBeenCalledWith(
            "/algorithms",
            expect.any(Object),
        );
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("algo1");
    });

    it("applyAlgorithm calls post with correct endpoint and data", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
            success: true,
            algorithm_name: "algo1",
            mutants_ranked: 10,
            message: "Done",
        });
        const result = await service.applyAlgorithm(5, "algo1");
        expect(apiClient.post).toHaveBeenCalledWith(
            "/projects/5/algorithm",
            expect.any(Object),
            {algorithm: "algo1"},
        );
        expect(result.success).toBe(true);
        expect(result.mutants_ranked).toBe(10);
    });
});
