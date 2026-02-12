import {useForm} from "react-hook-form";
import {toast} from "sonner";

import {InputGroup} from "@/components/form/InputGroup";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {LoadingButton} from "@/components/ui/LoadingButton";
import {FileInputGroup} from "@/components/form/FileInputGroup";
import {useCreateProject} from "@/hooks/mutations/useProjectMutations";
import {ApiError} from "@/api/client";

interface CreateProjectValues {
    projectName: string;
    mutationFile: FileList;
}

interface CreateProjectModalProps {
    open: boolean;
    handleClose: () => void;
}

export function CreateProjectModal({
    open,
    handleClose,
}: CreateProjectModalProps) {
    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] bg-card">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Set up a new mutation testing project. You can only
                        upload the mutations.xml file now. Later updates of the
                        mutations.xml file are not possible.
                    </DialogDescription>
                </DialogHeader>

                <CreationForm handleClose={handleClose} />
            </DialogContent>
        </Dialog>
    );
}

function CreationForm({handleClose}: {handleClose: () => void}) {
    const {
        register,
        handleSubmit,
        setError,
        formState: {errors, isSubmitting},
    } = useForm<CreateProjectValues>();

    const createProjectMutation = useCreateProject();

    const onSubmit = async (data: CreateProjectValues) => {
        try {
            const file = data.mutationFile[0];

            await createProjectMutation.mutateAsync({
                projectName: data.projectName,
                file,
            });

            toast.success("Project was created successfully!");
            handleClose();
        } catch (error) {
            console.error("This error occurred during project creation", error);

            if (!(error instanceof ApiError)) {
                return;
            }
            if (error?.status === 409) {
                setError("projectName", {
                    type: "manual",
                    message:
                        "A project with this name already exists. Please choose a different name.",
                });
            } else if (error?.status === 400) {
                toast.error(
                    error?.data?.detail ||
                        "Invalid project data. Please check your input.",
                );
            } else {
                toast.error("Failed to create project. Please try again.");
            }
        }
    };

    const isLoading = isSubmitting || createProjectMutation.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6 py-4">
                <InputGroup
                    label="Project Name"
                    placeholder="e.g., Team 1 - Calculator"
                    disabled={isLoading}
                    showRequired={true}
                    error={errors.projectName?.message}
                    {...register("projectName", {
                        required: "Project name is required",
                        minLength: {
                            value: 3,
                            message:
                                "Names must consist of at least 3 characters",
                        },
                    })}
                />

                <FileInputGroup
                    label="mutations.xml File"
                    accept=".xml"
                    disabled={isLoading}
                    showRequired={true}
                    error={errors?.mutationFile?.message}
                    {...register("mutationFile", {
                        required: "Please upload a mutations.xml file",
                        validate: {
                            isXml: (files) =>
                                files[0]?.name.endsWith(".xml") ||
                                "Only XML files are allowed",
                        },
                    })}
                />
            </div>

            <DialogFooter className="gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="border-border"
                >
                    Cancel
                </Button>
                <LoadingButton
                    type="submit"
                    disabled={isLoading}
                    loading={isLoading}
                    loadingText="Creating..."
                    className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                >
                    Create Project
                </LoadingButton>
            </DialogFooter>
        </form>
    );
}
