import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactElement, type ReactNode } from "react";
import { ServiceProvider } from "@/api/ServiceProvider";
import type { Services } from "@/lib/services";
import { ThemeProvider } from "@/components/utils/theme-provider";

export function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0 },
			mutations: { retry: false },
		},
	});
}

export function createWrapper(overrides?: Partial<Services>) {
	const queryClient = createTestQueryClient();
	return function Wrapper({ children }: { children: ReactNode }) {
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
	options?: Omit<RenderOptions, "wrapper"> & { services?: Partial<Services> },
) {
	const { services, ...renderOptions } = options ?? {};
	return render(ui, { wrapper: createWrapper(services), ...renderOptions });
}
