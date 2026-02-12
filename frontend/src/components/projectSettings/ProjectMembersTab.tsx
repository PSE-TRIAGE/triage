import {useMemo, useState} from "react";
import {Users, Search, UserPlus, UserMinus, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {useAdminUsers} from "@/hooks/queries/useAdminQueries";
import {useProjectUsers} from "@/hooks/queries/useProjectQueries";
import {
    useAddProjectUser,
    useRemoveProjectUser,
} from "@/hooks/mutations/useProjectMutations";
import {useMe} from "@/hooks/queries/useUserQueries";
import type {ProjectUser} from "@/api/services/projects.service";
import {useRouteContext} from "@tanstack/react-router";

export function ProjectMembersTab() {
    const [searchQuery, setSearchQuery] = useState("");
    const [pendingUserId, setPendingUserId] = useState<number | null>(null);
    const {project} = useRouteContext({from: "/_auth/project/$projectId"});

    const {
        data: allUsers = [],
        isLoading: usersLoading,
        error: usersError,
    } = useAdminUsers();
    const {
        data: projectUsers = [],
        isLoading: projectUsersLoading,
        error: projectUsersError,
    } = useProjectUsers(project.id);
    const {data: me} = useMe();

    const addUserMutation = useAddProjectUser(project.id);
    const removeUserMutation = useRemoveProjectUser(project.id);

    const assignedIds = useMemo(
        () => new Set(projectUsers.map((user) => user.id)),
        [projectUsers],
    );

    const filteredUsers = useMemo(
        () =>
            allUsers.filter((user) =>
                user.username.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
        [allUsers, searchQuery],
    );

    const handleToggleUser = (user: ProjectUser) => {
        const isAssigned = assignedIds.has(user.id);
        setPendingUserId(user.id);
        const mutation = isAssigned ? removeUserMutation : addUserMutation;
        mutation.mutate(user.id, {
            onSettled: () => setPendingUserId(null),
        });
    };

    const isLoading = usersLoading || projectUsersLoading;
    const hasError = usersError || projectUsersError;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <CardTitle>Project Members</CardTitle>
                    </div>
                    <CardDescription>
                        Add or remove users with access to this project.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-foreground w-5 h-5 pointer-events-none select-none" />
                            <Input
                                type="search"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-secondary border-border"
                                aria-label="Search users"
                            />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {assignedIds.size} assigned
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : hasError ? (
                        <div className="py-8 text-center text-destructive">
                            Failed to load users. Please try again.
                        </div>
                    ) : (
                        <Table className="table-fixed">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-left w-[40%]">
                                        User
                                    </TableHead>
                                    <TableHead className="text-left w-[20%]">
                                        Role
                                    </TableHead>
                                    <TableHead className="text-left w-[20%]">
                                        Access
                                    </TableHead>
                                    <TableHead className="w-40" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center text-muted-foreground py-8"
                                        >
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => {
                                        const isAssigned = assignedIds.has(
                                            user.id,
                                        );
                                        const isSelf =
                                            !!me && Number(me.id) === user.id;
                                        const isPending =
                                            pendingUserId === user.id ||
                                            addUserMutation.isPending ||
                                            removeUserMutation.isPending;

                                        return (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-linear-to-br from-primary to-primary/80 text-primary-foreground">
                                                            <span className="text-sm font-semibold">
                                                                {user.username
                                                                    .slice(0, 2)
                                                                    .toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span className="font-medium">
                                                            {user.username}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {user.isAdmin ? (
                                                        <Badge
                                                            variant="default"
                                                            className="w-fit bg-success/70"
                                                        >
                                                            Admin
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="secondary"
                                                            className="w-fit"
                                                        >
                                                            Member
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isAssigned ? (
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant="default"
                                                                className="w-fit bg-primary/20 text-primary"
                                                            >
                                                                Assigned
                                                            </Badge>
                                                            {isSelf ? (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="w-fit"
                                                                >
                                                                    You
                                                                </Badge>
                                                            ) : null}
                                                        </div>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="w-fit"
                                                        >
                                                            Not Assigned
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant={
                                                            isAssigned
                                                                ? "secondary"
                                                                : "default"
                                                        }
                                                        className={`${isAssigned ? "" : "bg-primary hover:bg-primary/80"} gap-2 w-[110px] justify-center`}
                                                        disabled={
                                                            isPending ||
                                                            (isAssigned &&
                                                                isSelf)
                                                        }
                                                        onClick={() =>
                                                            handleToggleUser(
                                                                user,
                                                            )
                                                        }
                                                    >
                                                        {isAssigned ? (
                                                            <>
                                                                <UserMinus className="h-4 w-4" />
                                                                Remove
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserPlus className="h-4 w-4" />
                                                                Add
                                                            </>
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
