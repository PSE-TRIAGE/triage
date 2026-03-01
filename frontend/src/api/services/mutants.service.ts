import {apiClient} from "../client";
import {API_ENDPOINTS} from "../endpoints";
import {z} from "zod";

const MutantOverviewSchema = z
    .object({
        id: z.number(),
        detected: z.boolean(),
        status: z.enum([
            "KILLED",
            "SURVIVED",
            "NO_COVERAGE",
            "NON_VIABLE",
            "TIMED_OUT",
            "MEMORY_ERROR",
            "RUN_ERROR",
        ]),
        sourceFile: z.string(),
        lineNumber: z.number(),
        mutator: z.string(),
        ranking: z.number(),
        rated: z.boolean(),
    })
    .transform((data) => ({
        id: data.id,
        detected: data.detected,
        status: data.status,
        sourceFile: data.sourceFile,
        lineNumber: data.lineNumber,
        mutator: data.mutator,
        ranking: data.ranking,
        rated: data.rated,
    }));

export type MutantOverview = z.infer<typeof MutantOverviewSchema>;

const MutantOverviewArraySchema = z.array(MutantOverviewSchema);

const AdditionalFieldsSchema = z
    .union([z.string(), z.record(z.string(), z.string())])
    .nullable()
    .transform((value) => {
        if (!value) return null;
        if (typeof value === "string") return value;
        return JSON.stringify(value);
    });

const MutantDetailSchema = z
    .object({
        id: z.number(),
        project_id: z.number(),
        detected: z.boolean(),
        status: z.enum([
            "KILLED",
            "SURVIVED",
            "NO_COVERAGE",
            "NON_VIABLE",
            "TIMED_OUT",
            "MEMORY_ERROR",
            "RUN_ERROR",
        ]),
        numberOfTestsRun: z.number(),
        sourceFile: z.string(),
        mutatedClass: z.string(),
        mutatedMethod: z.string(),
        methodDescription: z.string(),
        lineNumber: z.number(),
        mutator: z.string(),
        killingTest: z.string().nullable(),
        description: z.string(),
        ranking: z.number(),
        additionalFields: AdditionalFieldsSchema,
    })
    .transform((data) => ({
        id: data.id,
        projectId: data.project_id,
        detected: data.detected,
        status: data.status,
        numberOfTestsRun: data.numberOfTestsRun,
        sourceFile: data.sourceFile,
        mutatedClass: data.mutatedClass,
        mutatedMethod: data.mutatedMethod,
        methodDescription: data.methodDescription,
        lineNumber: data.lineNumber,
        mutator: data.mutator,
        killingTest: data.killingTest,
        description: data.description,
        ranking: data.ranking,
        additionalFields: data.additionalFields,
    }));

export type MutantDetail = z.infer<typeof MutantDetailSchema>;

const SourceCodeSchema = z
    .object({
        project_id: z.number(),
        fully_qualified_name: z.string(),
        content: z.string().nullable(),
        found: z.boolean(),
    })
    .transform((data) => ({
        projectId: data.project_id,
        fullyQualifiedName: data.fully_qualified_name,
        content: data.content,
        found: data.found,
    }));

export type SourceCode = z.infer<typeof SourceCodeSchema>;

export interface MutantsService {
    listProjectMutants(projectId: number): Promise<MutantOverview[]>;
    getMutant(mutantId: number): Promise<MutantDetail>;
    getMutantSourceCode(mutantId: number): Promise<SourceCode>;
}

export class MutantsServiceImpl implements MutantsService {
    async listProjectMutants(projectId: number): Promise<MutantOverview[]> {
        const endpoint = API_ENDPOINTS.MUTANTS.BY_PROJECT.replace(
            "{project_id}",
            projectId.toString(),
        );
        return apiClient.get(endpoint, MutantOverviewArraySchema);
    }

    async getMutant(mutantId: number): Promise<MutantDetail> {
        const endpoint = API_ENDPOINTS.MUTANTS.BY_ID.replace(
            "{mutant_id}",
            mutantId.toString(),
        );
        return apiClient.get(endpoint, MutantDetailSchema);
    }

    async getMutantSourceCode(mutantId: number): Promise<SourceCode> {
        const endpoint = API_ENDPOINTS.MUTANTS.SOURCE.replace(
            "{mutant_id}",
            mutantId.toString(),
        );
        return apiClient.get(endpoint, SourceCodeSchema);
    }
}
