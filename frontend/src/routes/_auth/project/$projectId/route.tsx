import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";
import type {Project} from "@/api/services/projects.service";
import {queryClient, queryKeys} from "@/lib/queryClient";
import {services} from "@/lib/services";

export const Route = createFileRoute("/_auth/project/$projectId")({
    beforeLoad: async ({params}) => {
        const project = await fetchProject(params.projectId);
        return {project};
    },
    component: Outlet,
});

const fetchProject = async (projectId: string): Promise<Project> => {
    const project = await queryClient.ensureQueryData({
        queryKey: [queryKeys.projects, projectId],
        queryFn: async () => {
            const projects = await services.projectsService.listProjects();
            const project = projects.find((p) => String(p.id) === projectId);

            // The query function cannot return undefined -> see docs
            if (!project) {
                throw redirect({to: "/dashboard"});
            }
            return project;
        },
    });
    return project;
};
