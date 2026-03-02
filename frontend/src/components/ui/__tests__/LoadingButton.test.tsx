import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {LoadingButton} from "../LoadingButton";

describe("LoadingButton", () => {
    it("renders children when not loading", () => {
        render(<LoadingButton>Submit</LoadingButton>);
        expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    it("shows loadingText when loading", () => {
        render(
            <LoadingButton loading loadingText="Saving...">
                Submit
            </LoadingButton>,
        );
        expect(screen.getByText("Saving...")).toBeInTheDocument();
        expect(screen.queryByText("Submit")).not.toBeInTheDocument();
    });

    it("is disabled when loading", () => {
        render(
            <LoadingButton loading loadingText="Loading...">
                Submit
            </LoadingButton>,
        );
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("is disabled when disabled prop is true", () => {
        render(<LoadingButton disabled>Submit</LoadingButton>);
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("is not disabled when neither loading nor disabled", () => {
        render(<LoadingButton>Submit</LoadingButton>);
        expect(screen.getByRole("button")).not.toBeDisabled();
    });

    it("renders icon when not loading", () => {
        render(
            <LoadingButton icon={<span data-testid="icon">🚀</span>}>
                Submit
            </LoadingButton>,
        );
        expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("hides icon when loading", () => {
        render(
            <LoadingButton
                loading
                loadingText="Loading..."
                icon={<span data-testid="icon">🚀</span>}
            >
                Submit
            </LoadingButton>,
        );
        expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
    });
});
