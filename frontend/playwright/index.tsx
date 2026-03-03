import "@/globals.css";
import { beforeMount } from "@playwright/experimental-ct-react/hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServiceProvider } from "@/api/ServiceProvider";
import { ThemeProvider } from "@/components/utils/theme-provider";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { createMockServices } from "@/ui-tests/pw-test-utils";
import { useMutantStore } from "@/stores/mutantStore";
import type { Services } from "@/lib/services";

export type HooksConfig = {
  admin?: boolean;
  withProjects?: boolean;
  projectList?: Array<{
    id: number;
    name: string;
    totalMutants?: number;
    reviewedMutants?: number;
  }>;
  sourceCode?: {
    content: string;
    fullyQualifiedName: string;
  };
  sourceCodeNotFound?: boolean;
  sourceCodeSlow?: boolean;
  loginFail?: boolean;
  existingRating?: boolean;
  mutantStore?: {
    projectId?: number | null;
    selectedMutant?: {
      id: number;
      detected: boolean;
      status: string;
      sourceFile: string;
      lineNumber: number;
      mutator: string;
      ranking: number;
      rated: boolean;
    } | null;
    mutants?: Array<{
      id: number;
      detected: boolean;
      status: string;
      sourceFile: string;
      lineNumber: number;
      mutator: string;
      ranking: number;
      rated: boolean;
    }>;
  };
};

beforeMount<HooksConfig>(async ({ App, hooksConfig }) => {
  // Always set auth_token so useMe query is enabled
  window.localStorage.setItem("auth_token", "mock-token");

  // Reset and optionally populate mutant store
  useMutantStore.setState({
    projectId: hooksConfig?.mutantStore?.projectId ?? null,
    selectedMutant: (hooksConfig?.mutantStore?.selectedMutant as any) ?? null,
    mutants: (hooksConfig?.mutantStore?.mutants as any) ?? [],
    isLoading: false,
  });

  const overrides: Partial<Services> = {};

  // Auth/admin override
  const isAdmin = hooksConfig?.admin ?? false;
  overrides.authService = {
    me: async () => ({
      id: "1",
      username: "testuser",
      isAdmin,
      isActive: true,
    }),
    login: hooksConfig?.loginFail
      ? (async () => {
          throw { status: 401 };
        })
      : async () => ({ token: "mock-token" }),
    logout: async () => {},
  } as any;

  // Projects override
  if (hooksConfig?.withProjects || hooksConfig?.projectList) {
    const projects = hooksConfig?.projectList?.map((p) => ({
      id: p.id,
      name: p.name,
      createdAt: "2024-01-15T10:00:00Z",
      totalMutants: p.totalMutants ?? 100,
      reviewedMutants: p.reviewedMutants ?? 25,
    })) ?? [
      {
        id: 1,
        name: "Project Alpha",
        createdAt: "2024-01-15T10:00:00Z",
        totalMutants: 100,
        reviewedMutants: 50,
      },
      {
        id: 2,
        name: "Project Beta",
        createdAt: "2024-02-20T10:00:00Z",
        totalMutants: 200,
        reviewedMutants: 100,
      },
    ];
    overrides.projectsService = {
      listProjects: async () => projects,
      createProject: async () => projects[0],
      deleteProject: async () => {},
      renameProject: async () => projects[0],
      uploadSourceCode: async () => {},
    } as any;
  }

  // Source code override
  if (hooksConfig?.sourceCode) {
    overrides.mutantsService = {
      listProjectMutants: async () => [],
      getMutant: async () => ({}) as any,
      getMutantSourceCode: async () => ({
        found: true,
        content: hooksConfig.sourceCode!.content,
        fullyQualifiedName: hooksConfig.sourceCode!.fullyQualifiedName,
      }),
    } as any;
  } else if (hooksConfig?.sourceCodeNotFound) {
    overrides.mutantsService = {
      listProjectMutants: async () => [],
      getMutant: async () => ({}) as any,
      getMutantSourceCode: async () => ({
        found: false,
        content: null,
        fullyQualifiedName: null,
      }),
    } as any;
  } else if (hooksConfig?.sourceCodeSlow) {
    overrides.mutantsService = {
      listProjectMutants: async () => [],
      getMutant: async () => ({}) as any,
      getMutantSourceCode: async () => {
        await new Promise((r) => setTimeout(r, 10000));
        return { found: true, content: "code", fullyQualifiedName: "Foo" };
      },
    } as any;
  }

  // Existing rating override
  if (hooksConfig?.existingRating) {
    overrides.ratingsService = {
      getRating: async () => ({
        id: 1,
        mutantId: 1,
        userId: 1,
        fieldValues: [{ form_field_id: 1, value: "3" }],
      }),
      submitRating: async () => ({}) as any,
    } as any;
  }

  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const svc = createMockServices(overrides);

  const rootRoute = createRootRoute({
    component: () => <App />,
  });

  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  return (
    <QueryClientProvider client={qc}>
      <ServiceProvider services={svc}>
        <ThemeProvider defaultTheme="dark" storageKey="pw-test-theme">
          <RouterProvider router={router as any} />
        </ThemeProvider>
      </ServiceProvider>
    </QueryClientProvider>
  );
});
