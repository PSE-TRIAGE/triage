import {apiClient} from "../client";
import {API_ENDPOINTS} from "../endpoints";
import {z} from "zod";

const FormFieldValueSchema = z.object({
    id: z.number(),
    form_field_id: z.number(),
    rating_id: z.number(),
    value: z.string(),
});

export type FormFieldValue = z.infer<typeof FormFieldValueSchema>;

const RatingWithValuesSchema = z
    .object({
        id: z.number(),
        mutant_id: z.number(),
        user_id: z.number(),
        field_values: z.array(FormFieldValueSchema),
    })
    .transform((data) => ({
        id: data.id,
        mutantId: data.mutant_id,
        userId: data.user_id,
        fieldValues: data.field_values,
    }));

export type RatingWithValues = z.infer<typeof RatingWithValuesSchema>;

const RatingWithValuesNullableSchema = RatingWithValuesSchema.nullable();

export type FormFieldValueCreate = {
    form_field_id: number;
    value: string;
};

export type RatingWithValuesCreate = {
    field_values: FormFieldValueCreate[];
};

export interface RatingsService {
    getRating(mutantId: number): Promise<RatingWithValues | null>;
    submitRating(
        mutantId: number,
        data: RatingWithValuesCreate,
    ): Promise<RatingWithValues>;
}

export class RatingsServiceImpl implements RatingsService {
    async getRating(mutantId: number): Promise<RatingWithValues | null> {
        const endpoint = API_ENDPOINTS.RATINGS.GET.replace(
            "{mutant_id}",
            mutantId.toString(),
        );
        return apiClient.get(endpoint, RatingWithValuesNullableSchema);
    }

    async submitRating(
        mutantId: number,
        data: RatingWithValuesCreate,
    ): Promise<RatingWithValues> {
        const endpoint = API_ENDPOINTS.RATINGS.SUBMIT.replace(
            "{mutant_id}",
            mutantId.toString(),
        );
        return apiClient.post(endpoint, RatingWithValuesSchema, data);
    }
}
