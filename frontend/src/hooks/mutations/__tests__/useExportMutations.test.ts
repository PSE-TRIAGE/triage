import {act, renderHook, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {createWrapper} from "@/test-utils";
import {useExportDownload} from "../useExportMutations";

describe("useExportDownload", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    it("calls exportService.downloadExport with project and filename", async () => {
        const downloadExport = vi.fn().mockResolvedValue(new Blob(["data"]));
        const wrapper = createWrapper({exportService: {downloadExport} as any});
        const {result} = renderHook(() => useExportDownload(), {wrapper});

        await act(async () => {
            result.current.mutate({projectId: 1, filename: "export.csv"});
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(downloadExport).toHaveBeenCalledWith(1, "export.csv");
    });

    it("surfaces mutation error when download fails", async () => {
        const downloadExport = vi.fn().mockRejectedValue(new Error("fail"));
        const wrapper = createWrapper({exportService: {downloadExport} as any});
        const {result} = renderHook(() => useExportDownload(), {wrapper});

        await act(async () => {
            result.current.mutate({projectId: 1, filename: "export.csv"});
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
