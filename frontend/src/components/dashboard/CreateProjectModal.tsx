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
import {
    useCreateProject,
    useUploadSourceCode,
} from "@/hooks/mutations/useProjectMutations";
import {ApiError} from "@/api/client";

interface CreateProjectValues {
    projectName: string;
    mutationFile: FileList;
    sourceCodeFile: FileList;
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
                        Set up a new mutation testing project. Upload the
                        required mutations.xml file and optionally a .zip
                        archive with the project source code.
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
    const uploadSourceMutation = useUploadSourceCode();

    const onSubmit = async (data: CreateProjectValues) => {
        try {
            const file = data.mutationFile[0];

            const project = await createProjectMutation.mutateAsync({
                projectName: data.projectName,
                file,
            });

            const sourceFile = data.sourceCodeFile?.[0];
            if (sourceFile) {
                try {
                    await uploadSourceMutation.mutateAsync({
                        projectId: project.id,
                        file: sourceFile,
                    });
                } catch (sourceError) {
                    console.error("Source code upload failed:", sourceError);
                    const detail =
                        sourceError instanceof ApiError
                            ? (sourceError.data?.detail ??
                              "Unknown error occurred")
                            : "Unknown error occurred";
                    toast.warning(
                        `Project created, but source code upload failed: ${detail}`,
                    );
                    handleClose();
                    return;
                }
            }

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

    const isLoading =
        isSubmitting ||
        createProjectMutation.isPending ||
        uploadSourceMutation.isPending;

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

                <FileInputGroup
                    label="Source Code (.zip)"
                    accept=".zip"
                    disabled={isLoading}
                    description="Optional: Upload project source code"
                    error={errors?.sourceCodeFile?.message}
                    {...register("sourceCodeFile", {
                        validate: {
                            isZip: (files) =>
                                !files?.length ||
                                files[0]?.name.endsWith(".zip") ||
                                "Only .zip files are allowed",
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
