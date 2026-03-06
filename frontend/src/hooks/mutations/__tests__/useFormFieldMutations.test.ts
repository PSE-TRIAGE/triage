import {act, renderHook, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {createWrapper} from "@/test-utils";
import {queryClient, queryKeys} from "@/lib/queryClient";
import {
    useCreateFormField,
    useDeleteFormField,
    useReorderFormFields,
    useUpdateFormField,
} from "../useFormFieldMutations";

const mocks = vi.hoisted(() => ({
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        success: (...args: unknown[]) => mocks.toastSuccess(...args),
        error: (...args: unknown[]) => mocks.toastError(...args),
    },
}));

function findSetQueryDataCall(
    setQueryDataSpy: {mock: {calls: unknown[][]}},
    queryKey: readonly unknown[],
) {
    return setQueryDataSpy.mock.calls.find(
        ([key]) => JSON.stringify(key) === JSON.stringify(queryKey),
    );
}

describe("useFormFieldMutations", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
        queryClient.clear();
    });

    describe("useCreateFormField", () => {
        it("creates form field, invalidates project fields, and shows success toast", async () => {
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const createFormField = vi.fn().mockResolvedValue({id: 1});
            const wrapper = createWrapper({
                adminFormFieldService: {createFormField} as any,
            });
            const {result} = renderHook(() => useCreateFormField(1), {wrapper});

            await act(async () => {
                result.current.mutate({
                    label: "Field",
                    type: "text",
                    is_required: true,
                });
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(createFormField).toHaveBeenCalledWith(1, {
                label: "Field",
                type: "text",
                is_required: true,
            });
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.formFields.byProject(1),
            });
            expect(mocks.toastSuccess).toHaveBeenCalledWith(
                "Field created successfully",
            );
        });

        it("shows error toast when create form field fails", async () => {
            const createFormField = vi
                .fn()
                .mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                adminFormFieldService: {createFormField} as any,
            });
            const {result} = renderHook(() => useCreateFormField(1), {wrapper});

            await act(async () => {
                result.current.mutate({
                    label: "Field",
                    type: "text",
                    is_required: true,
                });
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(mocks.toastError).toHaveBeenCalledWith(
                "Failed to create field, error occured",
            );
        });
    });

    describe("useDeleteFormField", () => {
        it("removes field from cache, invalidates, and shows success toast", async () => {
            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const deleteFormField = vi.fn().mockResolvedValue(undefined);
            const wrapper = createWrapper({
                adminFormFieldService: {deleteFormField} as any,
            });
            const {result} = renderHook(() => useDeleteFormField(1), {wrapper});

            await act(async () => {
                result.current.mutate(2);
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(deleteFormField).toHaveBeenCalledWith(1, 2);

            const fieldsCall = findSetQueryDataCall(
                setQueryDataSpy,
                queryKeys.formFields.byProject(1),
            );
            expect(fieldsCall).toBeDefined();
            const fieldsUpdater = fieldsCall?.[1] as
                | ((
                      fields: Array<{id: number; label: string}>,
                  ) => Array<{id: number; label: string}>)
                | undefined;
            expect(
                fieldsUpdater?.([
                    {id: 1, label: "A"},
                    {id: 2, label: "B"},
                ]),
            ).toEqual([{id: 1, label: "A"}]);

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.formFields.byProject(1),
            });
            expect(mocks.toastSuccess).toHaveBeenCalledWith(
                "Field deleted successfully",
            );
        });

        it("shows error toast when delete form field fails", async () => {
            const deleteFormField = vi
                .fn()
                .mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                adminFormFieldService: {deleteFormField} as any,
            });
            const {result} = renderHook(() => useDeleteFormField(1), {wrapper});

            await act(async () => {
                result.current.mutate(2);
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(mocks.toastError).toHaveBeenCalledWith(
                "Failed to delete field",
            );
        });
    });

    describe("useUpdateFormField", () => {
        it("updates field and invalidates project fields query", async () => {
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const updateFormField = vi.fn().mockResolvedValue({id: 1});
            const wrapper = createWrapper({
                adminFormFieldService: {updateFormField} as any,
            });
            const {result} = renderHook(() => useUpdateFormField(1), {wrapper});

            await act(async () => {
                result.current.mutate({
                    fieldId: 2,
                    data: {label: "Updated"},
                });
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(updateFormField).toHaveBeenCalledWith(1, 2, {
                label: "Updated",
            });
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.formFields.byProject(1),
            });
            expect(mocks.toastSuccess).toHaveBeenCalledWith(
                "Field updated successfully",
            );
        });

        it("shows error toast when update form field fails", async () => {
            const updateFormField = vi
                .fn()
                .mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                adminFormFieldService: {updateFormField} as any,
            });
            const {result} = renderHook(() => useUpdateFormField(1), {wrapper});

            await act(async () => {
                result.current.mutate({
                    fieldId: 2,
                    data: {label: "Updated"},
                });
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(mocks.toastError).toHaveBeenCalledWith(
                "Failed to update field",
            );
        });
    });

    describe("useReorderFormFields", () => {
        it("writes returned field order to cache on success", async () => {
            const updatedFields = [
                {
                    id: 2,
                    projectId: 1,
                    label: "B",
                    type: "text",
                    isRequired: false,
                    position: 0,
                },
                {
                    id: 1,
                    projectId: 1,
                    label: "A",
                    type: "text",
                    isRequired: false,
                    position: 1,
                },
            ];
            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
            const reorderFormFields = vi.fn().mockResolvedValue(updatedFields);
            const wrapper = createWrapper({
                adminFormFieldService: {reorderFormFields} as any,
            });
            const {result} = renderHook(() => useReorderFormFields(1), {
                wrapper,
            });

            await act(async () => {
                result.current.mutate([2, 1]);
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(reorderFormFields).toHaveBeenCalledWith(1, [2, 1]);
            expect(setQueryDataSpy).toHaveBeenCalledWith(
                queryKeys.formFields.byProject(1),
                updatedFields,
            );
        });

        it("shows error toast and invalidates fields query when reorder fails", async () => {
            const invalidateQueriesSpy = vi
                .spyOn(queryClient, "invalidateQueries")
                .mockResolvedValue(undefined);
            const reorderFormFields = vi
                .fn()
                .mockRejectedValue(new Error("fail"));
            const wrapper = createWrapper({
                adminFormFieldService: {reorderFormFields} as any,
            });
            const {result} = renderHook(() => useReorderFormFields(1), {
                wrapper,
            });

            await act(async () => {
                result.current.mutate([2, 1]);
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(mocks.toastError).toHaveBeenCalledWith(
                "Failed to reorder fields",
            );
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.formFields.byProject(1),
            });
        });
    });
});
