import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";

import {Toaster} from "@/components/utils/Toaster";
import {GlobalHeader} from "@/components/Topbar/GlobalHeader";
import {queryClient, queryKeys} from "@/lib/queryClient";
import {services} from "@/lib/services";

export const Route = createFileRoute("/_auth")({
    beforeLoad: async () => {
        const token = localStorage.getItem("auth_token");

        if (!token) {
            throw redirect({to: "/login"});
        }

        await queryClient.ensureQueryData({
            queryKey: queryKeys.auth.me,
            queryFn: () => services.authService.me(),
        });
    },
    component: () => (
        <>
            <GlobalHeader />
            <Outlet />
            <Toaster />
        </>
    ),
});
