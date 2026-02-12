import {useId} from "react";
import {Controller, useForm} from "react-hook-form";

import {Button} from "../ui/button";
import {LoadingButton} from "../ui/LoadingButton";
import {InputGroup} from "../form/InputGroup";
import {Label} from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import type {FieldType} from "@/api/services/admin-formfield.service";

const FIELD_TYPES = [
    {value: "rating", label: "Rating"},
    {value: "checkbox", label: "Checkbox"},
    {value: "text", label: "Text"},
    {value: "integer", label: "Integer"},
] as const;

interface FormFieldFormValues {
    name: string;
    fieldType: FieldType;
}

interface FormFieldFormProps {
    mode: "create" | "edit";
    initialValues?: {name: string; fieldType: FieldType};
    onSubmit: (data: {label: string; type: FieldType}) => void;
    onCancel: () => void;
    isPending: boolean;
}

export function FormFieldForm({
    mode,
    initialValues,
    onSubmit,
    onCancel,
    isPending,
}: FormFieldFormProps) {
    const selectId = useId();

    const {
        register,
        control,
        handleSubmit,
        formState: {errors},
    } = useForm<FormFieldFormValues>({
        defaultValues: initialValues,
    });

    const handleFormSubmit = (data: FormFieldFormValues) => {
        onSubmit({label: data.name, type: data.fieldType});
    };

    const isEditMode = mode === "edit";
    const title = isEditMode ? "Edit Field" : "Add a new Field";
    const submitLabel = isEditMode ? "Save Changes" : "Add Field";
    const loadingText = isEditMode ? "Saving..." : "Adding...";

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                    Configure the field properties for the review form
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
                <InputGroup
                    label="name"
                    placeholder="e.g., Usefulness"
                    showRequired={true}
                    error={errors.name?.message}
                    {...register("name", {
                        required: "Form field name is required",
                        minLength: {
                            value: 3,
                            message:
                                "Names must consist of at least 3 characters",
                        },
                    })}
                />

                <div className="space-y-2">
                    <Label htmlFor={selectId} className="text-sm font-medium">
                        Field Type
                        <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Controller
                        name="fieldType"
                        control={control}
                        rules={{required: "Please select a field type"}}
                        render={({field}) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger
                                    className={`w-full cursor-pointer ${
                                        errors.fieldType && "border-destructive"
                                    }`}
                                >
                                    <SelectValue placeholder="Select a field type" />
                                </SelectTrigger>
                                <SelectContent
                                    position="popper"
                                    className="w-full bg-card"
                                >
                                    {FIELD_TYPES.map((type) => (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                            className="hover:bg-secondary cursor-pointer"
                                        >
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.fieldType && (
                        <p className="text-sm text-destructive">
                            {errors.fieldType.message}
                        </p>
                    )}
                </div>
            </div>

            <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <LoadingButton
                    type="submit"
                    loadingText={loadingText}
                    loading={isPending}
                    disabled={isPending}
                    className={
                        isEditMode
                            ? "bg-primary hover:bg-primary/90"
                            : "bg-success hover:bg-success/70"
                    }
                >
                    {submitLabel}
                </LoadingButton>
            </DialogFooter>
        </form>
    );
}
