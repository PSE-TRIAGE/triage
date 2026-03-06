import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogOverlay,
    AlertDialogPortal,
} from "../alert-dialog";

describe("AlertDialog", () => {
    it("renders trigger", () => {
        render(
            <AlertDialog>
                <AlertDialogTrigger>Open</AlertDialogTrigger>
            </AlertDialog>,
        );
        expect(screen.getByText("Open")).toBeInTheDocument();
    });

    it("renders content when open", () => {
        render(
            <AlertDialog open>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Title</AlertDialogTitle>
                        <AlertDialogDescription>
                            Description
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>,
        );
        expect(screen.getByText("Title")).toBeInTheDocument();
        expect(screen.getByText("Description")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Continue")).toBeInTheDocument();
    });

    it("renders overlay with data-slot", () => {
        render(
            <AlertDialog open>
                <AlertDialogPortal>
                    <AlertDialogOverlay data-testid="overlay" />
                </AlertDialogPortal>
            </AlertDialog>,
        );
        expect(screen.getByTestId("overlay")).toHaveAttribute(
            "data-slot",
            "alert-dialog-overlay",
        );
    });

    it("applies custom className to header", () => {
        render(
            <AlertDialog open>
                <AlertDialogContent>
                    <AlertDialogHeader
                        className="custom-header"
                        data-testid="header"
                    >
                        Header
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>,
        );
        expect(screen.getByTestId("header").className).toContain(
            "custom-header",
        );
    });

    it("applies custom className to footer", () => {
        render(
            <AlertDialog open>
                <AlertDialogContent>
                    <AlertDialogFooter
                        className="custom-footer"
                        data-testid="footer"
                    >
                        Footer
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>,
        );
        expect(screen.getByTestId("footer").className).toContain(
            "custom-footer",
        );
    });
});
