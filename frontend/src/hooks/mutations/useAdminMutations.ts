import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {queryClient, queryKeys} from "@/lib/queryClient";
import {useServices} from "@/api/ServiceProvider";
import type {CreateUserRequest, AdminUser} from "@/api/services/admin-users.service";

type ChangeRoleParams = {
    userId: number;
    promote: boolean;
};

export function useAdminCreateUser() {
    const {adminUsersService} = useServices();

    return useMutation({
        mutationFn: (data: CreateUserRequest) => adminUsersService.createUser(data),

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.admin.users});
            toast.success("User created successfully");
        },

        onError: (error) => {
            console.error("Create user failed:", error);
            toast.error("Failed to create user");
        },
    });
}

export function useAdminDeleteUser() {
    const {adminUsersService} = useServices();

    return useMutation({
        mutationFn: (userId: number) => adminUsersService.deleteUser(userId),

        onSuccess: (_data, userId) => {
            queryClient.setQueryData<AdminUser[]>(
                queryKeys.admin.users,
                (oldUsers) => oldUsers?.filter((u) => u.id !== userId) ?? [],
            );

            queryClient.invalidateQueries({queryKey: queryKeys.admin.users});
            toast.success("User data deleted successfully");
        },

        onError: (error) => {
            console.error("Delete user failed:", error);
            toast.error("Failed to delete user data");
        },
    });
}

export function useAdminDisableUser() {
    const {adminUsersService} = useServices();

    return useMutation({
        mutationFn: (userId: number) => adminUsersService.disableUser(userId),

        onSuccess: (_data, userId) => {
            queryClient.setQueryData<AdminUser[] | undefined>(
                queryKeys.admin.users,
                (oldUsers) =>
                    oldUsers?.map((user) =>
                        user.id === userId
                            ? {...user, isActive: false}
                            : user,
                    ),
            );
            queryClient.invalidateQueries({queryKey: queryKeys.admin.users});
            toast.success("User deactivated successfully");
        },

        onError: (error) => {
            console.error("Deactivate user failed:", error);
            toast.error("Failed to deactivate user");
        },
    });
}

export function useAdminEnableUser() {
    const {adminUsersService} = useServices();

    return useMutation({
        mutationFn: (userId: number) => adminUsersService.enableUser(userId),

        onSuccess: (_data, userId) => {
            queryClient.setQueryData<AdminUser[] | undefined>(
                queryKeys.admin.users,
                (oldUsers) =>
                    oldUsers?.map((user) =>
                        user.id === userId
                            ? {...user, isActive: true}
                            : user,
                    ),
            );
            queryClient.invalidateQueries({queryKey: queryKeys.admin.users});
            toast.success("User reactivated successfully");
        },

        onError: (error) => {
            console.error("Reactivate user failed:", error);
            toast.error("Failed to reactivate user");
        },
    });
}

export function useAdminChangeRole() {
    const {adminUsersService} = useServices();

    return useMutation({
        mutationFn: ({userId, promote}: ChangeRoleParams) =>
            promote
                ? adminUsersService.promoteUser(userId)
                : adminUsersService.demoteUser(userId),

        onSuccess: (_data, {promote}) => {
            queryClient.invalidateQueries({queryKey: queryKeys.admin.users});
            toast.success(`User ${promote ? "promoted to admin" : "demoted to member"}`);
        },

        onError: (error) => {
            console.error("Change role failed:", error);
            toast.error("Failed to change user role");
        },
    });
}
