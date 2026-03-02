import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExportServiceImpl } from "../export.service";

vi.mock("@/api/client", () => ({
	apiClient: {
		get: vi.fn(),
		downloadFileWithName: vi.fn(),
	},
}));

describe("ExportServiceImpl", () => {
	let service: ExportServiceImpl;

	beforeEach(() => {
		service = new ExportServiceImpl();
		vi.clearAllMocks();
	});

	it("getExportPreview calls get with project id", async () => {
		const { apiClient } = await import("@/api/client");
		(apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ project_id: 1, project_name: "Test", stats: {}, sample_entries: [] });
		await service.getExportPreview(1);
		expect(apiClient.get).toHaveBeenCalledWith("/admin/projects/1/export/preview", expect.any(Object));
	});

	it("downloadExport calls downloadFileWithName", async () => {
		const { apiClient } = await import("@/api/client");
		(apiClient.downloadFileWithName as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
		await service.downloadExport(1, "export.json");
		expect(apiClient.downloadFileWithName).toHaveBeenCalledWith("/admin/projects/1/export", "export.json");
	});

	it("getExportData calls get", async () => {
		const { apiClient } = await import("@/api/client");
		(apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ project_id: 1, project_name: "Test", exported_at: "2024-01-01", stats: {}, ratings: [] });
		await service.getExportData(1);
		expect(apiClient.get).toHaveBeenCalledWith("/admin/projects/1/export", expect.any(Object));
	});
});
