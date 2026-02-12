import {z} from "zod";
import {apiClient} from "../client";
import {API_ENDPOINTS} from "../endpoints";

const FieldTypeSchema = z.enum(["rating", "checkbox", "text", "integer"]);

export type FieldType = z.infer<typeof FieldTypeSchema>;

const FormFieldSchema = z
    .object({
        id: z.number(),
        project_id: z.number(),
        label: z.string(),
        type: FieldTypeSchema,
        is_required: z.boolean(),
        position: z.number(),
    })
    .transform((data) => ({
        id: data.id,
        projectId: data.project_id,
        label: data.label,
        type: data.type,
        isRequired: data.is_required,
        position: data.position,
    }));

export type FormField = z.infer<typeof FormFieldSchema>;

const FormFieldArraySchema = z.array(FormFieldSchema);

export type CreateFormFieldRequest = {
    label: string;
    type: FieldType;
    is_required?: boolean;
};

export type UpdateFormFieldRequest = {
    label?: string;
    type?: FieldType;
    is_required?: boolean;
    position?: number;
};

export interface AdminFormFieldService {
    listFormFields(projectId: number): Promise<FormField[]>;
    createFormField(
        projectId: number,
        data: CreateFormFieldRequest,
    ): Promise<FormField>;
    updateFormField(
        projectId: number,
        fieldId: number,
        data: UpdateFormFieldRequest,
    ): Promise<FormField>;
    deleteFormField(projectId: number, fieldId: number): Promise<void>;
    reorderFormFields(
        projectId: number,
        fieldIds: number[],
    ): Promise<FormField[]>;
}

export class AdminFormFieldServiceImpl implements AdminFormFieldService {
    async listFormFields(projectId: number): Promise<FormField[]> {
        const endpoint = API_ENDPOINTS.PROJECTS.LIST_FORM_FIELDS.replace(
            "{project_id}",
            projectId.toString(),
        );
        return apiClient.get(endpoint, FormFieldArraySchema);
    }

    async createFormField(
        projectId: number,
        data: CreateFormFieldRequest,
    ): Promise<FormField> {
        const endpoint = API_ENDPOINTS.ADMIN.FORM_FIELDS.CREATE.replace(
            "{project_id}",
            projectId.toString(),
        );

        return apiClient.post(endpoint, FormFieldSchema, data);
    }

    async updateFormField(
        projectId: number,
        fieldId: number,
        data: UpdateFormFieldRequest,
    ): Promise<FormField> {
        const endpoint = API_ENDPOINTS.ADMIN.FORM_FIELDS.UPDATE.replace(
            "{field_id}",
            fieldId.toString(),
        ).replace("{project_id}", projectId.toString());

        return apiClient.put(endpoint, FormFieldSchema, data);
    }

    async deleteFormField(projectId: number, fieldId: number): Promise<void> {
        const endpoint = API_ENDPOINTS.ADMIN.FORM_FIELDS.DELETE.replace(
            "{field_id}",
            fieldId.toString(),
        ).replace("{project_id}", projectId.toString());

        await apiClient.delete(endpoint, z.object({success: z.boolean()}));
    }

    async reorderFormFields(
        projectId: number,
        fieldIds: number[],
    ): Promise<FormField[]> {
        const endpoint = API_ENDPOINTS.ADMIN.FORM_FIELDS.REORDER.replace(
            "{project_id}",
            projectId.toString(),
        );

        return apiClient.patch(endpoint, FormFieldArraySchema, fieldIds);
    }
}
