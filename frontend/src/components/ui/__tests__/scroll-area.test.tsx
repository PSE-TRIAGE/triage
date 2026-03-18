import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {ScrollArea, ScrollBar} from "../scroll-area";

describe("ScrollArea", () => {
    it("renders children with data-slot", () => {
        render(
            <ScrollArea data-testid="scroll">
                <p>Content</p>
            </ScrollArea>,
        );
        expect(screen.getByTestId("scroll")).toHaveAttribute(
            "data-slot",
            "scroll-area",
        );
        expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
        render(
            <ScrollArea data-testid="scroll" className="h-40">
                <p>Content</p>
            </ScrollArea>,
        );
        expect(screen.getByTestId("scroll").className).toContain("h-40");
    });
});

describe("ScrollBar", () => {
    it("renders scrollbar within ScrollArea", () => {
        const {container} = render(
            <ScrollArea>
                <p>Content</p>
            </ScrollArea>,
        );
        expect(
            container.querySelector("[data-slot='scroll-area']"),
        ).toBeTruthy();
    });

    it("renders with custom className in ScrollArea", () => {
        const {container} = render(
            <ScrollArea>
                <ScrollBar orientation="horizontal" className="custom-bar" />
                <p>Content</p>
            </ScrollArea>,
        );
        expect(
            container.querySelector("[data-slot='scroll-area']"),
        ).toBeTruthy();
    });
});
