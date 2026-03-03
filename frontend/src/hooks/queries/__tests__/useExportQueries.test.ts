import {describe, expect, it, vi, beforeEach} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useExportPreview} from "../useExportQueries";

describe("useExportPreview", () => {
	beforeEach(() => {
		localStorage.setItem("auth_token", "test-token");
	});

	it("calls exportService.getExportPreview", async () => {
		const getExportPreview = vi.fn().mockResolvedValue({data: []});
		const wrapper = createWrapper({exportService: {getExportPreview} as any});

		const {result} = renderHook(() => useExportPreview(1), {wrapper});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(getExportPreview).toHaveBeenCalledWith(1);
	});
});
