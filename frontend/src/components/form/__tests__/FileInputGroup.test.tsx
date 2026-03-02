import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FileInputGroup } from "../FileInputGroup";

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
		render(<FileInputGroup label="Upload" description="Drop your file here" />);
		expect(screen.getByText("Drop your file here")).toBeInTheDocument();
	});

	it("renders error message", () => {
		render(<FileInputGroup label="Upload" error="File is required" />);
		expect(screen.getByText("File is required")).toBeInTheDocument();
	});
});
