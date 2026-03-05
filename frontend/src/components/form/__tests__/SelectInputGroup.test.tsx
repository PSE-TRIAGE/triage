import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {SelectInputGroup} from "../SelectInputGroup";

describe("SelectInputGroup", () => {
    it("renders label", () => {
        render(
            <SelectInputGroup label="Choose option" onValueChange={vi.fn()} />,
        );
        expect(screen.getByText("Choose option")).toBeInTheDocument();
    });

    it("shows required indicator when showRequired is true", () => {
        render(
            <SelectInputGroup
                label="Select"
                showRequired
                onValueChange={vi.fn()}
            />,
        );
        expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("renders error message", () => {
        render(
            <SelectInputGroup
                label="Select"
                error="Selection required"
                onValueChange={vi.fn()}
            />,
        );
        expect(screen.getByText("Selection required")).toBeInTheDocument();
    });

    it("does not render error when not provided", () => {
        const {container} = render(
            <SelectInputGroup label="Select" onValueChange={vi.fn()} />,
        );
        expect(
            container.querySelector("span.text-destructive.font-medium"),
        ).toBeNull();
    });

    it("renders with the select trigger", () => {
        render(<SelectInputGroup label="Select" onValueChange={vi.fn()} />);
        expect(screen.getByRole("combobox", {name: "Select"})).toBeInTheDocument();
    });
});
