import type {FormField} from "@/api/services/admin-formfield.service";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Controller, useForm} from "react-hook-form";
import {useEffect} from "react";

import {InputGroup} from "../form/InputGroup";
import {TextareaInputGroup} from "../form/TextareaInputGroup";
import {CheckBoxInputGroup} from "../form/CheckBoxInputGroup";
import {StarRatingInputGroup} from "../form/StarRatingInputGroup";
import {LoadingButton} from "../ui/LoadingButton";

import {useMutantStore} from "@/stores/mutantStore";
import {useRating} from "@/hooks/queries/useRatingQueries";
import {useSubmitRating} from "@/hooks/mutations/useRatingMutations";

interface ReviewFormValues {
    [key: string]: string | number | boolean;
}

interface ReviewFormPanelProps {
    projectId: number;
    formFields: FormField[];
}

function getEmptyFormValues(formFields: FormField[]): ReviewFormValues {
    const values: ReviewFormValues = {};
    formFields.forEach((field) => {
        const key = field.id.toString();
        switch (field.type) {
            case "checkbox":
                values[key] = false;
                break;
            case "integer":
            case "rating":
                values[key] = "";
                break;
            case "text":
            default:
                values[key] = "";
                break;
        }
    });
    return values;
}

export function ReviewFormPanel({projectId, formFields}: ReviewFormPanelProps) {
    const {
        register,
        control,
        reset,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<ReviewFormValues>();

    const selectedMutant = useMutantStore((state) => state.selectedMutant);
    const markMutantAsRated = useMutantStore(
        (state) => state.markMutantAsRated,
    );

    const {data: existingRating} = useRating(selectedMutant?.id);
    const submitRatingMutation = useSubmitRating(projectId);

    // Keep form values aligned with the selected mutant + its rating (if any)
    useEffect(() => {
        const emptyValues = getEmptyFormValues(formFields);

        const hasValidRating =
            selectedMutant &&
            existingRating &&
            existingRating.mutantId === selectedMutant.id &&
            existingRating.fieldValues.length > 0;

        if (!hasValidRating) {
            reset(emptyValues);
            return;
        }

        const typeConverters: Record<
            string,
            (v: string) => string | number | boolean
        > = {
            checkbox: (v) => v === "true",
            integer: (v) => Number(v),
            rating: (v) => Number(v),
        };

        const formValues = existingRating.fieldValues.reduce(
            (acc, fv) => {
                const field = formFields.find((f) => f.id === fv.form_field_id);
                if (field) {
                    const converter =
                        typeConverters[field.type] ?? ((v: string) => v);
                    acc[fv.form_field_id.toString()] = converter(fv.value);
                }
                return acc;
            },
            {...emptyValues},
        );

        reset(formValues);
    }, [selectedMutant, selectedMutant?.id, existingRating, reset, formFields]);

    const onSubmit = async (data: ReviewFormValues) => {
        if (!selectedMutant) return;

        const fieldValues = Object.entries(data)
            .filter(([_, value]) => value !== undefined && value !== "")
            .map(([fieldId, value]) => ({
                form_field_id: Number(fieldId),
                value: String(value),
            }));

        await submitRatingMutation.mutateAsync({
            mutantId: selectedMutant.id,
            data: {field_values: fieldValues},
        });

        markMutantAsRated(selectedMutant.id);
    };

    const renderField = (field: FormField) => {
        const fieldName = field.id.toString();

        switch (field.type) {
            case "rating":
                return (
                    <Controller
                        control={control}
                        name={fieldName}
                        rules={{
                            required: field.isRequired
                                ? `${field.label} is required`
                                : false,
                        }}
                        render={({field: {onChange, value}}) => (
                            <StarRatingInputGroup
                                label={field.label}
                                showRequired={field.isRequired}
                                error={errors[field.id]?.message as string}
                                value={Number(value) || 0}
                                onValueChange={onChange}
                            />
                        )}
                    />
                );

            case "checkbox":
                return (
                    <CheckBoxInputGroup
                        label={field.label}
                        showRequired={field.isRequired}
                        error={errors[field.id]?.message as string}
                        {...register(fieldName)}
                    />
                );

            case "text":
                return (
                    <TextareaInputGroup
                        label={field.label}
                        showRequired={field.isRequired}
                        error={errors[field.id]?.message as string}
                        {...register(fieldName, {required: field.isRequired})}
                    />
                );

            case "integer":
                return (
                    <InputGroup
                        label={field.label}
                        type="number"
                        showRequired={field.isRequired}
                        error={errors[field.id]?.message as string}
                        {...register(fieldName, {
                            required: field.isRequired,
                            valueAsNumber: true,
                        })}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Card className="h-full min-h-0">
            <CardHeader className="px-4 border-b border-border">
                <CardTitle className="text-foreground">Review Panel</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-7 h-full mt-1"
                >
                    {formFields
                        .sort((a, b) => a.position - b.position)
                        .map((field) => (
                            <div key={field.id}>{renderField(field)}</div>
                        ))}

                    <LoadingButton
                        type="submit"
                        loading={isSubmitting || submitRatingMutation.isPending}
                        loadingText="Submitting..."
                        disabled={
                            isSubmitting || submitRatingMutation.isPending
                        }
                        className="mt-6 w-full px-4 py-3 bg-success hover:bg-success/70 text-success-foreground rounded-lg"
                    >
                        {existingRating ? "Update Review" : "Submit Review"}
                    </LoadingButton>
                </form>
            </CardContent>
        </Card>
    );
}
