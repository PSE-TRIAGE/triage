import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CheckBoxInputGroup } from "../CheckBoxInputGroup";

describe("CheckBoxInputGroup", () => {
	it("renders label", () => {
		render(<CheckBoxInputGroup label="Accept terms" name="accept" />);
		expect(screen.getByText("Accept terms")).toBeInTheDocument();
	});

	it("renders a checkbox input", () => {
		render(<CheckBoxInputGroup label="Check" name="check" />);
		expect(screen.getByRole("checkbox")).toBeInTheDocument();
	});

	it("shows required indicator when showRequired is true", () => {
		render(<CheckBoxInputGroup label="Required" name="req" showRequired />);
		expect(screen.getByText("*")).toBeInTheDocument();
	});

	it("renders error message", () => {
		render(<CheckBoxInputGroup label="Check" name="check" error="Must check" />);
		expect(screen.getByText("Must check")).toBeInTheDocument();
	});

	it("sets aria-invalid when error is present", () => {
		render(<CheckBoxInputGroup label="Check" name="check" error="Error" />);
		expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
	});
});
