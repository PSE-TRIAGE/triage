import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {DetailPanel} from "../DetailPanel";
import {renderWithProviders} from "@/test-utils";
import {useMutantStore} from "@/stores/mutantStore";

vi.mock("@/hooks/queries/useMutantQueries", () => ({
	useMutantDetails: () => ({data: null}),
	useMutantSourceCode: () => ({data: null, isLoading: false, error: null}),
}));

vi.mock("@/components/utils/theme-provider", () => ({
	useTheme: () => ({theme: "light"}),
	ThemeProvider: ({children}: any) => children,
}));

const mockMutant = {
	id: 1,
	mutator: "ConditionalsBoundaryMutator",
	status: "SURVIVED",
	lineNumber: 42,
	sourceFile: "com/example/Foo.java",
	rated: false,
	detected: false,
	ranking: 1,
};

describe("DetailPanel", () => {
	it("shows empty state when no mutant selected", () => {
		useMutantStore.setState({selectedMutant: null});
		renderWithProviders(<DetailPanel />);
		expect(screen.getByText("No Mutant Selected")).toBeInTheDocument();
	});

	it("shows mutant details when selected", () => {
		useMutantStore.setState({selectedMutant: mockMutant as any});
		renderWithProviders(<DetailPanel />);
		expect(screen.getByText("Mutant Details")).toBeInTheDocument();
	});

	it("shows source file info", () => {
		useMutantStore.setState({selectedMutant: mockMutant as any});
		renderWithProviders(<DetailPanel />);
		expect(screen.getByText("com/example/Foo.java")).toBeInTheDocument();
	});

	it("shows mutation context card", () => {
		useMutantStore.setState({selectedMutant: mockMutant as any});
		renderWithProviders(<DetailPanel />);
		expect(screen.getByText("Mutation Context")).toBeInTheDocument();
	});

	it("shows source code card", () => {
		useMutantStore.setState({selectedMutant: mockMutant as any});
		renderWithProviders(<DetailPanel />);
		expect(screen.getByText("Source Code")).toBeInTheDocument();
	});
});
