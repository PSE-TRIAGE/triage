import { describe, it, expect, beforeEach } from "vitest";
import { useMutantStore } from "../mutantStore";
import type { MutantOverview } from "@/api/services/mutants.service";

const makeMutant = (overrides: Partial<MutantOverview> = {}): MutantOverview => ({
	id: 1,
	detected: true,
	status: "SURVIVED",
	sourceFile: "Foo.java",
	lineNumber: 42,
	mutator: "org.pitest.mutationtest.engine.gregor.mutators.ConditionalsBoundaryMutator",
	ranking: 1,
	rated: false,
	...overrides,
});

describe("useMutantStore", () => {
	beforeEach(() => {
		useMutantStore.setState({
			projectId: null,
			selectedMutant: null,
			mutants: [],
			isLoading: false,
		});
	});

	it("has correct initial state", () => {
		const state = useMutantStore.getState();
		expect(state.projectId).toBeNull();
		expect(state.selectedMutant).toBeNull();
		expect(state.mutants).toEqual([]);
		expect(state.isLoading).toBe(false);
	});

	it("setProjectId updates projectId", () => {
		useMutantStore.getState().setProjectId(5);
		expect(useMutantStore.getState().projectId).toBe(5);
	});

	it("setProjectId to null", () => {
		useMutantStore.getState().setProjectId(5);
		useMutantStore.getState().setProjectId(null);
		expect(useMutantStore.getState().projectId).toBeNull();
	});

	it("setSelectedMutant updates selectedMutant", () => {
		const mutant = makeMutant();
		useMutantStore.getState().setSelectedMutant(mutant);
		expect(useMutantStore.getState().selectedMutant).toEqual(mutant);
	});

	it("setSelectedMutant to null", () => {
		useMutantStore.getState().setSelectedMutant(makeMutant());
		useMutantStore.getState().setSelectedMutant(null);
		expect(useMutantStore.getState().selectedMutant).toBeNull();
	});

	it("setMutants updates mutants array", () => {
		const mutants = [makeMutant({ id: 1 }), makeMutant({ id: 2 })];
		useMutantStore.getState().setMutants(mutants);
		expect(useMutantStore.getState().mutants).toHaveLength(2);
	});

	it("setIsLoading updates isLoading", () => {
		useMutantStore.getState().setIsLoading(true);
		expect(useMutantStore.getState().isLoading).toBe(true);
		useMutantStore.getState().setIsLoading(false);
		expect(useMutantStore.getState().isLoading).toBe(false);
	});

	it("markMutantAsRated marks the correct mutant as rated", () => {
		const mutants = [
			makeMutant({ id: 1, rated: false }),
			makeMutant({ id: 2, rated: false }),
		];
		useMutantStore.getState().setMutants(mutants);
		useMutantStore.getState().markMutantAsRated(1);

		const state = useMutantStore.getState();
		expect(state.mutants[0].rated).toBe(true);
		expect(state.mutants[1].rated).toBe(false);
	});

	it("markMutantAsRated also updates selectedMutant if it matches", () => {
		const mutant = makeMutant({ id: 3, rated: false });
		useMutantStore.getState().setMutants([mutant]);
		useMutantStore.getState().setSelectedMutant(mutant);
		useMutantStore.getState().markMutantAsRated(3);

		expect(useMutantStore.getState().selectedMutant?.rated).toBe(true);
	});

	it("markMutantAsRated does not update selectedMutant if id doesn't match", () => {
		const mutant1 = makeMutant({ id: 1, rated: false });
		const mutant2 = makeMutant({ id: 2, rated: false });
		useMutantStore.getState().setMutants([mutant1, mutant2]);
		useMutantStore.getState().setSelectedMutant(mutant1);
		useMutantStore.getState().markMutantAsRated(2);

		expect(useMutantStore.getState().selectedMutant?.rated).toBe(false);
	});
});
