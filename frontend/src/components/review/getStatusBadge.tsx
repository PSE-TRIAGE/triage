import type {MutantOverview} from "@/api/services/mutants.service";
import {Badge} from "../ui/badge";

export const getStatusBadge = (mutant: MutantOverview) => {
    switch (mutant.status) {
        case "SURVIVED":
            return (
                <Badge className="rounded-md  bg-destructive/20 text-destructive">
                    Survived
                </Badge>
            );
        case "KILLED":
            return (
                <Badge className="rounded-md bg-success/20 text-success">
                    Killed
                </Badge>
            );
        case "TIMED_OUT":
            return (
                <Badge className="rounded-md bg-orange-400/20 text-orange-400">
                    Timeout
                </Badge>
            );
        case "NO_COVERAGE":
            return (
                <Badge className="rounded-md bg-muted text-muted-foreground">
                    No Coverage
                </Badge>
            );
        default:
            return (
                <Badge className="rounded-md bg-muted text-muted-foreground">
                    {mutant.status.replace("_", " ")}
                </Badge>
            );
    }
};
