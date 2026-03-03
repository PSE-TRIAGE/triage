import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {Progress} from "../progress";

describe("Progress", () => {
	it("renders with data-slot", () => {
		render(<Progress data-testid="progress" value={50} />);
		expect(screen.getByTestId("progress")).toHaveAttribute(
			"data-slot",
			"progress",
		);
	});

	it("applies custom className", () => {
		render(
			<Progress data-testid="progress" className="custom" value={50} />,
		);
		expect(screen.getByTestId("progress").className).toContain("custom");
	});

	it("renders indicator with transform style", () => {
		render(<Progress data-testid="progress" value={75} />);
		const indicator = screen.getByTestId("progress").querySelector(
			'[data-slot="progress-indicator"]',
		);
		expect(indicator).toBeInTheDocument();
		expect(indicator?.getAttribute("style")).toContain("translateX(-25%)");
	});

	it("defaults to 0 when no value", () => {
		render(<Progress data-testid="progress" />);
		const indicator = screen.getByTestId("progress").querySelector(
			'[data-slot="progress-indicator"]',
		);
		expect(indicator?.getAttribute("style")).toContain("translateX(-100%)");
	});
});
