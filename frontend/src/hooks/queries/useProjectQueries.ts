import {useQuery} from "@tanstack/react-query";
import {queryKeys} from "@/lib/queryClient";
import {useServices} from "@/api/ServiceProvider";

export function useProjects() {
    const {projectsService} = useServices();
    return useQuery({
        queryKey: queryKeys.projects.all,
        queryFn: () => projectsService.listProjects(),
        enabled: !!localStorage.getItem("auth_token"),
        refetchOnMount: "always",
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
}

export function useProjectUsers(projectId: number) {
    const {projectsService} = useServices();
    return useQuery({
        queryKey: queryKeys.projects.users(projectId),
        queryFn: () => projectsService.listProjectUsers(projectId),
        enabled: !!localStorage.getItem("auth_token") && !!projectId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}
