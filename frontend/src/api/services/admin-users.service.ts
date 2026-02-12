import {z} from "zod";
import {apiClient} from "../client";
import {API_ENDPOINTS} from "../endpoints";

const AdminUserSchema = z
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

export type AdminUser = z.infer<typeof AdminUserSchema>;

const AdminUsersArraySchema = z.array(AdminUserSchema);

export type CreateUserRequest = {
    username: string;
    password: string;
};

const UserProjectSchema = z.object({
    id: z.number(),
    name: z.string(),
});

export type UserProject = z.infer<typeof UserProjectSchema>;

const UserProjectsArraySchema = z.array(UserProjectSchema);

export interface AdminUsersService {
    listUsers(): Promise<AdminUser[]>;
    createUser(data: CreateUserRequest): Promise<void>;
    deleteUser(userId: number): Promise<void>;
    disableUser(userId: number): Promise<void>;
    enableUser(userId: number): Promise<void>;
    promoteUser(userId: number): Promise<void>;
    demoteUser(userId: number): Promise<void>;
    listUserProjects(userId: number): Promise<UserProject[]>;
}

export class AdminUsersServiceImpl implements AdminUsersService {
    async listUsers(): Promise<AdminUser[]> {
        return apiClient.get(
            API_ENDPOINTS.ADMIN.USERS.LIST,
            AdminUsersArraySchema,
        );
    }

    async createUser(data: CreateUserRequest): Promise<void> {
        return apiClient.post(API_ENDPOINTS.ADMIN.USERS.CREATE, z.void(), data);
    }

    async deleteUser(userId: number): Promise<void> {
        const endpoint = API_ENDPOINTS.ADMIN.USERS.DELETE.replace(
            "{user_id}",
            userId.toString(),
        );
        return apiClient.delete(endpoint, z.void());
    }

    async disableUser(userId: number): Promise<void> {
        const endpoint = API_ENDPOINTS.ADMIN.USERS.DISABLE.replace(
            "{user_id}",
            userId.toString(),
        );
        return apiClient.patch(endpoint, z.void());
    }

    async enableUser(userId: number): Promise<void> {
        const endpoint = API_ENDPOINTS.ADMIN.USERS.ENABLE.replace(
            "{user_id}",
            userId.toString(),
        );
        return apiClient.patch(endpoint, z.void());
    }

    async promoteUser(userId: number): Promise<void> {
        const endpoint = API_ENDPOINTS.ADMIN.USERS.PROMOTE.replace(
            "{user_id}",
            userId.toString(),
        );
        return apiClient.patch(endpoint, z.void());
    }

    async demoteUser(userId: number): Promise<void> {
        const endpoint = API_ENDPOINTS.ADMIN.USERS.DEMOTE.replace(
            "{user_id}",
            userId.toString(),
        );
        return apiClient.patch(endpoint, z.void());
    }

    async listUserProjects(userId: number): Promise<UserProject[]> {
        const endpoint = API_ENDPOINTS.ADMIN.USERS.PROJECTS.replace(
            "{user_id}",
            userId.toString(),
        );
        return apiClient.get(endpoint, UserProjectsArraySchema);
    }
}
