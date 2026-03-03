import {describe, expect, it, vi} from "vitest";
import {renderHook, waitFor, act} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {
	useCreateFormField,
	useDeleteFormField,
	useUpdateFormField,
	useReorderFormFields,
} from "../useFormFieldMutations";

describe("useCreateFormField", () => {
	it("calls adminFormFieldService.createFormField", async () => {
		const createFormField = vi.fn().mockResolvedValue({id: 1});
		const wrapper = createWrapper({adminFormFieldService: {createFormField} as any});

		const {result} = renderHook(() => useCreateFormField(1), {wrapper});

		await act(async () => {
			result.current.mutate({label: "Field", type: "text", order: 1});
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(createFormField).toHaveBeenCalledWith(1, {label: "Field", type: "text", order: 1});
	});

	it("handles error", async () => {
		const createFormField = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({adminFormFieldService: {createFormField} as any});

		const {result} = renderHook(() => useCreateFormField(1), {wrapper});

		await act(async () => {
			result.current.mutate({label: "Field", type: "text", order: 1});
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useDeleteFormField", () => {
	it("calls adminFormFieldService.deleteFormField", async () => {
		const deleteFormField = vi.fn().mockResolvedValue(undefined);
		const wrapper = createWrapper({adminFormFieldService: {deleteFormField} as any});

		const {result} = renderHook(() => useDeleteFormField(1), {wrapper});

		await act(async () => {
			result.current.mutate(2);
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(deleteFormField).toHaveBeenCalledWith(1, 2);
	});

	it("handles error", async () => {
		const deleteFormField = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({adminFormFieldService: {deleteFormField} as any});

		const {result} = renderHook(() => useDeleteFormField(1), {wrapper});

		await act(async () => {
			result.current.mutate(2);
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useUpdateFormField", () => {
	it("calls adminFormFieldService.updateFormField", async () => {
		const updateFormField = vi.fn().mockResolvedValue({id: 1});
		const wrapper = createWrapper({adminFormFieldService: {updateFormField} as any});

		const {result} = renderHook(() => useUpdateFormField(1), {wrapper});

		await act(async () => {
			result.current.mutate({fieldId: 2, data: {label: "Updated"}});
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(updateFormField).toHaveBeenCalledWith(1, 2, {label: "Updated"});
	});

	it("handles error", async () => {
		const updateFormField = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({adminFormFieldService: {updateFormField} as any});

		const {result} = renderHook(() => useUpdateFormField(1), {wrapper});

		await act(async () => {
			result.current.mutate({fieldId: 2, data: {label: "Updated"}});
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});

describe("useReorderFormFields", () => {
	it("calls adminFormFieldService.reorderFormFields", async () => {
		const reorderFormFields = vi.fn().mockResolvedValue([{id: 1}, {id: 2}]);
		const wrapper = createWrapper({adminFormFieldService: {reorderFormFields} as any});

		const {result} = renderHook(() => useReorderFormFields(1), {wrapper});

		await act(async () => {
			result.current.mutate([2, 1]);
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(reorderFormFields).toHaveBeenCalledWith(1, [2, 1]);
	});

	it("handles error", async () => {
		const reorderFormFields = vi.fn().mockRejectedValue(new Error("fail"));
		const wrapper = createWrapper({adminFormFieldService: {reorderFormFields} as any});

		const {result} = renderHook(() => useReorderFormFields(1), {wrapper});

		await act(async () => {
			result.current.mutate([2, 1]);
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});
