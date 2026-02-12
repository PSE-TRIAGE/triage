import {useMutation} from "@tanstack/react-query";
import {useNavigate} from "@tanstack/react-router";
import {queryClient, queryKeys} from "@/lib/queryClient";
import {toast} from "sonner";
import {useServices} from "@/api/ServiceProvider";
import type {LoginCredentials} from "@/api/services/auth.service";
import type {
    ChangePasswordRequest,
    ChangeUsernameRequest,
} from "@/api/services/user.service";

export function useLogin() {
    const navigate = useNavigate();
    const {authService} = useServices();

    return useMutation({
        mutationFn: (credentials: LoginCredentials) =>
            authService.login(credentials),

        onSuccess: (data) => {
            localStorage.setItem("auth_token", data.token);

            navigate({to: "/dashboard"});
        },

        onError: (error) => {
            console.error("Login failed:", error);
            // Error is accessible via mutation.error in the component
        },
    });
}

export function useLogout() {
    const navigate = useNavigate();
    const {authService} = useServices();

    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            localStorage.removeItem("token");

            queryClient.clear();

            navigate({to: "/login"});
            toast.success("Logged out successfully");
        },
        onError: () => {
            toast.error("Failed to logout");
        },
    });
}

export function useChangePassword() {
    const {userService} = useServices();

    return useMutation({
        mutationFn: (data: ChangePasswordRequest) =>
            userService.changePassword(data),

        onError: (error) => {
            console.error("Changing username has failed:", error);
            // Error is accessible via mutation.error in the component
        },
    });
}

export function useChangeUsername() {
    const {userService} = useServices();

    return useMutation({
        mutationFn: (newUsername: ChangeUsernameRequest) =>
            userService.changeUsername(newUsername),

        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: queryKeys.auth.me});
        },

        onError: (error) => {
            console.error("Changing username has failed:", error);
            // Error is accessible via mutation.error in the component
        },
    });
}

export function useDeactivateAccount() {
    const {userService} = useServices();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: () => userService.deactivateAccount(),

        onSuccess: () => {
            toast.success("Account deactivated successfully.");

            queryClient.clear();
            localStorage.removeItem("token");

            navigate({to: "/"});
        },

        onError: (error) => {
            console.error("Deactivate account failed:", error);
            toast.error("Failed to deactivate account. Please try again.");
        },
    });
}
