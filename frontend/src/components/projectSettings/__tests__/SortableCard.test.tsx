import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {SortableCard} from "../SortableCard";
import {renderWithProviders} from "@/test-utils";

vi.mock("@dnd-kit/sortable", () => ({
	useSortable: () => ({
		attributes: {},
		listeners: {},
		setNodeRef: vi.fn(),
		transform: null,
		transition: null,
		isDragging: false,
	}),
}));

vi.mock("@dnd-kit/utilities", () => ({
	CSS: {Transform: {toString: () => null}},
}));

vi.mock("@/hooks/mutations/useFormFieldMutations", () => ({
	useUpdateFormField: () => ({mutate: vi.fn(), isPending: false}),
}));

describe("SortableCard", () => {
	it("renders field label", () => {
		renderWithProviders(
			<SortableCard id={1} label="My Field" type="text" projectId={1} onDelete={vi.fn()} />,
		);
		expect(screen.getByText("My Field")).toBeInTheDocument();
	});

	it("renders field type", () => {
		renderWithProviders(
			<SortableCard id={1} label="Rating" type="rating" projectId={1} onDelete={vi.fn()} />,
		);
		expect(screen.getByText("rating")).toBeInTheDocument();
	});

	it("renders drag handle", () => {
		renderWithProviders(
			<SortableCard id={1} label="Test" type="text" projectId={1} onDelete={vi.fn()} />,
		);
		expect(screen.getByLabelText("Drag to reorder")).toBeInTheDocument();
	});
});
