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
    it("renders all tab triggers", () => {
        renderWithProviders(<ProjectSettings />);
        expect(
            screen.getByRole("tab", {name: "Form Builder"}),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("tab", {name: "Algorithm Settings"}),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("tab", {name: "Export Data"}),
        ).toBeInTheDocument();
        expect(screen.getByRole("tab", {name: "Members"})).toBeInTheDocument();
        expect(screen.getByRole("tab", {name: "Settings"})).toBeInTheDocument();
    });

    it("shows Form Builder content by default", () => {
        renderWithProviders(<ProjectSettings />);
        expect(screen.getByText("FormBuilderTab")).toBeInTheDocument();
        expect(screen.queryByText("ProjectMembersTab")).not.toBeInTheDocument();
    });

    it("marks the first tab as selected by default", () => {
        renderWithProviders(<ProjectSettings />);
        expect(screen.getByRole("tab", {name: "Form Builder"})).toHaveAttribute(
            "aria-selected",
            "true",
        );
        expect(screen.getByRole("tab", {name: "Members"})).toHaveAttribute(
            "aria-selected",
            "false",
        );
    });

    it("renders page context header", () => {
        renderWithProviders(<ProjectSettings />);
        expect(screen.getByText("Project Management")).toBeInTheDocument();
        expect(screen.getByText(/Configure data sources/)).toBeInTheDocument();
    });
});
