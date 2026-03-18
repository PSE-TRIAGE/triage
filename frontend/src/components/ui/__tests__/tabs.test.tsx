import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../tabs";

describe("Tabs", () => {
    it("renders with data-slot attributes", () => {
        render(
            <Tabs defaultValue="a" data-testid="tabs">
                <TabsList data-testid="list">
                    <TabsTrigger value="a">Tab A</TabsTrigger>
                    <TabsTrigger value="b">Tab B</TabsTrigger>
                </TabsList>
                <TabsContent value="a" data-testid="content-a">
                    Content A
                </TabsContent>
                <TabsContent value="b">Content B</TabsContent>
            </Tabs>,
        );
        expect(screen.getByTestId("tabs")).toHaveAttribute("data-slot", "tabs");
        expect(screen.getByTestId("list")).toHaveAttribute(
            "data-slot",
            "tabs-list",
        );
        expect(screen.getByTestId("content-a")).toHaveAttribute(
            "data-slot",
            "tabs-content",
        );
    });

    it("shows active tab content", () => {
        render(
            <Tabs defaultValue="a">
                <TabsList>
                    <TabsTrigger value="a">Tab A</TabsTrigger>
                    <TabsTrigger value="b">Tab B</TabsTrigger>
                </TabsList>
                <TabsContent value="a">Content A</TabsContent>
                <TabsContent value="b">Content B</TabsContent>
            </Tabs>,
        );
        expect(screen.getByText("Content A")).toBeInTheDocument();
        expect(screen.getByText("Tab A")).toBeInTheDocument();
        expect(screen.getByText("Tab B")).toBeInTheDocument();
    });

    it("applies custom className", () => {
        render(
            <Tabs defaultValue="a" className="custom" data-testid="tabs">
                <TabsList className="list-cls" data-testid="list">
                    <TabsTrigger
                        value="a"
                        className="trig-cls"
                        data-testid="trigger"
                    >
                        A
                    </TabsTrigger>
                </TabsList>
                <TabsContent
                    value="a"
                    className="content-cls"
                    data-testid="content"
                >
                    C
                </TabsContent>
            </Tabs>,
        );
        expect(screen.getByTestId("tabs").className).toContain("custom");
        expect(screen.getByTestId("list").className).toContain("list-cls");
        expect(screen.getByTestId("trigger").className).toContain("trig-cls");
        expect(screen.getByTestId("content").className).toContain(
            "content-cls",
        );
    });
});
