import {createFileRoute} from "@tanstack/react-router";
import {ReviewView} from "@/pages/ReviewView";

export const Route = createFileRoute("/_auth/project/$projectId/review")({
    component: ReviewView,
});
