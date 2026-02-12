import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {queryClient, queryKeys} from "@/lib/queryClient";
import {useServices} from "@/api/ServiceProvider";
import type {CreateFormFieldRequest, FormField, UpdateFormFieldRequest} from "@/api/services/admin-formfield.service";

type UpdateFormFieldParams = {
    fieldId: number;
    data: UpdateFormFieldRequest;
};

export function useCreateFormField(projectId: number) {
    const {adminFormFieldService} = useServices();

    return useMutation({
        mutationFn: (data: CreateFormFieldRequest) =>
            adminFormFieldService.createFormField(projectId, data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.formFields.byProject(projectId),
            });
            toast.success("Field created successfully");
        },

        onError: (error) => {
            console.error("Create form field failed:", error);
            toast.error("Failed to create field, error occured");
        },
    });
}

export function useDeleteFormField(projectId: number) {
    const {adminFormFieldService} = useServices();

    return useMutation({
        mutationFn: (fieldId: number) =>
            adminFormFieldService.deleteFormField(projectId, fieldId),

        onSuccess: (_data, fieldId) => {
            queryClient.setQueryData<FormField[]>(
                queryKeys.formFields.byProject(projectId),
                (oldFields) => oldFields?.filter((f) => f.id !== fieldId) ?? [],
            );
            queryClient.invalidateQueries({
                queryKey: queryKeys.formFields.byProject(projectId),
            });
            toast.success("Field deleted successfully");
        },

        onError: (error) => {
            console.error("Delete form field failed:", error);
            toast.error("Failed to delete field");
        },
    });
}

export function useUpdateFormField(projectId: number) {
    const {adminFormFieldService} = useServices();

    return useMutation({
        mutationFn: ({fieldId, data}: UpdateFormFieldParams) =>
            adminFormFieldService.updateFormField(projectId, fieldId, data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.formFields.byProject(projectId),
            });
            toast.success("Field updated successfully");
        },

        onError: (error) => {
            console.error("Update form field failed:", error);
            toast.error("Failed to update field");
        },
    });
}

export function useReorderFormFields(projectId: number) {
    const {adminFormFieldService} = useServices();

    return useMutation({
        mutationFn: (fieldIds: number[]) =>
            adminFormFieldService.reorderFormFields(projectId, fieldIds),

        onSuccess: (updatedFields) => {
            queryClient.setQueryData(
                queryKeys.formFields.byProject(projectId),
                updatedFields,
            );
        },

        onError: (error) => {
            console.error("Reorder form fields failed:", error);
            toast.error("Failed to reorder fields");
            queryClient.invalidateQueries({
                queryKey: queryKeys.formFields.byProject(projectId),
            });
        },
    });
}
