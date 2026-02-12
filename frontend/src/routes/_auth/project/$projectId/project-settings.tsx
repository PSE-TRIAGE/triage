import {createFileRoute} from "@tanstack/react-router";
import {ProjectSettings} from "@/pages/ProjectSettings";

export const Route = createFileRoute(
    "/_auth/project/$projectId/project-settings",
)({
    component: ProjectSettings,
});
