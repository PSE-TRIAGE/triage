import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useServices} from "@/api/ServiceProvider";
import {queryKeys} from "@/lib/queryClient";

export function useApplyAlgorithm(projectId: number) {
    const {algorithmsService} = useServices();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (algorithmId: string) =>
            algorithmsService.applyAlgorithm(projectId, algorithmId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.mutants.byProject(projectId),
            });
        },
    });
}
