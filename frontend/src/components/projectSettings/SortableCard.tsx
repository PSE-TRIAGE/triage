import {
    CopyCheck,
    Edit,
    GripVertical,
    Hash,
    ListCollapse,
    Star,
    Trash2,
    Type,
} from "lucide-react";
import {useState} from "react";

import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

import {Button} from "../ui/button";
import {Card, CardContent, CardDescription, CardTitle} from "../ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Dialog, DialogContent} from "../ui/dialog";
import {FormFieldForm} from "./FormFieldForm";
import type {FieldType} from "@/api/services/admin-formfield.service";
import {useUpdateFormField} from "@/hooks/mutations/useFormFieldMutations";

interface CardProps {
    id: number;
    label: string;
    type: FieldType;
    projectId: number;
    onDelete: () => void;
}

export const SortableCard = ({
    id,
    label,
    type,
    projectId,
    onDelete,
}: CardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id});

    const style = {
        transition,
        opacity: isDragging ? 0.5 : 1,
        transform: CSS.Transform.toString(transform),
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="flex flex-row items-center justify-between p-5 border border-border mb-3"
        >
            <div className="flex gap-2 w-full">
                <Button
                    {...attributes}
                    {...listeners}
                    variant="ghost"
                    aria-label="Drag to reorder"
                    className="text-muted-foreground hover:bg-muted cursor-pointer"
                >
                    <GripVertical />
                </Button>

                <div className="space-y-2 w-full">
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        {getCardIcon(type)}
                        {label}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        {type}
                    </CardDescription>
                </div>
            </div>
            <CardContent className="flex flex-row gap-2">
                <EditFieldButton
                    fieldId={id}
                    label={label}
                    type={type}
                    projectId={projectId}
                />
                <DeleteFieldButton onDelete={onDelete} />
            </CardContent>
        </Card>
    );
};

function EditFieldButton({
    fieldId,
    label,
    type,
    projectId,
}: {
    fieldId: number;
    label: string;
    type: FieldType;
    projectId: number;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const updateMutation = useUpdateFormField(projectId);

    const editField = (data: {label: string; type: FieldType}) => {
        updateMutation.mutate(
            {fieldId, data: {label: data.label, type: data.type}},
            {onSuccess: () => setIsOpen(false)},
        );
    };

    return (
        <>
            <Button
                variant="ghost"
                onClick={() => setIsOpen(true)}
                className="font-semibold hover:bg-secondary"
            >
                <Edit className="h-4 w-4" />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <FormFieldForm
                        mode="edit"
                        initialValues={{name: label, fieldType: type}}
                        onSubmit={editField}
                        onCancel={() => setIsOpen(false)}
                        isPending={updateMutation.isPending}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

function DeleteFieldButton({onDelete}: {onDelete: () => void}) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="text-destructive font-semibold hover:bg-destructive/10"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="mb-8">
                        This action cannot be undone. This will permanently
                        delete all collected reviews from this form value and
                        remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer border-border hover:bg-secondary-foreground">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onDelete}
                        className="cursor-pointer bg-destructive hover:bg-destructive/70 text-destructive-foreground"
                    >
                        Yes, delete this form value
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

const getCardIcon = (type: FieldType) => {
    switch (type) {
        case "rating":
            return <Star className="h-6 w-6 text-orange-200" />;
        case "integer":
            return <Hash className="h-6 w-6 text-primary" />;
        case "text":
            return <Type className="h-6 w-6" />;
        case "checkbox":
            return <CopyCheck className="h-6 w-6 text-success" />;
        default:
            return <ListCollapse className="h-6 w-6" />;
    }
};
