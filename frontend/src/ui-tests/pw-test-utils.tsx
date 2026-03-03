import {QueryClient} from "@tanstack/react-query";
import type {Services} from "@/lib/services";
import type {AuthService} from "@/api/services/auth.service";
import type {ProjectsService, Project} from "@/api/services/projects.service";
import type {UserService} from "@/api/services/user.service";
import type {
    AdminUsersService,
    AdminUser,
} from "@/api/services/admin-users.service";
import type {
    AdminFormFieldService,
    FormField,
} from "@/api/services/admin-formfield.service";
import type {ExportService} from "@/api/services/export.service";
import type {AlgorithmsService} from "@/api/services/algorithms.service";
import type {
    MutantsService,
    MutantOverview,
} from "@/api/services/mutants.service";
import type {RatingsService} from "@/api/services/ratings.service";

export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {retry: false, gcTime: 0},
            mutations: {retry: false},
        },
    });
}

const noop = async () => {};

export function createMockServices(
    overrides: Partial<Services> = {},
): Services {
    return {
        authService: {
            login: async () => ({token: "mock-token"}),
            logout: noop,
            me: async () => ({
                id: "1",
                username: "testuser",
                isAdmin: false,
                isActive: true,
            }),
        } as AuthService,
        projectsService: {
            listProjects: async () => [],
            createProject: async () => ({id: 1, name: "Test"}),
            deleteProject: noop,
            renameProject: async () => ({id: 1, name: "Renamed"}),
            uploadSourceCode: noop,
            listProjectUsers: async () => [],
            addUserToProject: noop,
            removeUserFromProject: noop,
        } as unknown as ProjectsService,
        userService: {
            changeUsername: async () => ({
                id: "1",
                username: "new",
                isAdmin: false,
                isActive: true,
            }),
            changePassword: noop,
            deactivateAccount: noop,
        } as UserService,
        adminUsersService: {
            listUsers: async () => [],
            createUser: noop,
            deleteUser: noop,
            disableUser: noop,
            enableUser: noop,
            promoteUser: noop,
            demoteUser: noop,
            getUserProjects: async () => [],
        } as unknown as AdminUsersService,
        adminFormFieldService: {
            listFormFields: async () => [],
            createFormField: async () => ({
                id: 1,
                projectId: 1,
                label: "Test",
                type: "text",
                isRequired: false,
                position: 0,
            }),
            updateFormField: async () => ({
                id: 1,
                projectId: 1,
                label: "Updated",
                type: "text",
                isRequired: false,
                position: 0,
            }),
            deleteFormField: noop,
            reorderFormFields: noop,
        } as unknown as AdminFormFieldService,
        exportService: {
            getExportPreview: async () => ({
                project_id: 1,
                project_name: "Test",
                stats: {},
                sample_entries: [],
            }),
            downloadExport: noop,
            getExportData: async () => ({
                project_id: 1,
                project_name: "Test",
                exported_at: "",
                stats: {},
                ratings: [],
            }),
        } as unknown as ExportService,
        algorithmsService: {
            listAlgorithms: async () => [],
            applyAlgorithm: async () => ({
                success: true,
                algorithm_name: "test",
                mutants_ranked: 0,
                message: "",
            }),
        } as AlgorithmsService,
        mutantsService: {
            listProjectMutants: async () => [],
            getMutant: async () => ({}) as any,
            getMutantSourceCode: async () => ({
                projectId: 0,
                found: false,
                content: null,
                fullyQualifiedName: "",
            }),
        } as MutantsService,
        ratingsService: {
            getRating: async () => null,
            submitRating: async () => ({}) as any,
        } as RatingsService,
        ...overrides,
    };
}

// Helpers for creating test data
export function makeProject(overrides: Partial<Project> = {}): Project {
    return {
        id: 1,
        name: "Test Project",
        createdAt: "2024-01-15T10:00:00Z",
        totalMutants: 100,
        reviewedMutants: 25,
        currentStatus: undefined,
        formSchema: undefined,
        ...overrides,
    };
}

export function makeMutant(
    overrides: Partial<MutantOverview> = {},
): MutantOverview {
    return {
        id: 1,
        detected: true,
        status: "SURVIVED",
        sourceFile: "Foo.java",
        lineNumber: 42,
        mutator:
            "org.pitest.mutationtest.engine.gregor.mutators.ConditionalsBoundaryMutator",
        ranking: 1,
        rated: false,
        ...overrides,
    };
}

export function makeAdminUser(overrides: Partial<AdminUser> = {}): AdminUser {
    return {
        id: 1,
        username: "testuser",
        isAdmin: false,
        isActive: true,
        mutantsReviewed: 0,
        ...overrides,
    };
}

export function makeFormField(overrides: Partial<FormField> = {}): FormField {
    return {
        id: 1,
        projectId: 1,
        label: "Rating",
        type: "rating",
        isRequired: true,
        position: 0,
        ...overrides,
    };
}
