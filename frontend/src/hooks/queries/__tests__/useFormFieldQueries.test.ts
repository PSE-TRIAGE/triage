import {describe, expect, it, vi, beforeEach} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useFormFields} from "../useFormFieldQueries";

describe("useFormFields", () => {
	beforeEach(() => {
		localStorage.setItem("auth_token", "test-token");
	});

	it("calls adminFormFieldService.listFormFields", async () => {
		const listFormFields = vi.fn().mockResolvedValue([{id: 1, label: "Field"}]);
		const wrapper = createWrapper({adminFormFieldService: {listFormFields} as any});

		const {result} = renderHook(() => useFormFields(1), {wrapper});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(listFormFields).toHaveBeenCalledWith(1);
	});
});
