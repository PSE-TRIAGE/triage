import {useQuery} from "@tanstack/react-query";
import {useServices} from "@/api/ServiceProvider";
import {queryKeys} from "@/lib/queryClient";

export function useAlgorithms() {
    const {algorithmsService} = useServices();
    return useQuery({
        queryKey: queryKeys.algorithms.all,
        queryFn: () => algorithmsService.listAlgorithms(),
        enabled: !!localStorage.getItem("auth_token"),
        retry: 1,
    });
}
