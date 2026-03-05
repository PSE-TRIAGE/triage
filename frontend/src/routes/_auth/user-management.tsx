import {createFileRoute} from "@tanstack/react-router";
import {UserManagement} from "@/pages/UserManagement";

export const Route = createFileRoute("/_auth/user-management")({
    component: UserManagement,
});
