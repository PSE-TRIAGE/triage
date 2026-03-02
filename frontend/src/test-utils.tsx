import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {type RenderOptions, render} from "@testing-library/react";
import type {ReactElement, ReactNode} from "react";
import {ServiceProvider} from "@/api/ServiceProvider";
import {ThemeProvider} from "@/components/utils/theme-provider";
import type {Services} from "@/lib/services";

export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {retry: false, gcTime: 0},
            mutations: {retry: false},
        },
    });
}

export function createWrapper(overrides?: Partial<Services>) {
    const queryClient = createTestQueryClient();
    return function Wrapper({children}: {children: ReactNode}) {
        return (
            <ServiceProvider services={overrides}>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider defaultTheme="dark" storageKey="test-theme">
                        {children}
                    </ThemeProvider>
                </QueryClientProvider>
            </ServiceProvider>
        );
    };
}

export function renderWithProviders(
    ui: ReactElement,
    options?: Omit<RenderOptions, "wrapper"> & {services?: Partial<Services>},
) {
    const {services, ...renderOptions} = options ?? {};
    return render(ui, {wrapper: createWrapper(services), ...renderOptions});
}
