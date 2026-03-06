import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it} from "vitest";
import {ThemeProvider, useTheme} from "../theme-provider";

function ThemeConsumer() {
    const {theme, setTheme} = useTheme();
    return (
        <div>
            <span data-testid="theme">{theme}</span>
            <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
                toggle
            </button>
        </div>
    );
}

describe("ThemeProvider", () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove("light", "dark");
    });

    it("provides default theme and applies it to document root", () => {
        render(
            <ThemeProvider defaultTheme="dark" storageKey="test-theme">
                <ThemeConsumer />
            </ThemeProvider>,
        );
        expect(screen.getByTestId("theme")).toHaveTextContent("dark");
        expect(document.documentElement).toHaveClass("dark");
        expect(document.documentElement).not.toHaveClass("light");
    });

    it("reads theme from localStorage", () => {
        localStorage.setItem("test-theme-stored", "light");
        render(
            <ThemeProvider defaultTheme="dark" storageKey="test-theme-stored">
                <ThemeConsumer />
            </ThemeProvider>,
        );
        expect(screen.getByTestId("theme")).toHaveTextContent("light");
    });

    it("updates theme on setTheme and toggles root class", async () => {
        render(
            <ThemeProvider defaultTheme="dark" storageKey="test-theme-toggle">
                <ThemeConsumer />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getByText("toggle"));
        expect(screen.getByTestId("theme")).toHaveTextContent("light");
        await waitFor(() => {
            expect(document.documentElement).toHaveClass("light");
            expect(document.documentElement).not.toHaveClass("dark");
        });
    });

    it("persists theme to localStorage", () => {
        render(
            <ThemeProvider defaultTheme="dark" storageKey="test-theme-persist">
                <ThemeConsumer />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getByText("toggle"));
        expect(localStorage.getItem("test-theme-persist")).toBe("light");
    });

    it("replaces a pre-existing opposite class when applying theme", async () => {
        document.documentElement.classList.add("light");

        render(
            <ThemeProvider defaultTheme="dark" storageKey="test-theme-class">
                <ThemeConsumer />
            </ThemeProvider>,
        );
        await waitFor(() => {
            expect(document.documentElement).toHaveClass("dark");
            expect(document.documentElement).not.toHaveClass("light");
        });
    });
});
