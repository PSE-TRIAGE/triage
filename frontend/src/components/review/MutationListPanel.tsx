import {CheckCircle2, Circle} from "lucide-react";
import {useState} from "react";

import type {MutantOverview} from "@/api/services/mutants.service";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import {getStatusBadge} from "@/components/review/getStatusBadge";
import {Button} from "../ui/button";
import {useMutantStore} from "@/stores/mutantStore";
import {formatMutatorForLineBreaks} from "../utils/formatMutator";

type FilterModes =
    | "unreviewed"
    | "reviewed"
    | "all"
    | "killed"
    | "survived"
    | "noCoverage";

const FILTER_OPTIONS: Array<{value: FilterModes; label: string}> = [
    {value: "all", label: "All Mutants"},
    {value: "unreviewed", label: "Unreviewed"},
    {value: "reviewed", label: "Reviewed"},
    {value: "killed", label: "Killed"},
    {value: "survived", label: "Survived"},
    {value: "noCoverage", label: "No Coverage"},
];

export function MutationListPanel() {
    const mutants = useMutantStore((state) => state.mutants);
    const [filter, setFilter] = useState<FilterModes>("unreviewed");

    const filterFns: Record<FilterModes, (m: MutantOverview) => boolean> = {
        unreviewed: (m) => !m.rated,
        reviewed: (m) => m.rated,
        killed: (m) => m.status === "KILLED",
        survived: (m) => m.status === "SURVIVED",
        noCoverage: (m) => m.status === "NO_COVERAGE",
        all: () => true,
    };

    const filteredMutants = mutants.filter(filterFns[filter]);

    return (
        <Card className="h-full min-h-0">
            {/* Header */}
            <CardHeader className="px-4 py-3 border-b border-border space-y-3">
                <CardTitle className="text-foreground">Mutants</CardTitle>

                {/* Filter */}
                <Select
                    value={filter}
                    onValueChange={(value) => setFilter(value as FilterModes)}
                >
                    <SelectTrigger
                        className="w-full"
                        aria-label="Filter mutants"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="bg-background">
                        {FILTER_OPTIONS.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                className="hover:bg-secondary"
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>

            <CardContent className="flex-1 min-h-0">
                <MutantList filter={filter} mutants={filteredMutants} />
            </CardContent>
        </Card>
    );
}

function MutantList({
    filter,
    mutants,
}: {
    filter: FilterModes;
    mutants: MutantOverview[];
}) {
    const selectedMutant = useMutantStore((state) => state.selectedMutant);
    const setSelectedMutant = useMutantStore(
        (state) => state.setSelectedMutant,
    );

    if (!mutants || mutants.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                <div className="w-16 h-16 mb-4 rounded-full bg-secondary flex items-center justify-center">
                    <CheckCircle2
                        className="w-8 h-8 text-success"
                        aria-hidden="true"
                    />
                </div>
                <p className="text-sm text-card-foreground text-center">
                    {filter === "unreviewed"
                        ? "No unreviewed mutants left. 🎉"
                        : filter === "reviewed"
                          ? "No reviewed mutants yet."
                          : "No mutants in this project."}
                </p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full pr-2">
            <div className="space-y-2">
                {mutants.map((mutant) => (
                    <MutationListItem
                        key={mutant.id}
                        mutant={mutant}
                        isSelected={selectedMutant?.id === mutant.id}
                        onSelect={setSelectedMutant}
                    />
                ))}
            </div>
        </ScrollArea>
    );
}

interface MutationListItemProps {
    mutant: MutantOverview;
    isSelected: boolean;
    onSelect: (mutant: MutantOverview) => void;
}

function MutationListItem({
    mutant,
    isSelected,
    onSelect,
}: MutationListItemProps) {
    const getStatusIcon = () => {
        if (mutant.rated) {
            return (
                <CheckCircle2
                    className="w-4 h-4 text-success"
                    aria-label="Reviewed"
                />
            );
        }
        return (
            <Circle className="w-4 h-4 text-primary" aria-label="Unreviewed" />
        );
    };

    return (
        <Button
            type="button"
            variant="ghost"
            onClick={() => onSelect(mutant)}
            aria-pressed={isSelected}
            className={`
                w-full h-auto text-left p-3 rounded-md border hover:bg-secondary whitespace-normal min-w-0
            ${
                isSelected
                    ? "border-primary bg-primary/10"
                    : "border-transparent hover:bg-muted"
            }`}
        >
            <div className="w-full flex gap-2 min-w-0">
                {getStatusIcon()}
                <div className="flex flex-col items-start gap-2 min-w-0 flex-1">
                    <div className="flex gap-2 flex-wrap">
                        <span className="text-sm text-foreground">
                            Mutant ID: {mutant.id}
                        </span>
                        {getStatusBadge(mutant)}
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-normal">
                        {formatMutatorForLineBreaks(mutant.mutator)}
                    </p>
                    <p className="text-xs text-muted-foreground wrap-break-word whitespace-normal">
                        Line number: {mutant.lineNumber}
                    </p>
                </div>
            </div>
        </Button>
    );
}
