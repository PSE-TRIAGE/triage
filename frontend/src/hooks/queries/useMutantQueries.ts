import {useQuery} from "@tanstack/react-query";
import {queryKeys} from "@/lib/queryClient";
import {useServices} from "@/api/ServiceProvider";

export function useProjectMutants(projectId: number) {
    const {mutantsService} = useServices();

    return useQuery({
        queryKey: queryKeys.mutants.byProject(projectId),
        queryFn: () => mutantsService.listProjectMutants(projectId),
        enabled: !!localStorage.getItem("auth_token") && !!projectId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export function useMutantDetails(mutantId?: number | null) {
    const {mutantsService} = useServices();

    return useQuery({
        queryKey: queryKeys.mutants.byId(mutantId ?? 0),
        queryFn: () => mutantsService.getMutant(mutantId as number),
        enabled: !!localStorage.getItem("auth_token") && !!mutantId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export function useMutantSourceCode(mutantId?: number | null) {
    const {mutantsService} = useServices();

    return useQuery({
        queryKey: queryKeys.mutants.source(mutantId ?? 0),
        queryFn: () => mutantsService.getMutantSourceCode(mutantId as number),
        enabled: !!localStorage.getItem("auth_token") && !!mutantId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}
