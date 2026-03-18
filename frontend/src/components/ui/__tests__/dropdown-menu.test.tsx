import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "../dropdown-menu";

describe("DropdownMenu", () => {
    it("renders trigger", () => {
        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
            </DropdownMenu>,
        );
        expect(screen.getByText("Menu")).toBeInTheDocument();
    });

    it("renders content when open", () => {
        render(
            <DropdownMenu open>
                <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Label</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>Item 1</DropdownMenuItem>
                        <DropdownMenuItem>
                            Item 2
                            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>,
        );
        expect(screen.getByText("Label")).toBeInTheDocument();
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("⌘K")).toBeInTheDocument();
    });

    it("renders checkbox items", () => {
        render(
            <DropdownMenu open>
                <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuCheckboxItem checked>
                        Checked Item
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        );
        expect(screen.getByText("Checked Item")).toBeInTheDocument();
    });

    it("renders radio items", () => {
        render(
            <DropdownMenu open>
                <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuRadioGroup value="a">
                        <DropdownMenuRadioItem value="a">
                            A
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="b">
                            B
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>,
        );
        expect(screen.getByText("A")).toBeInTheDocument();
        expect(screen.getByText("B")).toBeInTheDocument();
    });

    it("renders sub menu", () => {
        render(
            <DropdownMenu open>
                <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuSub open>
                        <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem>Sub Item</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>,
        );
        expect(screen.getByText("More")).toBeInTheDocument();
    });

    it("renders item with inset", () => {
        render(
            <DropdownMenu open>
                <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
                    <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
                </DropdownMenuContent>
            </DropdownMenu>,
        );
        expect(screen.getByText("Inset Item")).toHaveAttribute(
            "data-inset",
            "true",
        );
        expect(screen.getByText("Inset Label")).toHaveAttribute(
            "data-inset",
            "true",
        );
    });

    it("renders destructive variant", () => {
        render(
            <DropdownMenu open>
                <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem variant="destructive">
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        );
        expect(screen.getByText("Delete")).toHaveAttribute(
            "data-variant",
            "destructive",
        );
    });

    it("renders shortcut with data-slot", () => {
        render(
            <DropdownMenu open>
                <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>
                        Cut
                        <DropdownMenuShortcut data-testid="shortcut">
                            ⌘X
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        );
        expect(screen.getByTestId("shortcut")).toHaveAttribute(
            "data-slot",
            "dropdown-menu-shortcut",
        );
    });

    it("renders sub trigger with inset", () => {
        render(
            <DropdownMenu open>
                <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger inset>
                            Sub
                        </DropdownMenuSubTrigger>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>,
        );
        expect(screen.getByText("Sub").closest("[data-slot]")).toHaveAttribute(
            "data-inset",
            "true",
        );
    });
});
