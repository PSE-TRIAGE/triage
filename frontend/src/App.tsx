import {StrictMode} from "react";
import ReactDOM from "react-dom/client";

import {QueryClientProvider} from "@tanstack/react-query";
import {createRouter, RouterProvider} from "@tanstack/react-router";

import {ThemeProvider} from "./components/utils/theme-provider";
import {routeTree} from "./routeTree.gen";
import "./globals.css";
import {queryClient} from "./lib/queryClient";
import {ServiceProvider} from "./api/ServiceProvider";

const router = createRouter({
    routeTree,
    context: {},
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <ServiceProvider>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider
                        defaultTheme="light"
                        storageKey="vite-ui-theme"
                    >
                        <RouterProvider router={router} />
                    </ThemeProvider>
                </QueryClientProvider>
            </ServiceProvider>
        </StrictMode>,
    );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()
