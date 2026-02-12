import {FolderOpen, Plus, Search} from "lucide-react";
import {useState} from "react";

import {CreateProjectModal} from "@/components/dashboard/CreateProjectModal";
import {ProjectCard} from "@/components/dashboard/ProjectCard";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Skeleton} from "@/components/ui/skeleton";
import {useProjects} from "@/hooks/queries/useProjectQueries";
import {useMe} from "@/hooks/queries/useUserQueries";

export function Dashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const {data: projects = [], isLoading} = useProjects();
    const {data: user} = useMe();

    const filteredProjects = projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="bg-background mb-24">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8">
                <DashboardHeader
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    setIsCreateModalOpen={setIsCreateModalOpen}
                    isAdmin={user?.isAdmin ?? false}
                />

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5].map((id) => (
                            <div
                                key={id}
                                className="space-y-4 p-6 border border-border rounded-lg bg-card"
                            >
                                <Skeleton className="h-6 w-3/4 bg-secondary" />
                                <Skeleton className="h-4 w-1/2 bg-secondary" />
                                <Skeleton className="h-20 w-full bg-secondary" />
                                <Skeleton className="h-10 w-full bg-secondary" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State - No Projects */}
                {filteredProjects.length === 0 && searchQuery.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-5 w-full mt-40">
                        <FolderOpen className="w-20 h-20 text-secondary-foreground mb-5" />
                        <div className="flex flex-col items-center justify-center gap-2">
                            <h2 className="text-secondary-foreground">
                                No projects found
                            </h2>
                            <p>
                                Get started by creating your first mutation
                                testing project.
                            </p>
                        </div>
                    </div>
                )}

                {/* Empty State - No Search results*/}
                {filteredProjects.length === 0 && searchQuery.length > 0 && (
                    <div className="flex flex-col items-center justify-center gap-5 w-full mt-40">
                        <Search className="w-20 h-20 text-secondary-foreground" />
                        <p className="text-secondary-foreground text-center">
                            No projects found for "{searchQuery}". Try a
                            different search term
                        </p>
                    </div>
                )}

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                open={isCreateModalOpen}
                handleClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}

function DashboardHeader({
    searchQuery,
    setSearchQuery,
    setIsCreateModalOpen,
    isAdmin,
}: {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    setIsCreateModalOpen: (value: boolean) => void;
    isAdmin: boolean;
}) {
    return (
        <>
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-secondary-foreground font-bold text-4xl mb-2">
                    Projects
                </h1>
                <p className="text-muted-foreground">
                    Manage and review mutation testing projects
                </p>
            </div>

            <div className="flex justify-between gap-10 mb-16">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-foreground w-5 h-5 pointer-events-none select-none" />
                    <Input
                        type="search"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-secondary border-border"
                        aria-label="Search projects"
                    />
                </div>
                {isAdmin && (
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-success hover:scale-105 hover:bg-success/80 cursor-pointer"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Project
                    </Button>
                )}
            </div>
        </>
    );
}
