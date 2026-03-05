import {render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {services as defaultServices, type Services} from "@/lib/services";
import {ServiceProvider, useServices} from "../ServiceProvider";

interface TestConsumerProps {
    onServices?: (services: Services) => void;
}

function TestConsumer({onServices}: TestConsumerProps) {
    const services = useServices();
    onServices?.(services);
    return (
        <div data-testid="has-services">
            {services.authService ? "yes" : "no"}
        </div>
    );
}

describe("ServiceProvider", () => {
    it("provides default services", () => {
        let capturedServices: Services | undefined;
        render(
            <ServiceProvider>
                <TestConsumer
                    onServices={(services) => {
                        capturedServices = services;
                    }}
                />
            </ServiceProvider>,
        );
        expect(screen.getByTestId("has-services").textContent).toBe("yes");
        expect(capturedServices).toBeDefined();
        const providedServices = capturedServices as Services;
        (Object.keys(defaultServices) as Array<keyof Services>).forEach(
            (key) => {
                expect(providedServices[key]).toBe(defaultServices[key]);
            },
        );
    });

    it("allows partial overrides", () => {
        const mockAuth = {
            login: async () => ({token: "mock"}),
            logout: async () => {},
            me: async () => ({
                id: "1",
                username: "test",
                isAdmin: false,
                isActive: true,
            }),
        };
        let capturedServices: Services | undefined;
        render(
            <ServiceProvider
                services={{
                    authService: mockAuth as unknown as Services["authService"],
                }}
            >
                <TestConsumer
                    onServices={(services) => {
                        capturedServices = services;
                    }}
                />
            </ServiceProvider>,
        );
        expect(screen.getByTestId("has-services").textContent).toBe("yes");
        expect(capturedServices).toBeDefined();
        expect(capturedServices?.authService).toBe(mockAuth);
        expect(capturedServices?.authService).not.toBe(
            defaultServices.authService,
        );
        expect(capturedServices?.projectsService).toBe(
            defaultServices.projectsService,
        );
    });

    it("throws when useServices is used outside provider", () => {
        // We suppress the error output
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});
        try {
            expect(() => render(<TestConsumer />)).toThrow(
                "useServices must be used within ServiceProvider",
            );
        } finally {
            spy.mockRestore();
        }
    });
});
