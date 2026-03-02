import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import type {Services} from "@/lib/services";
import {ServiceProvider, useServices} from "../ServiceProvider";

function TestConsumer() {
    const services = useServices();
    return (
        <div data-testid="has-services">
            {services.authService ? "yes" : "no"}
        </div>
    );
}

describe("ServiceProvider", () => {
    it("provides default services", () => {
        render(
            <ServiceProvider>
                <TestConsumer />
            </ServiceProvider>,
        );
        expect(screen.getByTestId("has-services").textContent).toBe("yes");
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
        render(
            <ServiceProvider
                services={{
                    authService: mockAuth as unknown as Services["authService"],
                }}
            >
                <TestConsumer />
            </ServiceProvider>,
        );
        expect(screen.getByTestId("has-services").textContent).toBe("yes");
    });

    it("throws when useServices is used outside provider", () => {
        // We suppress the error output
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});
        expect(() => render(<TestConsumer />)).toThrow(
            "useServices must be used within ServiceProvider",
        );
        spy.mockRestore();
    });
});
