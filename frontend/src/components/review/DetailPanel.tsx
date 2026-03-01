import type {MutantOverview} from "@/api/services/mutants.service";
import {AlertTriangle, CheckCircle, Clock} from "lucide-react";
import {useMemo} from "react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Separator} from "@radix-ui/react-dropdown-menu";
import {useMutantStore} from "@/stores/mutantStore";
import {getStatusBadge} from "./getStatusBadge";
import {formatMutatorForLineBreaks} from "../utils/formatMutator";
import {useMutantDetails} from "@/hooks/queries/useMutantQueries";
import {SourceCodeViewer} from "./SourceCodeViewer";

export function DetailPanel() {
    const selectedMutant = useMutantStore((state) => state.selectedMutant);
    const {data: mutantDetails} = useMutantDetails(selectedMutant?.id);

    if (!selectedMutant) {
        return (
            <div className="h-full flex items-center justify-center bg-background p-8">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                        <AlertTriangle
                            className="w-10 h-10 text-secondary-foreground"
                            aria-hidden="true"
                        />
                    </div>
                    <h3 className="text-secondary-foreground mb-2">
                        No Mutant Selected
                    </h3>
                    <p className="text-muted-foreground">
                        Select a mutant from the list to begin your review
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="space-y-4 px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                    {getStatusIcon(selectedMutant)}
                    <div>
                        <h3 className="text-foreground">Mutant Details</h3>
                        <p className="text-sm text-muted-foreground">
                            ID: {selectedMutant.id}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge(selectedMutant)}
                    {selectedMutant.rated && (
                        <p className="px-2 rounded-md text-sm border border-[#22C55E] text-[#22C55E]">
                            Previously Reviewed
                        </p>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-card-foreground">
                                Mutation Context
                            </CardTitle>
                            <CardDescription>
                                Detailed information about this mutation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MutationInfoCard
                                mutant={selectedMutant}
                                additionalFields={
                                    mutantDetails?.additionalFields
                                }
                            />
                        </CardContent>
                    </Card>

                    <Card className="flex-1 min-h-0 flex flex-col">
                        <CardHeader className="shrink-0">
                            <CardTitle className="text-card-foreground">
                                Source Code
                            </CardTitle>
                            <CardDescription>
                                Mutation at line {selectedMutant.lineNumber}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0 -mt-2">
                            <SourceCodeViewer />
                        </CardContent>
                    </Card>

                    <Separator />
                </div>
            </div>
        </div>
    );
}

const getStatusIcon = (mutant: MutantOverview) => {
    switch (mutant.status) {
        case "SURVIVED":
            return (
                <AlertTriangle
                    className="w-5 h-5 text-destructive"
                    aria-hidden="true"
                />
            );
        case "KILLED":
            return (
                <CheckCircle
                    className="w-5 h-5 text-success"
                    aria-hidden="true"
                />
            );
        case "TIMED_OUT":
            return (
                <Clock className="w-5 h-5 text-[#F59E0B]" aria-hidden="true" />
            );
        default:
            return (
                <AlertTriangle
                    className="w-5 h-5 text-muted-foreground"
                    aria-hidden="true"
                />
            );
    }
};

function MutationInfoCard({
    mutant,
    additionalFields,
}: {
    mutant: MutantOverview;
    additionalFields?: string | null;
}) {
    const additionalFieldEntries = useMemo(() => {
        if (!additionalFields) return [];
        try {
            const parsed = JSON.parse(additionalFields);
            if (
                !parsed ||
                typeof parsed !== "object" ||
                Array.isArray(parsed)
            ) {
                return [];
            }
            return Object.entries(parsed).map(([key, value]) => [
                key,
                String(value),
            ]);
        } catch {
            return [];
        }
    }, [additionalFields]);

    return (
        <dl className="grid grid-cols-1 gap-4 text-sm">
            <div>
                <dt className="text-muted-foreground mb-1">Source File</dt>
                <dd className="text-secondary-foreground font-mono text-sm bg-secondary px-3 py-2 rounded">
                    {mutant.sourceFile}
                </dd>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <dt className="text-muted-foreground mb-1">Line Number</dt>
                    <dd className="text-card-foreground">
                        {mutant.lineNumber}
                    </dd>
                </div>
                <div>
                    <dt className="text-muted-foreground mb-1">Status</dt>
                    <dd className="text-card-foreground capitalize">
                        {mutant.status.toLowerCase().replace("_", " ")}
                    </dd>
                </div>
            </div>

            <div>
                <dt className="text-muted-foreground mb-1">Mutator Type</dt>
                <dd className="text-card-foreground font-mono text-sm bg-background px-3 py-2 rounded whitespace-normal">
                    {formatMutatorForLineBreaks(mutant.mutator)}
                </dd>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <dt className="text-muted-foreground mb-1">Ranking</dt>
                    <dd className="text-card-foreground">{mutant.ranking}</dd>
                </div>
                <div>
                    <dt className="text-muted-foreground mb-1">Detected</dt>
                    <dd className="text-card-foreground">
                        {mutant.detected ? "Yes" : "No"}
                    </dd>
                </div>
            </div>

            {additionalFieldEntries.map(([key, value]) => (
                <div key={key}>
                    <dt className="text-muted-foreground mb-1">{key}</dt>
                    <dd className="text-card-foreground bg-secondary px-3 py-2 rounded break-words">
                        {value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
