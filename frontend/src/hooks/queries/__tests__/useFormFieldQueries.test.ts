import {renderHook, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {createWrapper} from "@/test-utils";
import {useFormFields} from "../useFormFieldQueries";

describe("useFormFields", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("fetches form fields when auth token exists", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listFormFields = vi
            .fn()
            .mockResolvedValue([{id: 1, label: "Field"}]);
        const wrapper = createWrapper({
            adminFormFieldService: {listFormFields} as any,
        });
        const {result} = renderHook(() => useFormFields(1), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(listFormFields).toHaveBeenCalledWith(1);
        expect(result.current.data).toEqual([{id: 1, label: "Field"}]);
    });

    it("does not fetch form fields without auth token", () => {
        const listFormFields = vi.fn();
        const wrapper = createWrapper({
            adminFormFieldService: {listFormFields} as any,
        });
        const {result} = renderHook(() => useFormFields(1), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(listFormFields).not.toHaveBeenCalled();
    });

    it("surfaces form field query errors", async () => {
        localStorage.setItem("auth_token", "test-token");
        const listFormFields = vi.fn().mockRejectedValue(new Error("failed"));
        const wrapper = createWrapper({
            adminFormFieldService: {listFormFields} as any,
        });
        const {result} = renderHook(() => useFormFields(1), {wrapper});

        await waitFor(
            () => {
                expect(result.current.isError).toBe(true);
            },
            {timeout: 2500},
        );
        expect(listFormFields).toHaveBeenCalledTimes(2);
        expect(listFormFields).toHaveBeenCalledWith(1);
    });
});
