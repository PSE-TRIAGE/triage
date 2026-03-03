import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
	DialogClose,
	DialogOverlay,
	DialogPortal,
} from "../dialog";

describe("Dialog", () => {
	it("renders trigger", () => {
		render(
			<Dialog>
				<DialogTrigger>Open</DialogTrigger>
			</Dialog>,
		);
		expect(screen.getByText("Open")).toBeInTheDocument();
	});

	it("renders content with title and description when open", () => {
		render(
			<Dialog open>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Dialog Title</DialogTitle>
						<DialogDescription>Dialog Description</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose>Dismiss</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>,
		);
		expect(screen.getByText("Dialog Title")).toBeInTheDocument();
		expect(screen.getByText("Dialog Description")).toBeInTheDocument();
		expect(screen.getByText("Dismiss")).toBeInTheDocument();
	});

	it("renders close button by default", () => {
		render(
			<Dialog open>
				<DialogContent>
					<DialogTitle>Title</DialogTitle>
				</DialogContent>
			</Dialog>,
		);
		const srOnly = document.querySelector(".sr-only");
		expect(srOnly?.textContent).toBe("Close");
	});

	it("hides close button when showCloseButton is false", () => {
		render(
			<Dialog open>
				<DialogContent showCloseButton={false}>
					<DialogTitle>Title</DialogTitle>
				</DialogContent>
			</Dialog>,
		);
		const srOnly = document.querySelector(".sr-only");
		expect(srOnly).toBeNull();
	});

	it("renders overlay with data-slot", () => {
		render(
			<Dialog open>
				<DialogPortal>
					<DialogOverlay data-testid="overlay" />
				</DialogPortal>
			</Dialog>,
		);
		expect(screen.getByTestId("overlay")).toHaveAttribute(
			"data-slot",
			"dialog-overlay",
		);
	});

	it("applies custom className to header and footer", () => {
		render(
			<Dialog open>
				<DialogContent>
					<DialogTitle>T</DialogTitle>
					<DialogHeader className="h-class" data-testid="header">H</DialogHeader>
					<DialogFooter className="f-class" data-testid="footer">F</DialogFooter>
				</DialogContent>
			</Dialog>,
		);
		expect(screen.getByTestId("header").className).toContain("h-class");
		expect(screen.getByTestId("footer").className).toContain("f-class");
	});
});
