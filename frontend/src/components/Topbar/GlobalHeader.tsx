import {Dna, LogOut, Settings, User as UserIcon} from "lucide-react";

import {useNavigate} from "@tanstack/react-router";

import {Button} from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {ThemeToggle} from "./ThemeToggle";
import {useLogout} from "@/hooks/mutations/useAuthMutations";
import {useMe} from "@/hooks/queries/useUserQueries";

export function GlobalHeader() {
    return (
        <header className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
            <div className="flex items-center justify-between h-16 px-6">
                <AppLogo />
                <div className="flex items-center gap-2">
                    <ProfileDropdown />
                </div>
            </div>
        </header>
    );
}

const AppLogo = () => {
    const navigate = useNavigate();

    return (
        <Button
            variant="ghost"
            onClick={() => navigate({to: "/dashboard"})}
            className="flex items-center gap-3 h-auto p-2 hover:opacity-60 duration-250 ease-in-out"
        >
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Dna
                    className="w-6 h-6 text-primary-foreground"
                    aria-hidden="true"
                />
            </div>
            <span className="text-foreground font-semibold text-lg">
                Triage
            </span>
        </Button>
    );
};

const ProfileDropdown = () => {
    const navigate = useNavigate();
    const {mutate: logout, isPending} = useLogout();
    const {data: user, isLoading} = useMe();

    const initials = user?.username
        ? user.username
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "U";

    const displayName = isLoading
        ? "Loading..."
        : user?.username || "Guest User";
    const displayRole = user?.isAdmin ? "Admin" : "Member";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full cursor-pointer">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary text-card-foreground select-none">
                    <span className="text-xs font-medium">{initials}</span>
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 bg-card">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-3 px-2 py-1.5">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-linear-to-br from-primary to-primary/80 text-primary-foreground select-none shadow-sm">
                            <span className="text-sm font-semibold">
                                {initials}
                            </span>
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {displayName}
                            </p>
                            {displayRole && (
                                <p className="text-xs text-muted-foreground">
                                    {displayRole}
                                </p>
                            )}
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-secondary">
                    <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user?.isAdmin && (
                    <DropdownMenuItem
                        onClick={() => navigate({to: "/user-management"})}
                        className="flex gap-4 cursor-pointer hover:bg-secondary"
                    >
                        <UserIcon className="h-4 w-4" />
                        <span>User Management</span>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    onClick={() => navigate({to: "/settings"})}
                    className="flex gap-4 cursor-pointer hover:bg-secondary"
                >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => logout()}
                    disabled={isPending}
                    className="flex gap-4 cursor-pointer text-destructive hover:bg-destructive/10"
                >
                    <LogOut className="h-4 w-4 text-destructive" />
                    <span>{isPending ? "Logging out..." : "Logout"}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
