import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {queryClient, queryKeys} from "@/lib/queryClient";
import {useServices} from "@/api/ServiceProvider";
import type {RatingWithValuesCreate} from "@/api/services/ratings.service";

type SubmitRatingParams = {
    mutantId: number;
    data: RatingWithValuesCreate;
};

export function useSubmitRating(projectId: number) {
    const {ratingsService} = useServices();

    return useMutation({
        mutationFn: ({mutantId, data}: SubmitRatingParams) =>
            ratingsService.submitRating(mutantId, data),

        onSuccess: (_data, {mutantId}) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.ratings.byMutant(mutantId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.mutants.byProject(projectId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.projects.all,
            });
            toast.success("Rating submitted successfully");
        },

        onError: (error) => {
            console.error("Submit rating failed:", error);
            toast.error("Failed to submit rating");
        },
    });
}
