import {act, renderHook, waitFor} from "@testing-library/react";
import {QueryClient} from "@tanstack/react-query";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {createWrapper} from "@/test-utils";
import {queryKeys} from "@/lib/queryClient";
import {useApplyAlgorithm} from "../useApplyAlgorithm";

describe("useApplyAlgorithm", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    it("calls algorithmsService.applyAlgorithm and invalidates mutant list", async () => {
        const invalidateQueriesSpy = vi
            .spyOn(QueryClient.prototype, "invalidateQueries")
            .mockResolvedValue(undefined);
        const applyAlgorithm = vi.fn().mockResolvedValue(undefined);
        const wrapper = createWrapper({
            algorithmsService: {applyAlgorithm} as any,
        });
        const {result} = renderHook(() => useApplyAlgorithm(1), {wrapper});

        await act(async () => {
            result.current.mutate("algo1");
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(applyAlgorithm).toHaveBeenCalledWith(1, "algo1");
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: queryKeys.mutants.byProject(1),
        });
    });

    it("surfaces mutation error when apply algorithm fails", async () => {
        const invalidateQueriesSpy = vi.spyOn(
            QueryClient.prototype,
            "invalidateQueries",
        );
        const applyAlgorithm = vi.fn().mockRejectedValue(new Error("fail"));
        const wrapper = createWrapper({
            algorithmsService: {applyAlgorithm} as any,
        });
        const {result} = renderHook(() => useApplyAlgorithm(1), {wrapper});

        await act(async () => {
            result.current.mutate("algo1");
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    });
});
