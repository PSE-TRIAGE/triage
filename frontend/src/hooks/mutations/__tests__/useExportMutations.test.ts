import {describe, expect, it, vi} from "vitest";
import {renderHook, waitFor, act} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useExportDownload} from "../useExportMutations";

describe("useExportDownload", () => {
	it("calls exportService.downloadExport", async () => {
		const downloadExport = vi.fn().mockResolvedValue(new Blob(["data"]));
		const wrapper = createWrapper({exportService: {downloadExport} as any});

		const {result} = renderHook(() => useExportDownload(), {wrapper});

		await act(async () => {
			result.current.mutate({projectId: 1, filename: "export.csv"});
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(downloadExport).toHaveBeenCalledWith(1, "export.csv");
	});
});
