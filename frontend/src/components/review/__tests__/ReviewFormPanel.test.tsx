import {describe, expect, it, vi, beforeEach} from "vitest";
import {screen} from "@testing-library/react";
import {ReviewFormPanel} from "../ReviewFormPanel";
import {renderWithProviders} from "@/test-utils";
import {useMutantStore} from "@/stores/mutantStore";

const mockUseRating = vi.fn();
vi.mock("@/hooks/queries/useRatingQueries", () => ({
	useRating: (...args: any[]) => mockUseRating(...args),
}));

vi.mock("@/hooks/mutations/useRatingMutations", () => ({
	useSubmitRating: () => ({mutateAsync: vi.fn(), isPending: false}),
}));

const mockMutant = {
	id: 1,
	mutator: "ConditionalsBoundary",
	status: "SURVIVED",
	lineNumber: 42,
	sourceFile: "Foo.java",
	rated: false,
	detected: false,
	ranking: 1,
};

const allFieldTypes = [
	{id: 1, label: "Rating", type: "rating" as const, position: 1, isRequired: true},
	{id: 2, label: "Comment", type: "text" as const, position: 2, isRequired: false},
	{id: 3, label: "Count", type: "integer" as const, position: 3, isRequired: false},
	{id: 4, label: "Is Valid", type: "checkbox" as const, position: 4, isRequired: false},
];

describe("ReviewFormPanel", () => {
	beforeEach(() => {
		useMutantStore.setState({selectedMutant: mockMutant as any});
		mockUseRating.mockReturnValue({data: null});
	});

	it("renders review panel title", () => {
		renderWithProviders(
			<ReviewFormPanel projectId={1} formFields={allFieldTypes as any} />,
		);
		expect(screen.getByText("Review Panel")).toBeInTheDocument();
	});

	it("renders submit button", () => {
		renderWithProviders(
			<ReviewFormPanel projectId={1} formFields={allFieldTypes as any} />,
		);
		expect(screen.getByText("Submit Review")).toBeInTheDocument();
	});

	it("renders rating field label", () => {
		renderWithProviders(
			<ReviewFormPanel projectId={1} formFields={allFieldTypes as any} />,
		);
		expect(screen.getByText("Rating")).toBeInTheDocument();
	});

	it("renders text field label", () => {
		renderWithProviders(
			<ReviewFormPanel projectId={1} formFields={allFieldTypes as any} />,
		);
		expect(screen.getByText("Comment")).toBeInTheDocument();
	});

	it("renders integer field label", () => {
		renderWithProviders(
			<ReviewFormPanel projectId={1} formFields={allFieldTypes as any} />,
		);
		expect(screen.getByText("Count")).toBeInTheDocument();
	});

	it("renders checkbox field label", () => {
		renderWithProviders(
			<ReviewFormPanel projectId={1} formFields={allFieldTypes as any} />,
		);
		expect(screen.getByText("Is Valid")).toBeInTheDocument();
	});

	it("shows Update Review button when existing rating exists", () => {
		mockUseRating.mockReturnValue({
			data: {mutantId: 1, fieldValues: [{form_field_id: 2, value: "test"}]},
		});
		renderWithProviders(
			<ReviewFormPanel projectId={1} formFields={allFieldTypes as any} />,
		);
		expect(screen.getByText("Update Review")).toBeInTheDocument();
	});
});
