import {useQuery} from "@tanstack/react-query";
import {queryKeys} from "@/lib/queryClient";
import {useServices} from "@/api/ServiceProvider";

export function useAdminUsers() {
    const {adminUsersService} = useServices();
    return useQuery({
        queryKey: queryKeys.admin.users,
        queryFn: () => adminUsersService.listUsers(),
        enabled: !!localStorage.getItem("auth_token"),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export function useAdminProjects() {
    const {projectsService} = useServices();

    return useQuery({
        queryKey: queryKeys.admin.projects,
        queryFn: () => projectsService.listAdminProjects(),
        enabled: !!localStorage.getItem("auth_token"),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export function useAdminUserProjects(userId: number) {
    const {adminUsersService} = useServices();

    return useQuery({
        queryKey: queryKeys.admin.userProjects(userId),
        queryFn: () => adminUsersService.listUserProjects(userId),
        enabled:
            !!localStorage.getItem("auth_token") && Number.isFinite(userId),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}
