import {UserManagement} from "@/pages/UserManagement";
import {createFileRoute} from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/user-management")({
    component: UserManagement,
});
