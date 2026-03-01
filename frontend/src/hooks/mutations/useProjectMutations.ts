import {useMutation} from "@tanstack/react-query";
import {useNavigate} from "@tanstack/react-router";
import {toast} from "sonner";
import {queryClient, queryKeys} from "@/lib/queryClient";
import {useServices} from "@/api/ServiceProvider";
import type {
    AdminProject,
    CreateProjectRequest,
    Project,
    ProjectUser,
} from "@/api/services/projects.service";

export function useCreateProject() {
    const {projectsService} = useServices();

    return useMutation({
        mutationFn: (data: CreateProjectRequest) =>
            projectsService.createProject(data),

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.projects.all});
            queryClient.invalidateQueries({queryKey: ["mutants", "source"]});
        },

        onError: (error) => {
            console.error("Create project failed:", error);
        },
    });
}

export function useDeleteProject() {
    const {projectsService} = useServices();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (projectId: number) =>
            projectsService.deleteProject(projectId),

        onSuccess: (_data, projectId) => {
            // Immediately remove from cache to prevent flicker
            queryClient.setQueryData<Project[]>(
                queryKeys.projects.all,
                (oldProjects) =>
                    oldProjects?.filter((p) => p.id !== projectId) ?? [],
            );

            queryClient.invalidateQueries({queryKey: queryKeys.projects.all});

            toast.success("Project deleted successfully");
            navigate({to: "/dashboard"});
        },

        onError: (error) => {
            console.error("Delete project failed:", error);
            toast.error("Failed to delete project");
        },
    });
}

type RenameProjectParams = {
    projectId: number;
    name: string;
};

export function useRenameProject() {
    const {projectsService} = useServices();

    return useMutation({
        mutationFn: ({projectId, name}: RenameProjectParams) =>
            projectsService.renameProject(projectId, {name}),

        onSuccess: (updatedProject, {projectId, name}) => {
            const nextName = updatedProject?.name ?? name;

            queryClient.setQueryData<Project[]>(
                queryKeys.projects.all,
                (oldProjects) =>
                    oldProjects?.map((project) =>
                        project.id === projectId
                            ? {...project, name: nextName}
                            : project,
                    ) ?? oldProjects,
            );

            queryClient.setQueryData<AdminProject[]>(
                queryKeys.admin.projects,
                (oldProjects) =>
                    oldProjects?.map((project) =>
                        project.id === projectId
                            ? {...project, name: nextName}
                            : project,
                    ) ?? oldProjects,
            );

            queryClient.setQueryData<Project>(
                [queryKeys.projects, projectId.toString()],
                (project) => (project ? {...project, name: nextName} : project),
            );
        },

        onError: (error) => {
            console.error("Rename project failed:", error);
        },
    });
}

export function useAddProjectUser(projectId: number) {
    const {projectsService} = useServices();

    return useMutation({
        mutationFn: (userId: number) =>
            projectsService.addUserToProject(projectId, userId),

        onSuccess: (_data, userId) => {
            const allUsers =
                queryClient.getQueryData<ProjectUser[]>(
                    queryKeys.admin.users,
                ) ?? [];
            const addedUser = allUsers.find((user) => user.id === userId);

            queryClient.setQueryData<ProjectUser[]>(
                queryKeys.projects.users(projectId),
                (oldUsers) => {
                    if (!addedUser) {
                        return oldUsers ?? [];
                    }
                    const existing = oldUsers ?? [];
                    if (existing.some((user) => user.id === userId)) {
                        return existing;
                    }
                    return [...existing, addedUser];
                },
            );

            queryClient.invalidateQueries({
                queryKey: queryKeys.projects.users(projectId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.admin.userProjects(userId),
            });
        },

        onError: (error) => {
            console.error("Add user to project failed:", error);
        },
    });
}

type UploadSourceCodeParams = {
    projectId: number;
    file: File;
};

export function useUploadSourceCode() {
    const {projectsService} = useServices();

    return useMutation({
        mutationFn: ({projectId, file}: UploadSourceCodeParams) =>
            projectsService.uploadSourceCode(projectId, file),

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["mutants", "source"]});
        },

        onError: (error) => {
            console.error("Upload source code failed:", error);
        },
    });
}

export function useRemoveProjectUser(projectId: number) {
    const {projectsService} = useServices();

    return useMutation({
        mutationFn: (userId: number) =>
            projectsService.removeUserFromProject(projectId, userId),

        onSuccess: (_data, userId) => {
            queryClient.setQueryData<ProjectUser[]>(
                queryKeys.projects.users(projectId),
                (oldUsers) =>
                    (oldUsers ?? []).filter((user) => user.id !== userId),
            );

            queryClient.invalidateQueries({
                queryKey: queryKeys.projects.users(projectId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.admin.userProjects(userId),
            });
        },

        onError: (error) => {
            console.error("Remove user from project failed:", error);
        },
    });
}
