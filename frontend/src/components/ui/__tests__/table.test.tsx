import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "../table";

describe("Table", () => {
    it("renders a full table", () => {
        render(
            <Table>
                <TableCaption>A list of items</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Item 1</TableCell>
                        <TableCell>100</TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell>Total</TableCell>
                        <TableCell>100</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>,
        );
        expect(screen.getByText("A list of items")).toBeInTheDocument();
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("Total")).toBeInTheDocument();
    });

    it("renders data-slot attributes", () => {
        render(
            <Table data-testid="table">
                <TableHeader data-testid="header">
                    <TableRow data-testid="row">
                        <TableHead data-testid="head">H</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody data-testid="body">
                    <TableRow>
                        <TableCell data-testid="cell">C</TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter data-testid="footer">
                    <TableRow>
                        <TableCell>F</TableCell>
                    </TableRow>
                </TableFooter>
                <TableCaption data-testid="caption">Cap</TableCaption>
            </Table>,
        );
        expect(screen.getByTestId("table")).toHaveAttribute(
            "data-slot",
            "table",
        );
        expect(screen.getByTestId("header")).toHaveAttribute(
            "data-slot",
            "table-header",
        );
        expect(screen.getByTestId("body")).toHaveAttribute(
            "data-slot",
            "table-body",
        );
        expect(screen.getByTestId("footer")).toHaveAttribute(
            "data-slot",
            "table-footer",
        );
        expect(screen.getByTestId("row")).toHaveAttribute(
            "data-slot",
            "table-row",
        );
        expect(screen.getByTestId("head")).toHaveAttribute(
            "data-slot",
            "table-head",
        );
        expect(screen.getByTestId("cell")).toHaveAttribute(
            "data-slot",
            "table-cell",
        );
        expect(screen.getByTestId("caption")).toHaveAttribute(
            "data-slot",
            "table-caption",
        );
    });

    it("applies custom classNames", () => {
        render(
            <Table>
                <TableHeader className="hdr" data-testid="header">
                    <TableRow className="rw" data-testid="row">
                        <TableHead className="hd" data-testid="head">
                            H
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="cl" data-testid="cell">
                            C
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>,
        );
        expect(screen.getByTestId("header").className).toContain("hdr");
        expect(screen.getByTestId("row").className).toContain("rw");
        expect(screen.getByTestId("head").className).toContain("hd");
        expect(screen.getByTestId("cell").className).toContain("cl");
    });
});
