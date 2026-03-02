import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {Button} from "../button";

describe("Button", () => {
    it("renders children", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("has data-slot attribute", () => {
        render(<Button>Test</Button>);
        expect(screen.getByText("Test").closest("[data-slot]")).toHaveAttribute(
            "data-slot",
            "button",
        );
    });

    it("handles click events", () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Click</Button>);
        fireEvent.click(screen.getByText("Click"));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it("can be disabled", () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByText("Disabled").closest("button")).toBeDisabled();
    });

    it("applies variant classes", () => {
        render(<Button variant="destructive">Delete</Button>);
        const btn = screen.getByText("Delete").closest("button");
        expect(btn?.className).toContain("destructive");
    });

    it("applies size classes", () => {
        render(<Button size="sm">Small</Button>);
        const btn = screen.getByText("Small").closest("button");
        expect(btn?.className).toContain("h-8");
    });

    it("applies custom className", () => {
        render(<Button className="my-custom">Custom</Button>);
        const btn = screen.getByText("Custom").closest("button");
        expect(btn?.className).toContain("my-custom");
    });
});
