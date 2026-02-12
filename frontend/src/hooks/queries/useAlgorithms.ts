import {useQuery} from "@tanstack/react-query";
import {queryKeys} from "@/lib/queryClient";
import {useServices} from "@/api/ServiceProvider";

export function useAlgorithms() {
    const {algorithmsService} = useServices();
    return useQuery({
        queryKey: queryKeys.algorithms.all,
        queryFn: () => algorithmsService.listAlgorithms(),
        enabled: !!localStorage.getItem("auth_token"),
        retry: 1,
    });
}
