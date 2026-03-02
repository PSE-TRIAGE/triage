import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {StarRatingInputGroup} from "../StarRatingInputGroup";

describe("StarRatingInputGroup", () => {
    it("renders label", () => {
        render(
            <StarRatingInputGroup label="Rate this" onValueChange={vi.fn()} />,
        );
        expect(screen.getByText("Rate this")).toBeInTheDocument();
    });

    it("renders 5 star buttons", () => {
        render(<StarRatingInputGroup label="Rating" onValueChange={vi.fn()} />);
        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(5);
    });

    it("shows 'No rating selected' when value is 0", () => {
        render(
            <StarRatingInputGroup
                label="Rating"
                value={0}
                onValueChange={vi.fn()}
            />,
        );
        expect(screen.getByText(/No rating selected/)).toBeInTheDocument();
    });

    it("shows selected text when value > 0", () => {
        render(
            <StarRatingInputGroup
                label="Rating"
                value={3}
                onValueChange={vi.fn()}
            />,
        );
        expect(screen.getByText("Selected: 3 out of 5")).toBeInTheDocument();
    });

    it("calls onValueChange when star is clicked", () => {
        const onChange = vi.fn();
        render(
            <StarRatingInputGroup
                label="Rating"
                value={0}
                onValueChange={onChange}
            />,
        );
        const buttons = screen.getAllByRole("button");
        fireEvent.click(buttons[2]); // 3rd star
        expect(onChange).toHaveBeenCalledWith(3);
    });

    it("shows required indicator when showRequired is true", () => {
        render(
            <StarRatingInputGroup
                label="Rating"
                showRequired
                onValueChange={vi.fn()}
            />,
        );
        expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("shows error message", () => {
        render(
            <StarRatingInputGroup
                label="Rating"
                error="Required"
                value={0}
                onValueChange={vi.fn()}
            />,
        );
        expect(screen.getByText("Required")).toBeInTheDocument();
    });

    it("disables buttons when disabled", () => {
        render(
            <StarRatingInputGroup
                label="Rating"
                disabled
                onValueChange={vi.fn()}
            />,
        );
        const buttons = screen.getAllByRole("button");
        for (const button of buttons) {
            expect(button).toBeDisabled();
        }
    });
});
