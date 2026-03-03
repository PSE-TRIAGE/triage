import {describe, expect, it, vi} from "vitest";
import {renderHook, waitFor, act} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useApplyAlgorithm} from "../useApplyAlgorithm";

describe("useApplyAlgorithm", () => {
	it("calls algorithmsService.applyAlgorithm", async () => {
		const applyAlgorithm = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({algorithmsService: {applyAlgorithm} as any});

		const {result} = renderHook(() => useApplyAlgorithm(1), {wrapper});

		await act(async () => {
			result.current.mutate("algo1");
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(applyAlgorithm).toHaveBeenCalledWith(1, "algo1");
	});
});
