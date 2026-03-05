import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it} from "vitest";
import {ThemeProvider} from "@/components/utils/theme-provider";
import {ThemeToggle} from "../ThemeToggle";

function renderThemeToggle(
    defaultTheme: "dark" | "light" = "dark",
    storageKey = "test-toggle-theme",
) {
    return render(
        <ThemeProvider
            defaultTheme={defaultTheme}
            storageKey={storageKey}
        >
            <ThemeToggle />
        </ThemeProvider>,
    );
}

describe("ThemeToggle", () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove("light", "dark");
    });

    it("renders Dark mode text and switch control", () => {
        renderThemeToggle("dark", "test-toggle-theme-render");
        expect(screen.getByText("Dark mode")).toBeInTheDocument();
        expect(screen.getByRole("switch", {name: "dark mode toggle"})).toBeInTheDocument();
    });

    it("switch is checked in dark mode", () => {
        renderThemeToggle("dark", "test-toggle-theme-dark");
        const switchEl = screen.getByRole("switch", {name: "dark mode toggle"});
        expect(switchEl).toHaveAttribute("aria-checked", "true");
    });

    it("switch is unchecked in light mode", () => {
        renderThemeToggle("light", "test-toggle-theme-light");
        const switchEl = screen.getByRole("switch", {name: "dark mode toggle"});
        expect(switchEl).toHaveAttribute("aria-checked", "false");
    });

    it("toggles from dark to light and persists theme", async () => {
        const storageKey = "test-toggle-theme-dark-to-light";
        renderThemeToggle("dark", storageKey);
        const switchEl = screen.getByRole("switch", {name: "dark mode toggle"});

        fireEvent.click(switchEl);

        await waitFor(() => {
            expect(switchEl).toHaveAttribute("aria-checked", "false");
            expect(localStorage.getItem(storageKey)).toBe("light");
            expect(document.documentElement).toHaveClass("light");
            expect(document.documentElement).not.toHaveClass("dark");
        });
    });

    it("uses persisted theme from localStorage over default", async () => {
        const storageKey = "test-toggle-theme-persisted";
        localStorage.setItem(storageKey, "light");

        renderThemeToggle("dark", storageKey);
        const switchEl = screen.getByRole("switch", {name: "dark mode toggle"});

        await waitFor(() => {
            expect(switchEl).toHaveAttribute("aria-checked", "false");
            expect(document.documentElement).toHaveClass("light");
            expect(document.documentElement).not.toHaveClass("dark");
        });
    });
});
