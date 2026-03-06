import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {TextareaInputGroup} from "../TextareaInputGroup";

describe("TextareaInputGroup", () => {
    it("renders label", () => {
        render(<TextareaInputGroup label="Comments" />);
        expect(screen.getByText("Comments")).toBeInTheDocument();
    });

    it("shows required indicator when showRequired is true", () => {
        render(<TextareaInputGroup label="Notes" showRequired />);
        expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("renders error message", () => {
        render(<TextareaInputGroup label="Notes" error="Required field" />);
        expect(screen.getByText("Required field")).toBeInTheDocument();
    });

    it("sets aria-invalid when error is present", () => {
        render(<TextareaInputGroup label="Notes" error="Error" />);
        const textarea = screen.getByRole("textbox");
        expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    it("does not show error when not provided", () => {
        const {container} = render(<TextareaInputGroup label="Notes" />);
        expect(
            container.querySelector("span.text-destructive.font-medium"),
        ).toBeNull();
        expect(screen.getByRole("textbox")).toHaveAttribute(
            "aria-invalid",
            "false",
        );
    });
});
