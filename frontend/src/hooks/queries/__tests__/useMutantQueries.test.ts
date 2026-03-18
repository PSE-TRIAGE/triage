import {renderHook, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {createWrapper} from "@/test-utils";
import {
    useMutantDetails,
    useMutantSourceCode,
    useProjectMutants,
} from "../useMutantQueries";

describe("useProjectMutants", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("fetches mutants for valid project id with auth token", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listProjectMutants = vi.fn().mockResolvedValue([{id: 1}]);
        const wrapper = createWrapper({
            mutantsService: {listProjectMutants} as any,
        });
        const {result} = renderHook(() => useProjectMutants(1), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(listProjectMutants).toHaveBeenCalledWith(1);
        expect(result.current.data).toEqual([{id: 1}]);
    });

    it("does not fetch when project id is falsy", () => {
        localStorage.setItem("auth_token", "test-token");
        const listProjectMutants = vi.fn();
        const wrapper = createWrapper({
            mutantsService: {listProjectMutants} as any,
        });
        const {result} = renderHook(() => useProjectMutants(0), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(listProjectMutants).not.toHaveBeenCalled();
    });

    it("does not fetch without auth token", () => {
        const listProjectMutants = vi.fn();
        const wrapper = createWrapper({
            mutantsService: {listProjectMutants} as any,
        });
        const {result} = renderHook(() => useProjectMutants(1), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(listProjectMutants).not.toHaveBeenCalled();
    });

    it("surfaces mutants list query errors", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listProjectMutants = vi
            .fn()
            .mockRejectedValue(new Error("failed"));
        const wrapper = createWrapper({
            mutantsService: {listProjectMutants} as any,
        });
        const {result} = renderHook(() => useProjectMutants(1), {wrapper});

        await waitFor(
            () => {
                expect(result.current.isError).toBe(true);
            },
            {timeout: 2500},
        );
        expect(listProjectMutants).toHaveBeenCalledTimes(2);
        expect(listProjectMutants).toHaveBeenCalledWith(1);
    });
});

describe("useMutantDetails", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("fetches mutant details for valid mutant id", async () => {
        localStorage.setItem("auth_token", "test-token");
        const getMutant = vi
            .fn()
            .mockResolvedValue({id: 1, status: "SURVIVED"});
        const wrapper = createWrapper({mutantsService: {getMutant} as any});
        const {result} = renderHook(() => useMutantDetails(1), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(getMutant).toHaveBeenCalledWith(1);
        expect(result.current.data).toEqual({id: 1, status: "SURVIVED"});
    });

    it("does not fetch when mutant id is null", () => {
        localStorage.setItem("auth_token", "test-token");
        const getMutant = vi.fn();
        const wrapper = createWrapper({mutantsService: {getMutant} as any});
        const {result} = renderHook(() => useMutantDetails(null), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(getMutant).not.toHaveBeenCalled();
    });

    it("surfaces mutant details query errors", async () => {
        localStorage.setItem("auth_token", "test-token");
        const getMutant = vi.fn().mockRejectedValue(new Error("failed"));
        const wrapper = createWrapper({mutantsService: {getMutant} as any});
        const {result} = renderHook(() => useMutantDetails(1), {wrapper});

        await waitFor(
            () => {
                expect(result.current.isError).toBe(true);
            },
            {timeout: 2500},
        );
        expect(getMutant).toHaveBeenCalledTimes(2);
        expect(getMutant).toHaveBeenCalledWith(1);
    });
});

describe("useMutantSourceCode", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("fetches source code for valid mutant id", async () => {
        localStorage.setItem("auth_token", "test-token");
        const getMutantSourceCode = vi
            .fn()
            .mockResolvedValue({found: true, content: "class A {}"});
        const wrapper = createWrapper({
            mutantsService: {getMutantSourceCode} as any,
        });
        const {result} = renderHook(() => useMutantSourceCode(1), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(getMutantSourceCode).toHaveBeenCalledWith(1);
        expect(result.current.data).toEqual({
            found: true,
            content: "class A {}",
        });
    });

    it("does not fetch when mutant id is null", () => {
        localStorage.setItem("auth_token", "test-token");
        const getMutantSourceCode = vi.fn();
        const wrapper = createWrapper({
            mutantsService: {getMutantSourceCode} as any,
        });
        const {result} = renderHook(() => useMutantSourceCode(null), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(getMutantSourceCode).not.toHaveBeenCalled();
    });

    it("surfaces source code query errors", async () => {
        localStorage.setItem("auth_token", "test-token");
        const getMutantSourceCode = vi
            .fn()
            .mockRejectedValue(new Error("failed"));
        const wrapper = createWrapper({
            mutantsService: {getMutantSourceCode} as any,
        });
        const {result} = renderHook(() => useMutantSourceCode(1), {wrapper});

        await waitFor(
            () => {
                expect(result.current.isError).toBe(true);
            },
            {timeout: 2500},
        );
        expect(getMutantSourceCode).toHaveBeenCalledTimes(2);
        expect(getMutantSourceCode).toHaveBeenCalledWith(1);
    });
});
