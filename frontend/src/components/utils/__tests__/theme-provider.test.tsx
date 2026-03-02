import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../theme-provider";

function ThemeConsumer() {
	const { theme, setTheme } = useTheme();
	return (
		<div>
			<span data-testid="theme">{theme}</span>
			<button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>toggle</button>
		</div>
	);
}

describe("ThemeProvider", () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.classList.remove("light", "dark");
	});

	it("provides default theme", () => {
		render(
			<ThemeProvider defaultTheme="dark" storageKey="test-theme">
				<ThemeConsumer />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme").textContent).toBe("dark");
	});

	it("reads theme from localStorage", () => {
		localStorage.setItem("test-theme-stored", "light");
		render(
			<ThemeProvider defaultTheme="dark" storageKey="test-theme-stored">
				<ThemeConsumer />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme").textContent).toBe("light");
	});

	it("updates theme on setTheme", () => {
		render(
			<ThemeProvider defaultTheme="dark" storageKey="test-theme-toggle">
				<ThemeConsumer />
			</ThemeProvider>,
		);
		fireEvent.click(screen.getByText("toggle"));
		expect(screen.getByTestId("theme").textContent).toBe("light");
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

	it("applies theme class to document root", () => {
		render(
			<ThemeProvider defaultTheme="dark" storageKey="test-theme-class">
				<ThemeConsumer />
			</ThemeProvider>,
		);
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});
});

describe("useTheme outside provider", () => {
	it("returns default theme when used outside provider", () => {
		render(<ThemeConsumer />);
		expect(screen.getByTestId("theme").textContent).toBe("dark");
	});
});
