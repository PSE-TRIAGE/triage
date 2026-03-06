import {beforeEach, describe, expect, it, vi} from "vitest";
import type {Project} from "@/api/services/projects.service";

type QueryOptions = {
	queryKey: unknown[];
	queryFn: () => Promise<unknown>;
};

function makeProject(id: number): Project {
	return {
		id,
		name: `Project ${id}`,
		createdAt: "2025-01-01",
		totalMutants: 10,
		reviewedMutants: 3,
		currentStatus: undefined,
		formSchema: undefined,
	};
}

async function loadProjectRoute(projects: Project[]) {
	const queryKeysMock = {
		projects: {
			all: ["projects"] as const,
		},
	};
	const ensureQueryDataMock = vi.fn(async (options: QueryOptions) =>
		options.queryFn(),
	);
	const listProjectsMock = vi.fn(async () => projects);

	vi.doMock("@/lib/queryClient", () => ({
		queryClient: {
			ensureQueryData: ensureQueryDataMock,
		},
		queryKeys: queryKeysMock,
	}));
	vi.doMock("@/lib/services", () => ({
		services: {
			projectsService: {
				listProjects: listProjectsMock,
			},
		},
	}));

	const module = await import("../_auth/project/$projectId/route");
	return {
		Route: module.Route,
		queryKeysMock,
		ensureQueryDataMock,
		listProjectsMock,
	};
}

describe("routes/_auth/project/$projectId/route beforeLoad", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
	});

	it("returns project in route context when project exists", async () => {
		const targetProject = makeProject(7);
		const {Route, queryKeysMock, ensureQueryDataMock, listProjectsMock} =
			await loadProjectRoute([makeProject(2), targetProject]);

		const result = await Route.options.beforeLoad?.({
			params: {projectId: "7"},
		} as never);

		expect(result).toEqual({project: targetProject});
		expect(listProjectsMock).toHaveBeenCalledTimes(1);
		expect(ensureQueryDataMock).toHaveBeenCalledWith(
			expect.objectContaining({
				queryKey: [queryKeysMock.projects, "7"],
				queryFn: expect.any(Function),
			}),
		);
	});

	it("redirects to /dashboard when project id is unknown", async () => {
		const {Route, listProjectsMock} = await loadProjectRoute([
			makeProject(1),
			makeProject(2),
		]);

		await expect(
			Route.options.beforeLoad?.({
				params: {projectId: "999"},
			} as never),
		).rejects.toMatchObject({
			options: {to: "/dashboard"},
		});
		expect(listProjectsMock).toHaveBeenCalledTimes(1);
	});
});
