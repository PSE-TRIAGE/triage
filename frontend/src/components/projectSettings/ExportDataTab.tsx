import {useMemo} from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import {FileJson} from "lucide-react";
import {LoadingButton} from "../ui/LoadingButton";
import {toast} from "sonner";
import {useExportPreview} from "@/hooks/queries/useExportQueries";
import {useExportDownload} from "@/hooks/mutations/useExportMutations";
import type {
    ExportRatingEntry,
    ExportPreviewStats,
} from "@/api/services/export.service";
import {useRouteContext} from "@tanstack/react-router";

function slugifyFilename(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
        return "project-export";
    }
    return trimmed
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function ExportDataTab() {
    const {project} = useRouteContext({from: "/_auth/project/$projectId"});
    const exportPreview = useExportPreview(project.id);
    const exportDownload = useExportDownload();

    const preview = exportPreview.data;
    const stats = preview?.stats;
    const sampleEntries = preview?.sample_entries ?? [];
    const projectName = preview?.project_name ?? "project";

    const filename = useMemo(() => {
        const base = slugifyFilename(projectName);
        return `${base}-export.json`;
    }, [projectName]);

    const handleExportJSON = async () => {
        try {
            await exportDownload.mutateAsync({projectId: project.id, filename});
            toast.success("JSON successfully downloaded!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export JSON");
        }
    };

    return (
        <div className="space-y-6">
            {/* JSON Export */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileJson className="w-5 h-5 text-primary" />
                        <CardTitle className="text-card-foreground">
                            JSON Export
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Export review data as structured JSON
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoadingButton
                        onClick={handleExportJSON}
                        disabled={
                            exportDownload.isPending || exportPreview.isLoading
                        }
                        className="w-full bg-primary hover:bg-primary/70 text-primary-foreground"
                        loading={exportDownload.isPending}
                        loadingText="Exporting..."
                    >
                        Download JSON
                    </LoadingButton>
                    <div className="mt-4 p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground">
                            <strong>Best for:</strong> Python, JavaScript, APIs
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Export Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-card-foreground">
                        Export Statistics
                    </CardTitle>
                    <CardDescription>
                        Summary of available review data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ExportStats
                        stats={stats}
                        isLoading={exportPreview.isLoading}
                    />
                </CardContent>
            </Card>

            {/* Data Preview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-card-foreground">
                        Data Preview
                    </CardTitle>
                    <CardDescription>
                        Sample of review data to be exported (showing{" "}
                        {sampleEntries.length} records)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        entries={sampleEntries}
                        isLoading={exportPreview.isLoading}
                    />
                </CardContent>
            </Card>

            {/* Export Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-card-foreground">
                        Export Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                        <strong className="text-card-foreground">
                            Data Format:
                        </strong>{" "}
                        Exports include mutation details, reviewer information,
                        and custom form field values.
                    </p>
                    <p>
                        <strong className="text-card-foreground">
                            Privacy:
                        </strong>{" "}
                        Exported data may contain user information. Handle
                        according to your institution's data protection
                        policies.
                    </p>
                    <p>
                        <strong className="text-card-foreground">
                            File Size:
                        </strong>{" "}
                        Large projects may produce sizable export files.
                        Consider filtering data if needed.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

function ExportStats({
    stats,
    isLoading,
}: {
    stats?: ExportPreviewStats;
    isLoading: boolean;
}) {
    if (isLoading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading export statistics...
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-sm text-muted-foreground">
                No export statistics available yet.
            </div>
        );
    }

    return (
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-secondary rounded-lg">
                <dt className="text-sm text-secondary-foreground mb-1">
                    Total Mutants
                </dt>
                <dd className="text-2xl text-secondary-foreground">
                    {stats.total_mutants}
                </dd>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
                <dt className="text-sm text-secondary-foreground mb-1">
                    Total Ratings
                </dt>
                <dd className="text-2xl text-secondary-foreground">
                    {stats.total_ratings}
                </dd>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
                <dt className="text-sm text-secondary-foreground mb-1">
                    Unique Reviewers
                </dt>
                <dd className="text-2xl text-secondary-foreground">
                    {stats.unique_reviewers}
                </dd>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
                <dt className="text-sm text-secondary-foreground mb-1">
                    Completion
                </dt>
                <dd className="text-2xl text-secondary-foreground">
                    {stats.completion_percentage.toFixed(2)}%
                </dd>
            </div>
        </dl>
    );
}

function DataTable({
    entries,
    isLoading,
}: {
    entries: ExportRatingEntry[];
    isLoading: boolean;
}) {
    if (isLoading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading export preview...
            </div>
        );
    }

    if (!entries.length) {
        return (
            <div className="text-sm text-muted-foreground">
                No review data available yet.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Mutant ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Mutator</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Fields</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {entries.map((entry) => (
                    <TableRow
                        key={`${entry.mutant_id}-${entry.reviewer_username}`}
                    >
                        <TableCell className="font-mono text-sm">
                            {entry.mutant_id}
                        </TableCell>
                        <TableCell className="text-sm">
                            {entry.status}
                        </TableCell>
                        <TableCell className="text-sm">
                            {entry.reviewer_username}
                        </TableCell>
                        <TableCell className="text-sm">
                            {entry.mutator}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                            {entry.mutated_class}.{entry.mutated_method}:
                            {entry.line_number}
                        </TableCell>
                        <TableCell className="text-sm">
                            {entry.field_values.length}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
