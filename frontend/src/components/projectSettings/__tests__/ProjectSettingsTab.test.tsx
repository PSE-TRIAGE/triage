import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {ProjectSettingsTab} from "../ProjectSettingsTab";
import {renderWithProviders} from "@/test-utils";

vi.mock("@tanstack/react-router", () => ({
    useRouteContext: () => ({project: {id: 1, name: "Test Project"}}),
}));

vi.mock("@/hooks/mutations/useProjectMutations", () => ({
    useDeleteProject: () => ({mutate: vi.fn(), isPending: false}),
    useRenameProject: () => ({mutateAsync: vi.fn(), isPending: false}),
    useUploadSourceCode: () => ({mutateAsync: vi.fn(), isPending: false}),
}));

describe("ProjectSettingsTab", () => {
    it("renders project name card", () => {
        renderWithProviders(<ProjectSettingsTab />);
        expect(screen.getByText("Project Name")).toBeInTheDocument();
    });

    it("renders source code upload card", () => {
        renderWithProviders(<ProjectSettingsTab />);
        expect(screen.getByText("Source Code")).toBeInTheDocument();
    });

    it("renders danger zone", () => {
        renderWithProviders(<ProjectSettingsTab />);
        expect(screen.getByText("Danger Zone")).toBeInTheDocument();
    });

    it("renders delete project button", () => {
        renderWithProviders(<ProjectSettingsTab />);
        expect(screen.getByText("Delete Project")).toBeInTheDocument();
    });

    it("renders save button", () => {
        renderWithProviders(<ProjectSettingsTab />);
        expect(screen.getByText("Save")).toBeInTheDocument();
    });

    it("renders upload button", () => {
        renderWithProviders(<ProjectSettingsTab />);
        expect(screen.getByText("Upload Source Code")).toBeInTheDocument();
    });
});
