import {renderHook, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {createWrapper} from "@/test-utils";
import {useAlgorithms} from "../useAlgorithms";

describe("useAlgorithms", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("fetches algorithms when auth token exists", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listAlgorithms = vi
            .fn()
            .mockResolvedValue([{id: "1", name: "algo"}]);
        const wrapper = createWrapper({
            algorithmsService: {listAlgorithms} as any,
        });
        const {result} = renderHook(() => useAlgorithms(), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(listAlgorithms).toHaveBeenCalledTimes(1);
        expect(result.current.data).toEqual([{id: "1", name: "algo"}]);
    });

    it("does not fetch algorithms without auth token", () => {
        const listAlgorithms = vi.fn();
        const wrapper = createWrapper({
            algorithmsService: {listAlgorithms} as any,
        });
        const {result} = renderHook(() => useAlgorithms(), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(listAlgorithms).not.toHaveBeenCalled();
    });

    it("surfaces algorithms query errors", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listAlgorithms = vi.fn().mockRejectedValue(new Error("failed"));
        const wrapper = createWrapper({
            algorithmsService: {listAlgorithms} as any,
        });
        const {result} = renderHook(() => useAlgorithms(), {wrapper});

        await waitFor(
            () => {
                expect(result.current.isError).toBe(true);
            },
            {timeout: 2500},
        );
        expect(listAlgorithms).toHaveBeenCalledTimes(2);
    });
});
