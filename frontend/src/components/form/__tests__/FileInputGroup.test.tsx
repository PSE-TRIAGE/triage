import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {FileInputGroup} from "../FileInputGroup";

describe("FileInputGroup", () => {
    it("renders label", () => {
        render(<FileInputGroup label="Upload File" />);
        expect(screen.getByText("Upload File")).toBeInTheDocument();
    });

    it("shows required indicator when showRequired is true", () => {
        render(<FileInputGroup label="Upload" showRequired />);
        expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("renders default description when no file selected", () => {
        render(<FileInputGroup label="Upload" />);
        expect(screen.getByText("Click to Upload File")).toBeInTheDocument();
    });

    it("renders custom description", () => {
        render(
            <FileInputGroup label="Upload" description="Drop your file here" />,
        );
        expect(screen.getByText("Drop your file here")).toBeInTheDocument();
    });

    it("renders error message", () => {
        render(<FileInputGroup label="Upload" error="File is required" />);
        expect(screen.getByText("File is required")).toBeInTheDocument();
    });

    it("shows selected file name after upload", () => {
        const {container} = render(<FileInputGroup label="Upload" />);
        const input = container.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const file = new File(["hello"], "report.pdf", {
            type: "application/pdf",
        });

        fireEvent.change(input, {target: {files: [file]}});

        expect(screen.getByText("report.pdf")).toBeInTheDocument();
        expect(
            screen.queryByText("Click to Upload File"),
        ).not.toBeInTheDocument();
    });

    it("calls provided onChange when file changes", () => {
        const onChange = vi.fn();
        const {container} = render(
            <FileInputGroup label="Upload" onChange={onChange} />,
        );
        const input = container.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const file = new File(["hello"], "report.pdf", {
            type: "application/pdf",
        });

        fireEvent.change(input, {target: {files: [file]}});

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0].target.files[0]).toBe(file);
    });
});
