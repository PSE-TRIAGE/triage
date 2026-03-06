import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {Skeleton} from "../skeleton";

describe("Skeleton", () => {
    it("renders with data-slot", () => {
        render(<Skeleton data-testid="skeleton" />);
        expect(screen.getByTestId("skeleton")).toHaveAttribute(
            "data-slot",
            "skeleton",
        );
    });

    it("applies custom className", () => {
        render(<Skeleton data-testid="skeleton" className="w-20 h-4" />);
        expect(screen.getByTestId("skeleton").className).toContain("w-20");
    });

    it("has animate-pulse class", () => {
        render(<Skeleton data-testid="skeleton" />);
        expect(screen.getByTestId("skeleton").className).toContain(
            "animate-pulse",
        );
    });
});
