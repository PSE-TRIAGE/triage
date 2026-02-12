import {useQuery} from "@tanstack/react-query";
import {queryKeys} from "@/lib/queryClient";
import {useServices} from "@/api/ServiceProvider";

export function useRating(mutantId: number | undefined) {
    const {ratingsService} = useServices();

    return useQuery({
        queryKey: queryKeys.ratings.byMutant(mutantId!),
        queryFn: () => ratingsService.getRating(mutantId!),
        enabled: !!localStorage.getItem("auth_token") && !!mutantId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
        placeholderData: undefined,
    });
}
