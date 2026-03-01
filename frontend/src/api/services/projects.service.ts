import {apiClient} from "../client";
import {API_ENDPOINTS} from "../endpoints";
import {z} from "zod";

export type CreateProjectRequest = {
    projectName: string;
    file: File;
};

export type RenameProjectRequest = {
    name: string;
};

const CreateProjectResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
});

export type CreateProjectResponse = z.infer<typeof CreateProjectResponseSchema>;

const AdminProjectSchema = z.object({
    id: z.number(),
    name: z.string(),
});

export type AdminProject = z.infer<typeof AdminProjectSchema>;

const AdminProjectsArraySchema = z.array(AdminProjectSchema);
const RenameProjectResponseSchema = AdminProjectSchema;

export type RenameProjectResponse = z.infer<
    typeof RenameProjectResponseSchema
>;

const ProjectUserSchema = z
    .object({
        id: z.number(),
        username: z.string(),
        is_admin: z.boolean(),
        is_active: z.boolean().default(true),
        mutants_reviewed: z.number().nullable().default(null),
    })
    .transform((data) => ({
        id: data.id,
        username: data.username,
        isAdmin: data.is_admin,
        isActive: data.is_active,
        mutantsReviewed: data.mutants_reviewed ?? 0,
    }));

export type ProjectUser = z.infer<typeof ProjectUserSchema>;

const ProjectUsersArraySchema = z.array(ProjectUserSchema);

const FormFieldSchema = z.object({
    id: z.number(),
    label: z.string(),
    type: z.enum([
        "number",
        "text",
        "textarea",
        "select",
        "star-rating",
        "checkbox",
    ]),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
});

const ProjectSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        created_at: z.string(),
        total_mutants: z.number(),
        reviewed_mutants: z.number(),
        current_status: z.string().nullable(),
        formSchema: z.array(FormFieldSchema).optional(),
    })
    .transform((data) => ({
        id: data.id,
        name: data.name,
        createdAt: data.created_at,
        totalMutants: data.total_mutants,
        reviewedMutants: data.reviewed_mutants,
        currentStatus: data.current_status ?? undefined,
        formSchema: data.formSchema ?? undefined,
    }));

export type Project = z.infer<typeof ProjectSchema>;

const ProjectsArraySchema = z.array(ProjectSchema);

const UploadSourceResponseSchema = z.object({detail: z.string()});

export interface ProjectsService {
    createProject(data: CreateProjectRequest): Promise<CreateProjectResponse>;
    listProjects(): Promise<Project[]>;
    deleteProject(projectId: number): Promise<void>;
    renameProject(
        projectId: number,
        data: RenameProjectRequest,
    ): Promise<RenameProjectResponse>;
    listAdminProjects(): Promise<AdminProject[]>;
    listProjectUsers(projectId: number): Promise<ProjectUser[]>;
    addUserToProject(projectId: number, userId: number): Promise<void>;
    removeUserFromProject(projectId: number, userId: number): Promise<void>;
    uploadSourceCode(projectId: number, file: File): Promise<void>;
}

export class ProjectsServiceImpl implements ProjectsService {
    async createProject(
        data: CreateProjectRequest,
    ): Promise<CreateProjectResponse> {
        return apiClient.uploadFile(
            API_ENDPOINTS.ADMIN.CREATE_PROJECT,
            CreateProjectResponseSchema,
            data.file,
            {
                project_name: data.projectName,
            },
        );
    }

    async listProjects(): Promise<Project[]> {
        return apiClient.get(API_ENDPOINTS.PROJECTS.LIST, ProjectsArraySchema);
    }

    async deleteProject(projectId: number): Promise<void> {
        const endpoint = API_ENDPOINTS.ADMIN.DELETE_PROJECT.replace(
            "{id}",
            projectId.toString(),
        );
        return apiClient.delete(endpoint, z.void());
    }

    async renameProject(
        projectId: number,
        data: RenameProjectRequest,
    ): Promise<RenameProjectResponse> {
        const endpoint = API_ENDPOINTS.ADMIN.RENAME_PROJECT.replace(
            "{id}",
            projectId.toString(),
        );
        return apiClient.patch(endpoint, RenameProjectResponseSchema, data);
    }

    async listAdminProjects(): Promise<AdminProject[]> {
        return apiClient.get(
            API_ENDPOINTS.ADMIN.PROJECTS_LIST,
            AdminProjectsArraySchema,
        );
    }

    async listProjectUsers(projectId: number): Promise<ProjectUser[]> {
        const endpoint = API_ENDPOINTS.ADMIN.PROJECT_USERS.LIST.replace(
            "{project_id}",
            projectId.toString(),
        );
        return apiClient.get(endpoint, ProjectUsersArraySchema);
    }

    async addUserToProject(projectId: number, userId: number): Promise<void> {
        const endpoint = API_ENDPOINTS.ADMIN.PROJECT_USERS.ADD.replace(
            "{project_id}",
            projectId.toString(),
        ).replace("{user_id}", userId.toString());
        return apiClient.patch(endpoint, z.void());
    }

    async removeUserFromProject(
        projectId: number,
        userId: number,
    ): Promise<void> {
        const endpoint = API_ENDPOINTS.ADMIN.PROJECT_USERS.REMOVE.replace(
            "{project_id}",
            projectId.toString(),
        ).replace("{user_id}", userId.toString());
        return apiClient.patch(endpoint, z.void());
    }

    async uploadSourceCode(projectId: number, file: File): Promise<void> {
        const endpoint = API_ENDPOINTS.ADMIN.UPLOAD_SOURCE.replace(
            "{project_id}",
            projectId.toString(),
        );
        await apiClient.uploadFile(
            endpoint,
            UploadSourceResponseSchema,
            file,
            undefined,
            "PUT",
        );
    }
}
