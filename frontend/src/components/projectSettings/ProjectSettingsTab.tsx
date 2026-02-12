import {useState} from "react";
import {Button} from "../ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {AlertTriangle} from "lucide-react";
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
} from "../ui/alert-dialog";
import {toast} from "sonner";
import {InputGroup} from "@/components/form/InputGroup";
import {
    useDeleteProject,
    useRenameProject,
} from "@/hooks/mutations/useProjectMutations";
import {useRouteContext} from "@tanstack/react-router";
import {ApiError} from "@/api/client";

export function ProjectSettingsTab() {
    return (
        <div className="space-y-6">
            <RenameProject />
            <DeleteProject />
        </div>
    );
}

function RenameProject() {
    const {project} = useRouteContext({from: "/_auth/project/$projectId"});
    const renameProjectMutation = useRenameProject();
    const [projectName, setProjectName] = useState(project.name);
    const [savedName, setSavedName] = useState(project.name);
    const [nameError, setNameError] = useState<string | undefined>(undefined);

    const trimmedName = projectName.trim();
    const isUnchanged = trimmedName === savedName;
    const isLoading = renameProjectMutation.isPending;

    const handleRename = async () => {
        if (!trimmedName) {
            setNameError("Please enter a project name.");
            return;
        }
        if (isUnchanged) {
            return;
        }

        setNameError(undefined);

        try {
            await renameProjectMutation.mutateAsync({
                projectId: project.id,
                name: trimmedName,
            });
            setProjectName(trimmedName);
            setSavedName(trimmedName);
            toast.success("Project renamed successfully!");
        } catch (error) {
            if (error instanceof ApiError && error.status === 409) {
                setNameError(
                    "A project with this name already exists. Please choose a different name.",
                );
                return;
            }
            console.error("Rename project failed:", error);
            toast.error("Failed to rename project");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-card-foreground">
                    Project Name
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    Change the display name of this project
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <InputGroup
                            label="Name"
                            type="text"
                            value={projectName}
                            onChange={(e) => {
                                setProjectName(e.target.value);
                                if (nameError) {
                                    setNameError(undefined);
                                }
                            }}
                            error={nameError}
                        />
                    </div>
                    <Button
                        onClick={handleRename}
                        disabled={isLoading || isUnchanged || !trimmedName}
                        className="bg-primary hover:bg-primary/70"
                    >
                        {isLoading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function DeleteProject() {
    const deleteProjectMutation = useDeleteProject();
    const {project} = useRouteContext({from: "/_auth/project/$projectId"});

    const handleDelete = () => {
        deleteProjectMutation.mutate(project.id);
    };

    return (
        <Card className="border-destructive">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <CardTitle className="text-destructive">
                        Danger Zone
                    </CardTitle>
                </div>
                <CardDescription>
                    Irreversible actions for this project
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
                    <div>
                        <p className="text-sm text-destructive">
                            Delete this project
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            This will permanently delete all data, reviews, and
                            files
                        </p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                className="bg-destructive hover:bg-destructive/70"
                                disabled={deleteProjectMutation.isPending}
                            >
                                {deleteProjectMutation.isPending
                                    ? "Deleting..."
                                    : "Delete Project"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the project and remove
                                    all associated data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="cursor-pointer bg-destructive hover:bg-destructive/70"
                                    disabled={deleteProjectMutation.isPending}
                                >
                                    {deleteProjectMutation.isPending
                                        ? "Deleting..."
                                        : "Delete Project"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}
