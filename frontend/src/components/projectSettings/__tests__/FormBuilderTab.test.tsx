import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {FormBuilderTab} from "../FormBuilderTab";
import {renderWithProviders} from "@/test-utils";

vi.mock("@tanstack/react-router", () => ({
	useRouteContext: () => ({project: {id: 1, name: "Test Project"}}),
}));

// Stable reference to avoid infinite useEffect loop
const mockFields = [
	{id: 1, label: "Rating Field", type: "rating", position: 1, isRequired: true},
	{id: 2, label: "Comment Field", type: "text", position: 2, isRequired: false},
];

vi.mock("@/hooks/queries/useFormFieldQueries", () => ({
	useFormFields: () => ({
		data: mockFields,
		isLoading: false,
	}),
}));

vi.mock("@/hooks/mutations/useFormFieldMutations", () => ({
	useCreateFormField: () => ({mutate: vi.fn(), isPending: false}),
	useDeleteFormField: () => ({mutate: vi.fn(), isPending: false}),
	useReorderFormFields: () => ({mutate: vi.fn(), isPending: false}),
	useUpdateFormField: () => ({mutate: vi.fn(), isPending: false}),
}));

// Mock dnd-kit to avoid complex DOM interactions
vi.mock("@dnd-kit/core", () => ({
	DndContext: ({children}: any) => <div>{children}</div>,
	closestCenter: vi.fn(),
	KeyboardSensor: vi.fn(),
	PointerSensor: vi.fn(),
	useSensor: () => ({}),
	useSensors: () => [],
}));

vi.mock("@dnd-kit/sortable", () => ({
	SortableContext: ({children}: any) => <div>{children}</div>,
	sortableKeyboardCoordinates: vi.fn(),
	verticalListSortingStrategy: vi.fn(),
	useSortable: () => ({attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null}),
}));

describe("FormBuilderTab", () => {
	it("renders title", () => {
		renderWithProviders(<FormBuilderTab />);
		expect(screen.getByText("Review Form Builder")).toBeInTheDocument();
	});

	it("renders add field button", () => {
		renderWithProviders(<FormBuilderTab />);
		expect(screen.getByText("Add new Field")).toBeInTheDocument();
	});

	it("renders existing field cards", () => {
		renderWithProviders(<FormBuilderTab />);
		expect(screen.getByText("Rating Field")).toBeInTheDocument();
		expect(screen.getByText("Comment Field")).toBeInTheDocument();
	});

	it("renders field types", () => {
		renderWithProviders(<FormBuilderTab />);
		expect(screen.getByText("rating")).toBeInTheDocument();
		expect(screen.getByText("text")).toBeInTheDocument();
	});
});
