import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectGroup,
    SelectLabel,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
} from "../select";

describe("Select", () => {
    it("renders trigger with placeholder", () => {
        render(
            <Select>
                <SelectTrigger data-testid="trigger">
                    <SelectValue placeholder="Pick one" />
                </SelectTrigger>
            </Select>,
        );
        expect(screen.getByTestId("trigger")).toHaveAttribute(
            "data-slot",
            "select-trigger",
        );
        expect(screen.getByText("Pick one")).toBeInTheDocument();
    });

    it("renders trigger with size=sm", () => {
        render(
            <Select>
                <SelectTrigger size="sm" data-testid="trigger">
                    <SelectValue placeholder="Pick" />
                </SelectTrigger>
            </Select>,
        );
        expect(screen.getByTestId("trigger")).toHaveAttribute(
            "data-size",
            "sm",
        );
    });

    it("applies custom className to trigger", () => {
        render(
            <Select>
                <SelectTrigger className="custom" data-testid="trigger">
                    <SelectValue />
                </SelectTrigger>
            </Select>,
        );
        expect(screen.getByTestId("trigger").className).toContain("custom");
    });
});
