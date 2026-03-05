import {beforeEach, describe, expect, it, vi} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useRating} from "../useRatingQueries";

describe("useRating", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("fetches rating for mutant id when auth token exists", async () => {
        localStorage.setItem("auth_token", "test-token");
        const getRating = vi.fn().mockResolvedValue({id: 1, fieldValues: []});
        const wrapper = createWrapper({ratingsService: {getRating} as any});
        const {result} = renderHook(() => useRating(1), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(getRating).toHaveBeenCalledWith(1);
        expect(result.current.data).toEqual({id: 1, fieldValues: []});
    });

    it("does not fetch when mutant id is undefined", () => {
        localStorage.setItem("auth_token", "test-token");
        const getRating = vi.fn();
        const wrapper = createWrapper({ratingsService: {getRating} as any});
        const {result} = renderHook(() => useRating(undefined), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(getRating).not.toHaveBeenCalled();
    });

    it("does not fetch when auth token is missing", () => {
        const getRating = vi.fn();
        const wrapper = createWrapper({ratingsService: {getRating} as any});
        const {result} = renderHook(() => useRating(1), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(getRating).not.toHaveBeenCalled();
    });

    it("surfaces rating query errors", async () => {
        localStorage.setItem("auth_token", "test-token");
        const getRating = vi.fn().mockRejectedValue(new Error("failed"));
        const wrapper = createWrapper({ratingsService: {getRating} as any});
        const {result} = renderHook(() => useRating(1), {wrapper});

        await waitFor(
            () => {
                expect(result.current.isError).toBe(true);
            },
            {timeout: 2500},
        );
        expect(getRating).toHaveBeenCalledTimes(2);
        expect(getRating).toHaveBeenCalledWith(1);
    });
});
