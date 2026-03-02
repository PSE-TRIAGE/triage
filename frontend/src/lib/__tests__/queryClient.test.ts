import { describe, it, expect } from "vitest";
import { queryClient, queryKeys } from "../queryClient";

describe("queryClient", () => {
	it("has correct default staleTime", () => {
		const defaults = queryClient.getDefaultOptions();
		expect(defaults.queries?.staleTime).toBe(1000 * 60 * 5);
	});

	it("has correct gcTime", () => {
		const defaults = queryClient.getDefaultOptions();
		expect(defaults.queries?.gcTime).toBe(1000 * 60 * 10);
	});

	it("has retry set to 1 for queries", () => {
		const defaults = queryClient.getDefaultOptions();
		expect(defaults.queries?.retry).toBe(1);
	});

	it("has retry set to 0 for mutations", () => {
		const defaults = queryClient.getDefaultOptions();
		expect(defaults.mutations?.retry).toBe(0);
	});

	it("has refetchOnWindowFocus disabled", () => {
		const defaults = queryClient.getDefaultOptions();
		expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
	});
});

describe("queryKeys", () => {
	it("auth.me returns correct key", () => {
		expect(queryKeys.auth.me).toEqual(["auth", "me"]);
	});

	it("projects.all returns correct key", () => {
		expect(queryKeys.projects.all).toEqual(["projects"]);
	});

	it("projects.users returns correct key with projectId", () => {
		expect(queryKeys.projects.users(42)).toEqual(["projects", 42, "users"]);
	});

	it("algorithms.all returns correct key", () => {
		expect(queryKeys.algorithms.all).toEqual(["algorithms"]);
	});

	it("formFields.byProject returns correct key", () => {
		expect(queryKeys.formFields.byProject(5)).toEqual(["formFields", 5]);
	});

	it("mutants.byProject returns correct key", () => {
		expect(queryKeys.mutants.byProject(3)).toEqual(["mutants", 3]);
	});

	it("mutants.byId returns correct key", () => {
		expect(queryKeys.mutants.byId(10)).toEqual(["mutants", "detail", 10]);
	});

	it("mutants.source returns correct key", () => {
		expect(queryKeys.mutants.source(7)).toEqual(["mutants", "source", 7]);
	});

	it("ratings.byMutant returns correct key", () => {
		expect(queryKeys.ratings.byMutant(15)).toEqual(["ratings", 15]);
	});

	it("admin.users returns correct key", () => {
		expect(queryKeys.admin.users).toEqual(["admin", "users"]);
	});

	it("admin.projects returns correct key", () => {
		expect(queryKeys.admin.projects).toEqual(["admin", "projects"]);
	});

	it("admin.userProjects returns correct key", () => {
		expect(queryKeys.admin.userProjects(2)).toEqual(["admin", "users", 2, "projects"]);
	});

	it("admin.projectUsers returns correct key", () => {
		expect(queryKeys.admin.projectUsers(9)).toEqual(["admin", "projects", 9, "users"]);
	});

	it("export.preview returns correct key", () => {
		expect(queryKeys.export.preview(4)).toEqual(["export", "preview", 4]);
	});
});
