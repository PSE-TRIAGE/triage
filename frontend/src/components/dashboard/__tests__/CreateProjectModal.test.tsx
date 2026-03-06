import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {CreateProjectModal} from "../CreateProjectModal";
import {renderWithProviders} from "@/test-utils";

vi.mock("@/hooks/mutations/useProjectMutations", () => ({
    useCreateProject: () => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
    }),
    useUploadSourceCode: () => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
    }),
}));

describe("CreateProjectModal", () => {
    it("renders when open", () => {
        renderWithProviders(
            <CreateProjectModal open={true} handleClose={vi.fn()} />,
        );
        expect(screen.getByText("Create New Project")).toBeInTheDocument();
    });

    it("renders form fields", () => {
        renderWithProviders(
            <CreateProjectModal open={true} handleClose={vi.fn()} />,
        );
        expect(screen.getByText("Project Name")).toBeInTheDocument();
        expect(screen.getByText("mutations.xml File")).toBeInTheDocument();
        expect(screen.getByText("Source Code (.zip)")).toBeInTheDocument();
    });

    it("renders cancel and create buttons", () => {
        renderWithProviders(
            <CreateProjectModal open={true} handleClose={vi.fn()} />,
        );
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Create Project")).toBeInTheDocument();
    });

    it("does not render when closed", () => {
        renderWithProviders(
            <CreateProjectModal open={false} handleClose={vi.fn()} />,
        );
        expect(
            screen.queryByText("Create New Project"),
        ).not.toBeInTheDocument();
    });

    it("renders dialog description", () => {
        renderWithProviders(
            <CreateProjectModal open={true} handleClose={vi.fn()} />,
        );
        expect(
            screen.getByText(/Set up a new mutation testing project/),
        ).toBeInTheDocument();
    });

    it("renders project name placeholder", () => {
        renderWithProviders(
            <CreateProjectModal open={true} handleClose={vi.fn()} />,
        );
        expect(
            screen.getByPlaceholderText("e.g., Team 1 - Calculator"),
        ).toBeInTheDocument();
    });

    it("renders optional description for source code", () => {
        renderWithProviders(
            <CreateProjectModal open={true} handleClose={vi.fn()} />,
        );
        expect(
            screen.getByText("Optional: Upload project source code"),
        ).toBeInTheDocument();
    });
});
