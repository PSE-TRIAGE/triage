import {beforeEach, describe, expect, it, vi} from "vitest";
import {RatingsServiceImpl} from "../ratings.service";

vi.mock("@/api/client", () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe("RatingsServiceImpl", () => {
    let service: RatingsServiceImpl;

    beforeEach(() => {
        service = new RatingsServiceImpl();
        vi.clearAllMocks();
    });

    it("getRating calls get with mutant id", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const result = await service.getRating(10);
        expect(apiClient.get).toHaveBeenCalledWith(
            "/mutants/10/ratings",
            expect.any(Object),
        );
        expect(result).toBeNull();
    });

    it("submitRating calls post with mutant id and data", async () => {
        const {apiClient} = await import("@/api/client");
        const ratingData = {id: 1, mutantId: 10, userId: 1, fieldValues: []};
        (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(
            ratingData,
        );
        const result = await service.submitRating(10, {field_values: []});
        expect(apiClient.post).toHaveBeenCalledWith(
            "/mutants/10/ratings",
            expect.any(Object),
            {field_values: []},
        );
        expect(result.mutantId).toBe(10);
    });
});
