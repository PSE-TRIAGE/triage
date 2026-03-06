import {act, renderHook, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {createWrapper} from "@/test-utils";
import {queryClient, queryKeys} from "@/lib/queryClient";
import {useSubmitRating} from "../useRatingMutations";

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

describe("useSubmitRating", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
        queryClient.clear();
    });

    it("submits rating and invalidates mutant/project/rating queries", async () => {
        const invalidateQueriesSpy = vi
            .spyOn(queryClient, "invalidateQueries")
            .mockResolvedValue(undefined);
        const submitRating = vi.fn().mockResolvedValue(undefined);
        const wrapper = createWrapper({ratingsService: {submitRating} as any});
        const {result} = renderHook(() => useSubmitRating(1), {wrapper});

        await act(async () => {
            result.current.mutate({
                mutantId: 1,
                data: {field_values: []},
            });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(submitRating).toHaveBeenCalledWith(1, {field_values: []});
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: queryKeys.ratings.byMutant(1),
        });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: queryKeys.mutants.byProject(1),
        });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: queryKeys.projects.all,
        });
        expect(mocks.toastSuccess).toHaveBeenCalledWith(
            "Rating submitted successfully",
        );
    });

    it("shows error toast when submit fails", async () => {
        const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
        const submitRating = vi.fn().mockRejectedValue(new Error("fail"));
        const wrapper = createWrapper({ratingsService: {submitRating} as any});
        const {result} = renderHook(() => useSubmitRating(1), {wrapper});

        await act(async () => {
            result.current.mutate({
                mutantId: 1,
                data: {field_values: []},
            });
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(invalidateQueriesSpy).not.toHaveBeenCalled();
        expect(mocks.toastError).toHaveBeenCalledWith(
            "Failed to submit rating",
        );
    });
});
