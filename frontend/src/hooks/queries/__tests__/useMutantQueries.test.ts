import {describe, expect, it, vi, beforeEach} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useProjectMutants, useMutantDetails, useMutantSourceCode} from "../useMutantQueries";

describe("useProjectMutants", () => {
	beforeEach(() => {
		localStorage.setItem("auth_token", "test-token");
	});

	it("calls mutantsService.listProjectMutants", async () => {
		const listProjectMutants = vi.fn().mockResolvedValue([{id: 1}]);
		const wrapper = createWrapper({mutantsService: {listProjectMutants} as any});

		const {result} = renderHook(() => useProjectMutants(1), {wrapper});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(listProjectMutants).toHaveBeenCalledWith(1);
	});
});

describe("useMutantDetails", () => {
	beforeEach(() => {
		localStorage.setItem("auth_token", "test-token");
	});

	it("calls mutantsService.getMutant", async () => {
		const getMutant = vi.fn().mockResolvedValue({id: 1, status: "alive"});
		const wrapper = createWrapper({mutantsService: {getMutant} as any});

		const {result} = renderHook(() => useMutantDetails(1), {wrapper});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(getMutant).toHaveBeenCalledWith(1);
	});

	it("does not fetch when mutantId is null", () => {
		const getMutant = vi.fn();
		const wrapper = createWrapper({mutantsService: {getMutant} as any});

		const {result} = renderHook(() => useMutantDetails(null), {wrapper});
		expect(result.current.fetchStatus).toBe("idle");
	});
});

describe("useMutantSourceCode", () => {
	beforeEach(() => {
		localStorage.setItem("auth_token", "test-token");
	});

	it("calls mutantsService.getMutantSourceCode", async () => {
		const getMutantSourceCode = vi.fn().mockResolvedValue("source code");
		const wrapper = createWrapper({mutantsService: {getMutantSourceCode} as any});

		const {result} = renderHook(() => useMutantSourceCode(1), {wrapper});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(getMutantSourceCode).toHaveBeenCalledWith(1);
	});

	it("does not fetch when mutantId is null", () => {
		const getMutantSourceCode = vi.fn();
		const wrapper = createWrapper({mutantsService: {getMutantSourceCode} as any});

		const {result} = renderHook(() => useMutantSourceCode(null), {wrapper});
		expect(result.current.fetchStatus).toBe("idle");
	});
});
