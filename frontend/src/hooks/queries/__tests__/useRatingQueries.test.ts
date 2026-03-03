import {describe, expect, it, vi, beforeEach} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useRating} from "../useRatingQueries";

describe("useRating", () => {
	beforeEach(() => {
		localStorage.setItem("auth_token", "test-token");
	});

	it("calls ratingsService.getRating", async () => {
		const getRating = vi.fn().mockResolvedValue({id: 1, values: []});
		const wrapper = createWrapper({ratingsService: {getRating} as any});

		const {result} = renderHook(() => useRating(1), {wrapper});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(getRating).toHaveBeenCalledWith(1);
	});

	it("does not fetch when mutantId is undefined", () => {
		const getRating = vi.fn();
		const wrapper = createWrapper({ratingsService: {getRating} as any});

		const {result} = renderHook(() => useRating(undefined), {wrapper});
		expect(result.current.fetchStatus).toBe("idle");
	});
});
