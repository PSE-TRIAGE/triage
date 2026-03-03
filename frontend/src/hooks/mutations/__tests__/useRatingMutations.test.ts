import {describe, expect, it, vi} from "vitest";
import {renderHook, waitFor, act} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useSubmitRating} from "../useRatingMutations";

describe("useSubmitRating", () => {
	it("calls ratingsService.submitRating", async () => {
		const submitRating = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({ratingsService: {submitRating} as any});

		const {result} = renderHook(() => useSubmitRating(1), {wrapper});

		await act(async () => {
			result.current.mutate({mutantId: 1, data: {values: []}});
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(submitRating).toHaveBeenCalledWith(1, {values: []});
	});

	it("handles error", async () => {
		const submitRating = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({ratingsService: {submitRating} as any});

		const {result} = renderHook(() => useSubmitRating(1), {wrapper});

		await act(async () => {
			result.current.mutate({mutantId: 1, data: {values: []}});
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});
