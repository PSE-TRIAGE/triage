import {useState} from "react";
import {useRouteContext} from "@tanstack/react-router";
import {toast} from "sonner";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {LoadingButton} from "../ui/LoadingButton";
import {ApiError} from "@/api/client";
import type {AlgorithmInfo} from "@/api/services/algorithms.service";
import {useApplyAlgorithm} from "@/hooks/mutations/useApplyAlgorithm";
import {useAlgorithms} from "@/hooks/queries/useAlgorithms";

export function AlgorithmSettingsTab() {
    const {project} = useRouteContext({
        from: "/_auth/project/$projectId/project-settings",
    });
    const {data: algorithms = [], isLoading, error} = useAlgorithms();
    const applyAlgorithm = useApplyAlgorithm(project.id);
    const [selectedAlgorithmId, setSelectedAlgorithmId] = useState<
        string | null
    >(null);
    const [pendingAlgorithmId, setPendingAlgorithmId] = useState<string | null>(
        null,
    );

    const handleSelect = async (algorithm: AlgorithmInfo) => {
        setPendingAlgorithmId(algorithm.id);
        try {
            const response = await applyAlgorithm.mutateAsync(algorithm.id);
            setSelectedAlgorithmId(algorithm.id);
            toast.success(
                response?.message ?? `${algorithm.name} successfully selected!`,
            );
        } catch (applyError) {
            console.error("Failed to apply algorithm:", applyError);
            if (applyError instanceof ApiError) {
                if (applyError.status === 403) {
                    toast.error("You don't have access to apply algorithms.");
                    return;
                }
                if (applyError.status === 404) {
                    toast.error("Algorithm not found.");
                    return;
                }
                toast.error(
                    applyError.data?.detail ?? "Failed to apply algorithm",
                );
                return;
            }
            toast.error("Failed to apply algorithm");
        } finally {
            setPendingAlgorithmId(null);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-card-foreground">
                        Sorting Algorithm
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Choose the mutation sorting algorithm for an optimal
                        developer experience.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <div className="text-sm text-muted-foreground">
                            Loading algorithms...
                        </div>
                    ) : error ? (
                        <div className="text-sm text-destructive">
                            Failed to load algorithms. Please try again.
                        </div>
                    ) : algorithms.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            No algorithms available yet.
                        </div>
                    ) : (
                        algorithms.map((algorithm) => {
                            const isPending =
                                applyAlgorithm.isPending &&
                                pendingAlgorithmId === algorithm.id;
                            const isSelected =
                                selectedAlgorithmId === algorithm.id;

                            return (
                                <Card key={algorithm.id}>
                                    <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1">
                                            <p className="font-medium text-card-foreground">
                                                {algorithm.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {algorithm.description}
                                            </p>
                                        </div>
                                        <LoadingButton
                                            type="button"
                                            onClick={() =>
                                                handleSelect(algorithm)
                                            }
                                            className="bg-primary hover:bg-primary/70"
                                            loading={isPending}
                                            loadingText="Applying..."
                                            disabled={
                                                isSelected ||
                                                (applyAlgorithm.isPending &&
                                                    pendingAlgorithmId !==
                                                        algorithm.id)
                                            }
                                        >
                                            {isSelected ? "Selected" : "Select"}
                                        </LoadingButton>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
