import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {ThemeProvider} from "@/components/utils/theme-provider";
import {ThemeToggle} from "../ThemeToggle";

function renderThemeToggle(defaultTheme: "dark" | "light" = "dark") {
    return render(
        <ThemeProvider
            defaultTheme={defaultTheme}
            storageKey="test-toggle-theme"
        >
            <ThemeToggle />
        </ThemeProvider>,
    );
}

describe("ThemeToggle", () => {
    it("renders Dark mode text", () => {
        renderThemeToggle();
        expect(screen.getByText("Dark mode")).toBeInTheDocument();
    });

    it("renders the switch", () => {
        renderThemeToggle();
        expect(screen.getByLabelText("dark mode toggle")).toBeInTheDocument();
    });

    it("switch is checked in dark mode", () => {
        renderThemeToggle("dark");
        const switchEl = screen.getByLabelText("dark mode toggle");
        expect(switchEl).toHaveAttribute("data-state", "checked");
    });

    it("switch is unchecked in light mode", () => {
        renderThemeToggle("light");
        const switchEl = screen.getByLabelText("dark mode toggle");
        expect(switchEl).toHaveAttribute("data-state", "unchecked");
    });
});
