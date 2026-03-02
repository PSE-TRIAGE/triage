import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {InputGroup} from "../InputGroup";

describe("InputGroup", () => {
    it("renders label", () => {
        render(<InputGroup label="Username" />);
        expect(screen.getByText("Username")).toBeInTheDocument();
    });

    it("shows required indicator when showRequired is true", () => {
        render(<InputGroup label="Name" showRequired />);
        expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("does not show required indicator by default", () => {
        render(<InputGroup label="Name" />);
        expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("renders error message", () => {
        render(<InputGroup label="Name" error="This field is required" />);
        expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("does not render error when not provided", () => {
        const {container} = render(<InputGroup label="Name" />);
        expect(container.querySelector(".text-destructive")).toBeNull();
    });

    it("sets aria-invalid when error is present", () => {
        render(<InputGroup label="Name" error="Error" />);
        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("renders as password type with toggle button", () => {
        render(<InputGroup label="Password" type="password" />);
        const input = screen
            .getByLabelText("Password", {exact: false})
            .closest("div")
            ?.querySelector("input");
        expect(input).toHaveAttribute("type", "password");
        expect(screen.getByLabelText("Show password")).toBeInTheDocument();
    });

    it("toggles password visibility", () => {
        render(<InputGroup label="Password" type="password" />);
        const toggleBtn = screen.getByLabelText("Show password");
        fireEvent.click(toggleBtn);
        expect(screen.getByLabelText("Hide password")).toBeInTheDocument();
    });

    it("accepts placeholder prop", () => {
        render(<InputGroup label="Email" placeholder="Enter email" />);
        expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    });
});
