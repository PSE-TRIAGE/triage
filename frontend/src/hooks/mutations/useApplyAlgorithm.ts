import {useMutation} from "@tanstack/react-query";
import {useServices} from "@/api/ServiceProvider";

export function useApplyAlgorithm(projectId: number) {
    const {algorithmsService} = useServices();

    return useMutation({
        mutationFn: (algorithmId: string) =>
            algorithmsService.applyAlgorithm(projectId, algorithmId),
    });
}
