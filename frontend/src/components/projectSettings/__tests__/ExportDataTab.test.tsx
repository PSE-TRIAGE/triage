import {screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {renderWithProviders} from "@/test-utils";
import {ExportDataTab} from "../ExportDataTab";

vi.mock("@tanstack/react-router", () => ({
    useRouteContext: () => ({project: {id: 1, name: "Test Project"}}),
}));

vi.mock("@/hooks/queries/useExportQueries", () => ({
    useExportPreview: () => ({
        data: {
            project_name: "Test Project",
            stats: {
                total_mutants: 100,
                total_ratings: 50,
                unique_reviewers: 5,
                completion_percentage: 50.0,
            },
            sample_entries: [
                {
                    mutant_id: 1,
                    status: "SURVIVED",
                    reviewer_username: "user1",
                    mutator: "ConditionalsBoundary",
                    mutated_class: "Foo",
                    mutated_method: "bar",
                    line_number: 42,
                    field_values: [{form_field_id: 1, value: "good"}],
                },
            ],
        },
        isLoading: false,
    }),
}));

vi.mock("@/hooks/mutations/useExportMutations", () => ({
    useExportDownload: () => ({mutateAsync: vi.fn(), isPending: false}),
}));

describe("ExportDataTab", () => {
    it("renders JSON Export card", () => {
        renderWithProviders(<ExportDataTab />);
        expect(screen.getByText("JSON Export")).toBeInTheDocument();
    });

    it("renders download button", () => {
        renderWithProviders(<ExportDataTab />);
        expect(screen.getByText("Download JSON")).toBeInTheDocument();
    });

    it("renders export statistics", () => {
        renderWithProviders(<ExportDataTab />);
        expect(screen.getByText("Export Statistics")).toBeInTheDocument();
        expect(screen.getByText("100")).toBeInTheDocument();
        expect(screen.getByText("50")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("50.00%")).toBeInTheDocument();
    });

    it("renders data preview table", () => {
        renderWithProviders(<ExportDataTab />);
        expect(screen.getByText("Data Preview")).toBeInTheDocument();
        expect(screen.getByText("user1")).toBeInTheDocument();
    });

    it("renders export information", () => {
        renderWithProviders(<ExportDataTab />);
        expect(screen.getByText("Export Information")).toBeInTheDocument();
    });
});
