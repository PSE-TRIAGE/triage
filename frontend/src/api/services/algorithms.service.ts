import {z} from "zod";
import {apiClient} from "../client";
import {API_ENDPOINTS} from "../endpoints";

const AlgorithmInfoSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
});

const AlgorithmListResponseSchema = z.object({
    algorithms: z.array(AlgorithmInfoSchema),
});

const ApplyAlgorithmResponseSchema = z.object({
    success: z.boolean(),
    algorithm_name: z.string(),
    mutants_ranked: z.number(),
    message: z.string(),
});

export type AlgorithmInfo = z.infer<typeof AlgorithmInfoSchema>;
export type ApplyAlgorithmResponse = z.infer<typeof ApplyAlgorithmResponseSchema>;

export interface AlgorithmsService {
    listAlgorithms(): Promise<AlgorithmInfo[]>;
    applyAlgorithm(
        projectId: number,
        algorithmId: string,
    ): Promise<ApplyAlgorithmResponse>;
}

export class AlgorithmsServiceImpl implements AlgorithmsService {
    async listAlgorithms(): Promise<AlgorithmInfo[]> {
        const response = await apiClient.get(
            API_ENDPOINTS.ALGORITHMS.LIST,
            AlgorithmListResponseSchema,
        );
        return response.algorithms;
    }

    async applyAlgorithm(
        projectId: number,
        algorithmId: string,
    ): Promise<ApplyAlgorithmResponse> {
        const endpoint = API_ENDPOINTS.ALGORITHMS.APPLY.replace(
            "{project_id}",
            projectId.toString(),
        );

        return apiClient.post(endpoint, ApplyAlgorithmResponseSchema, {
            algorithm: algorithmId,
        });
    }
}
