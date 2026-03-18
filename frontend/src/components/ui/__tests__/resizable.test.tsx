import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "../resizable";

describe("ResizablePanelGroup", () => {
    it("renders with data-slot", () => {
        render(
            <ResizablePanelGroup direction="horizontal" data-testid="group">
                <ResizablePanel defaultSize={50}>Panel 1</ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>Panel 2</ResizablePanel>
            </ResizablePanelGroup>,
        );
        expect(screen.getByTestId("group")).toHaveAttribute(
            "data-slot",
            "resizable-panel-group",
        );
        expect(screen.getByText("Panel 1")).toBeInTheDocument();
        expect(screen.getByText("Panel 2")).toBeInTheDocument();
    });

    it("renders handle with grip icon when withHandle is true", () => {
        render(
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50}>A</ResizablePanel>
                <ResizableHandle withHandle data-testid="handle" />
                <ResizablePanel defaultSize={50}>B</ResizablePanel>
            </ResizablePanelGroup>,
        );
        expect(screen.getByTestId("handle")).toHaveAttribute(
            "data-slot",
            "resizable-handle",
        );
    });

    it("renders handle without grip icon by default", () => {
        render(
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50}>A</ResizablePanel>
                <ResizableHandle data-testid="handle" />
                <ResizablePanel defaultSize={50}>B</ResizablePanel>
            </ResizablePanelGroup>,
        );
        expect(screen.getByTestId("handle")).toBeInTheDocument();
    });

    it("applies custom className", () => {
        render(
            <ResizablePanelGroup
                direction="horizontal"
                className="custom"
                data-testid="group"
            >
                <ResizablePanel defaultSize={100}>A</ResizablePanel>
            </ResizablePanelGroup>,
        );
        expect(screen.getByTestId("group").className).toContain("custom");
    });
});
