import {z} from "zod";
import {apiClient} from "../client";
import {API_ENDPOINTS} from "../endpoints";

const ExportPreviewStatsSchema = z.object({
    total_mutants: z.number(),
    total_ratings: z.number(),
    unique_reviewers: z.number(),
    mutants_with_ratings: z.number(),
    completion_percentage: z.number(),
});

const ExportFormFieldValueSchema = z.object({
    field_label: z.string(),
    field_type: z.string(),
    value: z.string(),
});

const ExportRatingEntrySchema = z.object({
    mutant_id: z.number(),
    source_file: z.string(),
    mutated_class: z.string(),
    mutated_method: z.string(),
    line_number: z.number(),
    mutator: z.string(),
    status: z.string(),
    description: z.string(),
    reviewer_username: z.string(),
    field_values: z.array(ExportFormFieldValueSchema),
});

const ExportPreviewResponseSchema = z.object({
    project_id: z.number(),
    project_name: z.string(),
    stats: ExportPreviewStatsSchema,
    sample_entries: z.array(ExportRatingEntrySchema),
});

const ExportDataResponseSchema = z.object({
    project_id: z.number(),
    project_name: z.string(),
    exported_at: z.string(),
    stats: ExportPreviewStatsSchema,
    ratings: z.array(ExportRatingEntrySchema),
});

export type ExportPreviewStats = z.infer<typeof ExportPreviewStatsSchema>;
export type ExportFormFieldValue = z.infer<typeof ExportFormFieldValueSchema>;
export type ExportRatingEntry = z.infer<typeof ExportRatingEntrySchema>;
export type ExportPreviewResponse = z.infer<typeof ExportPreviewResponseSchema>;
export type ExportDataResponse = z.infer<typeof ExportDataResponseSchema>;

export interface ExportService {
    getExportPreview(projectId: number): Promise<ExportPreviewResponse>;
    downloadExport(projectId: number, filename: string): Promise<void>;
    getExportData(projectId: number): Promise<ExportDataResponse>;
}

export class ExportServiceImpl implements ExportService {
    async getExportPreview(projectId: number): Promise<ExportPreviewResponse> {
        const endpoint = API_ENDPOINTS.ADMIN.EXPORT.PREVIEW.replace(
            "{project_id}",
            projectId.toString(),
        );
        return apiClient.get(endpoint, ExportPreviewResponseSchema);
    }

    async downloadExport(projectId: number, filename: string): Promise<void> {
        const endpoint = API_ENDPOINTS.ADMIN.EXPORT.DOWNLOAD.replace(
            "{project_id}",
            projectId.toString(),
        );
        return apiClient.downloadFileWithName(endpoint, filename);
    }

    async getExportData(projectId: number): Promise<ExportDataResponse> {
        const endpoint = API_ENDPOINTS.ADMIN.EXPORT.DOWNLOAD.replace(
            "{project_id}",
            projectId.toString(),
        );
        return apiClient.get(endpoint, ExportDataResponseSchema);
    }
}
