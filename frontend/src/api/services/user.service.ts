import z from "zod";
import {apiClient} from "../client";
import {API_ENDPOINTS} from "../endpoints";
import {UserSchema, type User} from "./auth.service";

export type ChangeUsernameRequest = {
    new_username: string;
};

export type ChangePasswordRequest = {
    current_password: string;
    new_password: string;
};

export interface UserService {
    changeUsername(data: ChangeUsernameRequest): Promise<User>;
    changePassword(data: ChangePasswordRequest): Promise<void>;
    deactivateAccount(): Promise<void>;
}

export class UserServiceImpl implements UserService {
    async changeUsername(data: ChangeUsernameRequest): Promise<User> {
        return apiClient.patch(
            API_ENDPOINTS.USER.UPDATE_USERNAME,
            UserSchema,
            data,
        );
    }

    async changePassword(data: ChangePasswordRequest): Promise<void> {
        return apiClient.patch(
            API_ENDPOINTS.USER.UPDATE_PASSWORD,
            z.void(),
            data,
        );
    }

    async deactivateAccount(): Promise<void> {
        return apiClient.patch(API_ENDPOINTS.USER.DISABLE_ACCOUNT, z.void());
    }
}
