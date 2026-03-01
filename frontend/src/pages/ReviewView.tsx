import {MutationListPanel} from "@/components/review/MutationListPanel";
import {DetailPanel} from "@/components/review/DetailPanel";
import {ReviewFormPanel} from "@/components/review/ReviewFormPanel";
import {AlertTriangle, ArrowLeft, Loader2} from "lucide-react";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import {Button} from "@/components/ui/button";
import {useNavigate} from "@tanstack/react-router";
import {useMutantStore} from "@/stores/mutantStore";
import React from "react";
import {useProjectMutants} from "@/hooks/queries/useMutantQueries";
import {useFormFields} from "@/hooks/queries/useFormFieldQueries";
import {Route} from "@/routes/_auth/project/$projectId/review";

export function ReviewView() {
    const {project} = Route.useRouteContext();
    const projectId = project.id;

    const {
        selectedMutant,
        setMutants,
        setSelectedMutant,
        setProjectId,
        setIsLoading,
    } = useMutantStore();

    const {
        data: mutants,
        isLoading: mutantsLoading,
        error: mutantsError,
    } = useProjectMutants(projectId);
    const {data: formFields, isLoading: formFieldsLoading} =
        useFormFields(projectId);

    const isLoading = mutantsLoading || formFieldsLoading;

    React.useEffect(() => {
        setProjectId(projectId);
        setMutants([]);
        setSelectedMutant(null);
    }, [projectId, setProjectId, setMutants, setSelectedMutant]);

    React.useEffect(() => {
        setIsLoading(isLoading);
    }, [isLoading, setIsLoading]);

    React.useEffect(() => {
        if (mutants) {
            setMutants(mutants);
            if (!selectedMutant && mutants.length > 0) {
                setSelectedMutant(mutants[0]);
            }
        }
    }, [mutants, setMutants, setSelectedMutant, selectedMutant]);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading mutants...</p>
            </div>
        );
    }

    if (mutantsError) {
        return (
            <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 bg-background">
                <AlertTriangle className="w-10 h-10 text-destructive" />
                <p className="text-destructive">Failed to load mutants</p>
            </div>
        );
    }

    if (!selectedMutant) {
        return <EmptyReviewSection />;
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-background overflow-hidden">
            <ResizablePanelGroup
                direction="horizontal"
                className="flex-1 min-h-0"
            >
                {/* SidePanel */}
                <ResizablePanel
                    defaultSize={25}
                    minSize={1}
                    className="border-r-2 border-boder min-h-0"
                >
                    <div className="h-full min-h-0 p-4 overflow-hidden">
                        <MutationListPanel />
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* Middle Panel - Detail */}
                <ResizablePanel
                    minSize={1}
                    className="border-r-2 border-boder min-h-0 overflow-hidden"
                >
                    <div className="h-full min-h-0">
                        <DetailPanel />
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* Right Panel - Review Form */}
                <ResizablePanel
                    defaultSize={25}
                    minSize={1}
                    className="min-h-0"
                >
                    <div className="min-h-0 p-4 overflow-hidden">
                        <ReviewFormPanel
                            projectId={projectId}
                            formFields={formFields ?? []}
                        />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}

function EmptyReviewSection() {
    const navigate = useNavigate();
    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-5 bg-background">
            <div className="text-center textttext-muted-foreground">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10" />
                </div>
                <h3 className="mb-2">No Mutant Selected</h3>
                <p>Select a mutant from the list to begin your review</p>
            </div>
            <Button
                className="hover:bg-primary/70"
                onClick={() => navigate({to: "/"})}
            >
                <ArrowLeft />
                Navigate Back
            </Button>
        </div>
    );
}
