import {useQuery} from "@tanstack/react-query";
import {useServices} from "@/api/ServiceProvider";
import {queryKeys} from "@/lib/queryClient";

export function useRating(mutantId: number | undefined) {
    const {ratingsService} = useServices();

    return useQuery({
        queryKey: queryKeys.ratings.byMutant(mutantId ?? 0),
        queryFn: () => {
            if (mutantId === undefined) {
                throw new Error("mutantId is required to fetch a rating");
            }

            return ratingsService.getRating(mutantId);
        },
        enabled:
            Boolean(localStorage.getItem("auth_token")) &&
            mutantId !== undefined,
        staleTime: 5 * 60 * 1000,
        retry: 1,
        placeholderData: undefined,
    });
}
