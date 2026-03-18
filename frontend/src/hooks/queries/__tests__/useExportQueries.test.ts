import {renderHook, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {createWrapper} from "@/test-utils";
import {useExportPreview} from "../useExportQueries";

describe("useExportPreview", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("fetches export preview when auth token and project id are present", async () => {
        localStorage.setItem("auth_token", "test-token");
        const getExportPreview = vi.fn().mockResolvedValue({data: []});
        const wrapper = createWrapper({
            exportService: {getExportPreview} as any,
        });
        const {result} = renderHook(() => useExportPreview(1), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(getExportPreview).toHaveBeenCalledWith(1);
        expect(result.current.data).toEqual({data: []});
    });

    it("does not fetch when project id is falsy", () => {
        localStorage.setItem("auth_token", "test-token");
        const getExportPreview = vi.fn();
        const wrapper = createWrapper({
            exportService: {getExportPreview} as any,
        });
        const {result} = renderHook(() => useExportPreview(0), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(getExportPreview).not.toHaveBeenCalled();
    });

    it("does not fetch without auth token", () => {
        const getExportPreview = vi.fn();
        const wrapper = createWrapper({
            exportService: {getExportPreview} as any,
        });
        const {result} = renderHook(() => useExportPreview(1), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(getExportPreview).not.toHaveBeenCalled();
    });

    it("surfaces export preview query errors", async () => {
        localStorage.setItem("auth_token", "test-token");
        const getExportPreview = vi.fn().mockRejectedValue(new Error("failed"));
        const wrapper = createWrapper({
            exportService: {getExportPreview} as any,
        });
        const {result} = renderHook(() => useExportPreview(1), {wrapper});

        await waitFor(
            () => {
                expect(result.current.isError).toBe(true);
            },
            {timeout: 2500},
        );
        expect(getExportPreview).toHaveBeenCalledTimes(2);
        expect(getExportPreview).toHaveBeenCalledWith(1);
    });
});
