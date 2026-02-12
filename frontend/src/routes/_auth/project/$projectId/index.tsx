import {createFileRoute, redirect} from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/project/$projectId/")({
    beforeLoad: () => {
        // automatically reroutes to Dashboard if no valid projectId is entered into the URL
        throw redirect({
            to: "/dashboard",
            replace: true,
        });
    },
});
