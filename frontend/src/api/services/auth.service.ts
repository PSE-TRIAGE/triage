import {apiClient} from "../client";
import {API_ENDPOINTS} from "../endpoints";
import {z} from "zod";

export type LoginCredentials = {
    username: string;
    password: string;
};

export const UserSchema = z
    .object({
        id: z.number(),
        username: z.string(),
        is_admin: z.boolean(),
        is_active: z.boolean().default(true),
    })
    .transform((data) => ({
        id: data.id.toString(),
        username: data.username,
        isAdmin: data.is_admin,
        isActive: data.is_active,
    }));

export type User = z.infer<typeof UserSchema>;

const LoginResponseSchema = z
    .object({
        token: z.string(),
    })
    .transform((data) => ({
        token: data.token,
    }));

type LoginResponse = z.infer<typeof LoginResponseSchema>;

export interface AuthService {
    login(credentials: LoginCredentials): Promise<LoginResponse>;
    logout(): Promise<void>;
    me(): Promise<User>;
}

export class AuthServiceImpl implements AuthService {
    async login(credentials: LoginCredentials) {
        return apiClient.post(
            API_ENDPOINTS.AUTH.LOGIN,
            LoginResponseSchema,
            credentials,
        );
    }

    async logout(): Promise<void> {
        return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, z.void());
    }

    async me(): Promise<User> {
        return apiClient.get(API_ENDPOINTS.AUTH.ME, UserSchema);
    }
}
