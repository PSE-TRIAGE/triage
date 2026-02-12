import type {Project} from "@/api/services/projects.service";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {Button} from "@/components/ui/button";
import {Settings, Play, Calendar, TrendingUp, Check} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {useNavigate} from "@tanstack/react-router";
import {useMe} from "@/hooks/queries/useUserQueries";

export function ProjectCard({project}: {project: Project}) {
    const navigate = useNavigate();
    const {data: user} = useMe();
    const progressPercentage =
        (project.reviewedMutants / project.totalMutants) * 100;
    const isComplete = progressPercentage === 100;

    return (
        <Card className="bg-card hover:shadow-lg duration-200 border border-border">
            <CardHeader className="flex items-start justify-between pb-4">
                <div className="flex-1">
                    <CardTitle className="text-card-foreground text-xl mb-2">
                        {project.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                            Created{" "}
                            {new Date(project.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                },
                            )}
                        </span>
                    </CardDescription>
                </div>
                {user?.isAdmin && (
                    <button
                        type="button"
                        onClick={() =>
                            navigate({
                                to: "/project/$projectId/project-settings",
                                params: {projectId: String(project.id)},
                            })
                        }
                        className="flex items-center justify-center h-16 w-16 hover:scale-110 duration-200 cursor-pointer"
                        aria-label={`Manage project ${project.name}`}
                    >
                        <Settings className="h-6 w-6 text-card-foreground" />
                    </button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-2xl text-card-foreground">
                            {project.reviewedMutants.toLocaleString()}
                        </span>
                        <span className="text-xs text-card-foreground">
                            Reviewed
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-2xl text-card-foreground">
                            {project.totalMutants.toLocaleString()}
                        </span>
                        <span className="text-xs text-card-foreground">
                            Total Mutants
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-card-foreground">
                            Progress
                        </span>
                        <span className="text-sm text-card-foreground">
                            {progressPercentage.toFixed(1)}%
                        </span>
                    </div>
                    <Progress
                        value={progressPercentage}
                        className="h-2"
                        aria-label={`Review progress: ${progressPercentage.toFixed(1)}%`}
                    />
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                    {isComplete ? (
                        <Badge className="bg-success/80 text-success-foreground">
                            <TrendingUp
                                className="w-3 h-3 mr-1"
                                aria-hidden="true"
                            />
                            Complete
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="border-primary text-primary"
                        >
                            In Progress
                        </Badge>
                    )}
                </div>

                {/* Action Button */}
                <Button
                    onClick={() =>
                        navigate({
                            to: "/project/$projectId/review",
                            params: {projectId: String(project.id)},
                        })
                    }
                    className="w-full bg-primary hover:scale-105 duration-200 ease-in-out text-primary-foreground"
                    disabled={isComplete}
                >
                    {isComplete ? (
                        <Check className="w-4 h-4 mr-2" aria-hidden="true" />
                    ) : (
                        <Play className="w-4 h-4 mr-2" aria-hidden="true" />
                    )}
                    {isComplete ? "Review Complete" : "Continue Review"}
                </Button>
            </CardContent>
        </Card>
    );
}
