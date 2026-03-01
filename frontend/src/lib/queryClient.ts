import {QueryClient} from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 0,
        },
    },
});

export const queryKeys = {
    auth: {
        me: ["auth", "me"] as const,
    },
    projects: {
        all: ["projects"] as const,
        users: (projectId: number) => ["projects", projectId, "users"] as const,
    },
    algorithms: {
        all: ["algorithms"] as const,
    },
    formFields: {
        byProject: (projectId: number) => ["formFields", projectId] as const,
    },
    mutants: {
        byProject: (projectId: number) => ["mutants", projectId] as const,
        byId: (mutantId: number) => ["mutants", "detail", mutantId] as const,
        source: (mutantId: number) => ["mutants", "source", mutantId] as const,
    },
    ratings: {
        byMutant: (mutantId: number) => ["ratings", mutantId] as const,
    },
    admin: {
        users: ["admin", "users"] as const,
        projects: ["admin", "projects"] as const,
        userProjects: (userId: number) =>
            ["admin", "users", userId, "projects"] as const,
        projectUsers: (projectId: number) =>
            ["admin", "projects", projectId, "users"] as const,
    },
    export: {
        preview: (projectId: number) =>
            ["export", "preview", projectId] as const,
    },
} as const;
