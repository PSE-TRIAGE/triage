import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../card";

describe("Card", () => {
    it("renders with data-slot card", () => {
        render(<Card data-testid="card">Content</Card>);
        expect(screen.getByTestId("card")).toHaveAttribute("data-slot", "card");
    });

    it("applies custom className", () => {
        render(
            <Card className="custom" data-testid="card">
                Content
            </Card>,
        );
        expect(screen.getByTestId("card").className).toContain("custom");
    });
});

describe("CardHeader", () => {
    it("renders with data-slot card-header", () => {
        render(<CardHeader data-testid="header">Header</CardHeader>);
        expect(screen.getByTestId("header")).toHaveAttribute(
            "data-slot",
            "card-header",
        );
    });
});

describe("CardTitle", () => {
    it("renders with data-slot card-title", () => {
        render(<CardTitle data-testid="title">Title</CardTitle>);
        expect(screen.getByTestId("title")).toHaveAttribute(
            "data-slot",
            "card-title",
        );
    });

    it("renders text content", () => {
        render(<CardTitle>My Title</CardTitle>);
        expect(screen.getByText("My Title")).toBeInTheDocument();
    });
});

describe("CardDescription", () => {
    it("renders with data-slot card-description", () => {
        render(
            <CardDescription data-testid="desc">Description</CardDescription>,
        );
        expect(screen.getByTestId("desc")).toHaveAttribute(
            "data-slot",
            "card-description",
        );
    });
});

describe("CardContent", () => {
    it("renders with data-slot card-content", () => {
        render(<CardContent data-testid="content">Content</CardContent>);
        expect(screen.getByTestId("content")).toHaveAttribute(
            "data-slot",
            "card-content",
        );
    });
});

describe("CardFooter", () => {
    it("renders with data-slot card-footer", () => {
        render(<CardFooter data-testid="footer">Footer</CardFooter>);
        expect(screen.getByTestId("footer")).toHaveAttribute(
            "data-slot",
            "card-footer",
        );
    });
});

describe("CardAction", () => {
    it("renders with data-slot card-action", () => {
        render(<CardAction data-testid="action">Action</CardAction>);
        expect(screen.getByTestId("action")).toHaveAttribute(
            "data-slot",
            "card-action",
        );
    });
});
