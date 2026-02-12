import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {SortableCard} from "@/components/projectSettings/SortableCard";
import {FormFieldForm} from "@/components/projectSettings/FormFieldForm";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {Dialog, DialogContent} from "../ui/dialog";
import {Button} from "../ui/button";
import {useEffect, useState} from "react";
import {useRouteContext} from "@tanstack/react-router";
import type {FormField} from "@/api/services/admin-formfield.service";
import {useFormFields} from "@/hooks/queries/useFormFieldQueries";
import {
    useCreateFormField,
    useDeleteFormField,
    useReorderFormFields,
} from "@/hooks/mutations/useFormFieldMutations";

export function FormBuilderTab() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [localFields, setLocalFields] = useState<FormField[]>([]);
    const {project} = useRouteContext({
        from: "/_auth/project/$projectId/project-settings",
    });

    const {data: formFields = [], isLoading} = useFormFields(project.id);
    const createMutation = useCreateFormField(project.id);
    const reorderMutation = useReorderFormFields(project.id);
    const deleteMutation = useDeleteFormField(project.id);

    useEffect(() => {
        const sorted = [...formFields].sort((a, b) => a.position - b.position);
        setLocalFields(sorted);
    }, [formFields]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            const oldIndex = localFields.findIndex(
                (item) => item.id === active.id,
            );
            const newIndex = localFields.findIndex(
                (item) => item.id === over.id,
            );
            const reordered = arrayMove(localFields, oldIndex, newIndex);
            setLocalFields(reordered);
            reorderMutation.mutate(reordered.map((f) => f.id));
        }
    };

    const createField = (data: {label: string; type: string}) => {
        createMutation.mutate(
            {
                label: data.label,
                type: data.type as FormField["type"],
                is_required: false,
            },
            {onSuccess: () => setIsDialogOpen(false)},
        );
    };

    if (isLoading) {
        return (
            <div className="text-muted-foreground">Loading form fields...</div>
        );
    }

    return (
        <div>
            <Card className="mb-10">
                <CardHeader>
                    <CardTitle className="text-card-foreground">
                        Review Form Builder
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Customize the form that developers will use to review
                        mutants. Drag fields to reorder them.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        className="w-full font-semibold"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <span>+</span>
                        Add new Field
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="sm:max-w-[500px] bg-card">
                            <FormFieldForm
                                mode="create"
                                onSubmit={createField}
                                onCancel={() => setIsDialogOpen(false)}
                                isPending={createMutation.isPending}
                            />
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={localFields}
                    strategy={verticalListSortingStrategy}
                >
                    {localFields.map((item) => (
                        <SortableCard
                            key={item.id}
                            id={item.id}
                            label={item.label}
                            type={item.type}
                            projectId={project.id}
                            onDelete={() => deleteMutation.mutate(item.id)}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
}
