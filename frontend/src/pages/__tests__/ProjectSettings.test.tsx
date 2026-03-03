import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {ProjectSettings} from "../ProjectSettings";
import {renderWithProviders} from "@/test-utils";

// Mock all tab components to avoid their dependencies
vi.mock("@/components/projectSettings/FormBuilderTab", () => ({
	FormBuilderTab: () => <div>FormBuilderTab</div>,
}));
vi.mock("@/components/projectSettings/AlgorithmSettingsTab", () => ({
	AlgorithmSettingsTab: () => <div>AlgorithmSettingsTab</div>,
}));
vi.mock("@/components/projectSettings/ExportDataTab", () => ({
	ExportDataTab: () => <div>ExportDataTab</div>,
}));
vi.mock("@/components/projectSettings/ProjectSettingsTab", () => ({
	ProjectSettingsTab: () => <div>ProjectSettingsTab</div>,
}));
vi.mock("@/components/projectSettings/ProjectMembersTab", () => ({
	ProjectMembersTab: () => <div>ProjectMembersTab</div>,
}));

describe("ProjectSettings", () => {
	it("renders page title", () => {
		renderWithProviders(<ProjectSettings />);
		expect(screen.getByText("Project Management")).toBeInTheDocument();
	});

	it("renders tab triggers", () => {
		renderWithProviders(<ProjectSettings />);
		expect(screen.getByText("Form Builder")).toBeInTheDocument();
		expect(screen.getByText("Algorithm Settings")).toBeInTheDocument();
		expect(screen.getByText("Export Data")).toBeInTheDocument();
		expect(screen.getByText("Members")).toBeInTheDocument();
		expect(screen.getByText("Settings")).toBeInTheDocument();
	});

	it("shows Form Builder tab by default", () => {
		renderWithProviders(<ProjectSettings />);
		expect(screen.getByText("FormBuilderTab")).toBeInTheDocument();
	});

	it("renders description", () => {
		renderWithProviders(<ProjectSettings />);
		expect(screen.getByText(/Configure data sources/)).toBeInTheDocument();
	});
});
