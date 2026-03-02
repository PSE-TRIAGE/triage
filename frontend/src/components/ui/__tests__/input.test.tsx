import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {Input} from "../input";

describe("Input", () => {
    it("renders with data-slot input", () => {
        render(<Input data-testid="input" />);
        expect(screen.getByTestId("input")).toHaveAttribute(
            "data-slot",
            "input",
        );
    });

    it("accepts type prop", () => {
        render(<Input type="email" data-testid="input" />);
        expect(screen.getByTestId("input")).toHaveAttribute("type", "email");
    });

    it("accepts custom className", () => {
        render(<Input className="custom" data-testid="input" />);
        expect(screen.getByTestId("input").className).toContain("custom");
    });

    it("handles value changes", () => {
        const onChange = vi.fn();
        render(<Input onChange={onChange} data-testid="input" />);
        fireEvent.change(screen.getByTestId("input"), {
            target: {value: "test"},
        });
        expect(onChange).toHaveBeenCalledOnce();
    });

    it("can be disabled", () => {
        render(<Input disabled data-testid="input" />);
        expect(screen.getByTestId("input")).toBeDisabled();
    });

    it("accepts placeholder", () => {
        render(<Input placeholder="Enter value" data-testid="input" />);
        expect(screen.getByTestId("input")).toHaveAttribute(
            "placeholder",
            "Enter value",
        );
    });
});
