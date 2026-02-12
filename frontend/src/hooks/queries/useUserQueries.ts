import {useQuery} from "@tanstack/react-query";
import {queryKeys} from "@/lib/queryClient";
import {useServices} from "@/api/ServiceProvider";

export function useMe() {
    const {authService} = useServices();
    return useQuery({
        queryKey: queryKeys.auth.me,
        queryFn: () => authService.me(),
        enabled: !!localStorage.getItem("auth_token"),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
    });
}
