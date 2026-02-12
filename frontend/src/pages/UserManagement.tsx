import {
    Users,
    Search,
    UserPlus,
    Shield,
    MoreVertical,
    FileCode,
    Loader2,
    Pencil,
    Trash2,
    RotateCcw,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Badge} from "@/components/ui/badge";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Separator} from "@radix-ui/react-dropdown-menu";
import {useMemo, useState} from "react";
import {CreateUserModal} from "@/components/users/CreateUserModel";
import {ChangeAdminStatus} from "@/components/users/ChangeAdminStatus";
import {DeleteUser} from "@/components/users/DeleteUser";
import {ReactivateUser} from "@/components/users/ReactivateUser";
import {
    useAdminUsers,
    useAdminProjects,
    useAdminUserProjects,
} from "@/hooks/queries/useAdminQueries";
import {useMe} from "@/hooks/queries/useUserQueries";
import type {AdminUser, UserProject} from "@/api/services/admin-users.service";
import {useMutation} from "@tanstack/react-query";
import {useServices} from "@/api/ServiceProvider";
import {queryClient, queryKeys} from "@/lib/queryClient";
import {toast} from "sonner";

export function UserManagement() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const {data: users = [], isLoading, error} = useAdminUsers();

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="bg-background">
            <div className="flex flex-col gap-5 max-w-6xl mx-auto my-8">
                <div className="flex flex-col gap-2 mb-8">
                    <div className="flex items-center gap-2">
                        <Users className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl font-bold text-foreground">
                            User Management
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage user accounts, roles, and permissions
                    </p>
                    <Separator className="border border-border" />
                </div>

                <div className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-foreground w-5 h-5 pointer-events-none select-none" />
                            <Input
                                type="search"
                                placeholder="Search Usernames..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-secondary border-border"
                                aria-label="Search users"
                            />
                        </div>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-success hover:scale-105 hover:bg-success/80 cursor-pointer"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add User
                        </Button>
                        <CreateUserModal
                            open={isCreateModalOpen}
                            handleClose={() => setIsCreateModalOpen(false)}
                        />
                    </div>

                    {isLoading ? (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </CardContent>
                        </Card>
                    ) : error ? (
                        <Card>
                            <CardContent className="py-12 text-center text-destructive">
                                Failed to load users. Please try again.
                            </CardContent>
                        </Card>
                    ) : (
                        <UserTable users={filteredUsers} />
                    )}
                </div>
            </div>
        </div>
    );
}

function UserTable({users}: {users: AdminUser[]}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                    A list of all users in your organization
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-left w-[24%]">
                                User
                            </TableHead>
                            <TableHead className="text-left w-[14%]">
                                Role
                            </TableHead>
                            <TableHead className="text-left w-[34%]">
                                Projects
                            </TableHead>
                            <TableHead className="text-left w-[20%]">
                                Mutants Reviewed
                            </TableHead>
                            <TableHead className="w-[8%]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center text-muted-foreground py-8"
                                >
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <UserRow key={user.id} user={user} />
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function UserRow({user}: {user: AdminUser}) {
    const [projectsDialogOpen, setProjectsDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
    const [projectSearch, setProjectSearch] = useState("");
    const {projectsService} = useServices();
    const {data: me} = useMe();

    const {
        data: allProjects = [],
        isLoading: projectsLoading,
        error: projectsError,
    } = useAdminProjects();
    const {
        data: userProjects = [],
        isLoading: userProjectsLoading,
        error: userProjectsError,
    } = useAdminUserProjects(user.id);

    const assignedProjectIds = useMemo(
        () => new Set(userProjects.map((project) => project.id)),
        [userProjects],
    );

    const sortedProjects = useMemo(() => {
        return [...userProjects].sort((a, b) => a.name.localeCompare(b.name));
    }, [userProjects]);

    const filteredProjects = useMemo(
        () =>
            allProjects.filter((project) =>
                project.name
                    .toLowerCase()
                    .includes(projectSearch.toLowerCase()),
            ),
        [allProjects, projectSearch],
    );

    const updateProjectMutation = useMutation({
        mutationFn: async (payload: {
            projectId: number;
            action: "add" | "remove";
        }) => {
            if (payload.action === "add") {
                return projectsService.addUserToProject(
                    payload.projectId,
                    user.id,
                );
            }
            return projectsService.removeUserFromProject(
                payload.projectId,
                user.id,
            );
        },
        onSuccess: (_data, payload) => {
            queryClient.setQueryData<UserProject[]>(
                queryKeys.admin.userProjects(user.id),
                (existing) => {
                    const current = existing ?? [];
                    if (payload.action === "remove") {
                        return current.filter(
                            (project) => project.id !== payload.projectId,
                        );
                    }
                    const project = allProjects.find(
                        (item) => item.id === payload.projectId,
                    );
                    if (
                        !project ||
                        current.some((item) => item.id === project.id)
                    ) {
                        return current;
                    }
                    return [...current, project];
                },
            );
            queryClient.invalidateQueries({
                queryKey: queryKeys.admin.userProjects(user.id),
            });
        },
        onError: (error) => {
            console.error("Update user projects failed:", error);
            toast.error("Failed to update project assignments");
        },
    });

    const handleToggleProject = (projectId: number) => {
        const isAssigned = assignedProjectIds.has(projectId);
        const isSelf = !!me && Number(me.id) === user.id;
        if (isAssigned && isSelf) {
            return;
        }
        updateProjectMutation.mutate({
            projectId,
            action: isAssigned ? "remove" : "add",
        });
    };

    const isProjectsLoading = projectsLoading || userProjectsLoading;
    const hasProjectsError = projectsError || userProjectsError;

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-linear-to-br from-primary to-primary/80 text-primary-foreground">
                        <span className="text-sm font-semibold">
                            {user.username.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                    <span className="font-medium">{user.username}</span>
                </div>
            </TableCell>
            <TableCell>
                {!user.isActive ? (
                    <Badge variant="destructive" className="w-fit">
                        Deactivated
                    </Badge>
                ) : user.isAdmin ? (
                    <Badge
                        variant="default"
                        className="flex items-center gap-1 w-fit bg-success/70"
                    >
                        <Shield className="h-3 w-3" />
                        Admin
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="w-fit">
                        Member
                    </Badge>
                )}
            </TableCell>
            <TableCell className="whitespace-normal">
                <div className="flex flex-wrap gap-1 min-h-[28px]">
                    {isProjectsLoading ? (
                        <Badge variant="outline" className="w-fit">
                            Loading...
                        </Badge>
                    ) : hasProjectsError ? (
                        <Badge variant="outline" className="w-fit">
                            Unavailable
                        </Badge>
                    ) : sortedProjects.length === 0 ? (
                        <Badge variant="outline" className="w-fit">
                            None
                        </Badge>
                    ) : (
                        <>
                            {sortedProjects.slice(0, 2).map((project) => (
                                <Badge key={project.id} variant="outline">
                                    {project.name}
                                </Badge>
                            ))}
                            {sortedProjects.length > 2 ? (
                                <Badge variant="outline" className="w-fit">
                                    +{sortedProjects.length - 2}
                                </Badge>
                            ) : null}
                        </>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <FileCode className="h-4 w-4" />
                    <span className="font-medium">{user.mutantsReviewed}</span>
                </div>
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className="hover:bg-secondary"
                            variant="ghost"
                            size="sm"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-background" align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer hover:bg-secondary"
                            onSelect={() => setProjectsDialogOpen(true)}
                        >
                            <span className="flex items-center gap-2">
                                <Pencil className="h-4 w-4" />
                                Edit Projects
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer hover:bg-secondary">
                            <ChangeAdminStatus user={user} />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!user.isActive ? (
                            <DropdownMenuItem
                                className="cursor-pointer hover:bg-secondary"
                                onSelect={() => setReactivateDialogOpen(true)}
                            >
                                <span className="flex items-center gap-2">
                                    <RotateCcw className="h-4 w-4" />
                                    Reactivate User
                                </span>
                            </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem
                            className="cursor-pointer text-destructive hover:bg-destructive/10"
                            onSelect={() => setDeleteDialogOpen(true)}
                        >
                            <span className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                Delete User
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DeleteUser
                    user={user}
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                />
                <ReactivateUser
                    user={user}
                    open={reactivateDialogOpen}
                    onOpenChange={setReactivateDialogOpen}
                />
            </TableCell>
            <Dialog
                open={projectsDialogOpen}
                onOpenChange={(open) => {
                    setProjectsDialogOpen(open);
                    if (!open) {
                        setProjectSearch("");
                    }
                }}
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Project Access</DialogTitle>
                        <DialogDescription>
                            Assign or remove projects for {user.username}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Search projects..."
                            value={projectSearch}
                            onChange={(event) =>
                                setProjectSearch(event.target.value)
                            }
                        />
                        <ScrollArea className="h-[320px]">
                            <div className="divide-y divide-border/70">
                                {projectsLoading ? (
                                    <div className="text-sm text-muted-foreground px-2 py-4">
                                        Loading projects...
                                    </div>
                                ) : hasProjectsError ? (
                                    <div className="text-sm text-destructive px-2 py-4">
                                        Failed to load projects.
                                    </div>
                                ) : filteredProjects.length === 0 ? (
                                    <div className="text-sm text-muted-foreground px-2 py-4">
                                        No projects found.
                                    </div>
                                ) : (
                                    filteredProjects.map((project) => {
                                        const isAssigned =
                                            assignedProjectIds.has(project.id);
                                        const isSelf =
                                            !!me && Number(me.id) === user.id;
                                        const isDisabled =
                                            updateProjectMutation.isPending ||
                                            (isAssigned && isSelf);

                                        return (
                                            <div
                                                key={project.id}
                                                className="flex items-center justify-between gap-4 px-2 py-3 hover:bg-secondary/60"
                                            >
                                                <p className="text-sm font-medium">
                                                    {project.name}
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant={
                                                        isAssigned
                                                            ? "secondary"
                                                            : "default"
                                                    }
                                                    className={
                                                        isAssigned
                                                            ? "gap-2"
                                                            : "gap-2 bg-primary hover:bg-primary/80"
                                                    }
                                                    disabled={isDisabled}
                                                    onClick={() =>
                                                        handleToggleProject(
                                                            project.id,
                                                        )
                                                    }
                                                >
                                                    {isAssigned
                                                        ? "Remove"
                                                        : "Add"}
                                                </Button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary">Done</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TableRow>
    );
}
