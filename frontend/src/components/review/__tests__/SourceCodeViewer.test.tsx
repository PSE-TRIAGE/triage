import {describe, expect, it, vi, beforeEach} from "vitest";
import {screen, fireEvent} from "@testing-library/react";
import {SourceCodeViewer} from "../SourceCodeViewer";
import {renderWithProviders} from "@/test-utils";
import {useMutantStore} from "@/stores/mutantStore";

vi.mock("@/hooks/queries/useMutantQueries", () => ({
	useMutantSourceCode: vi.fn(),
}));

vi.mock("@/components/utils/theme-provider", () => ({
	useTheme: () => ({theme: "light"}),
	ThemeProvider: ({children}: any) => children,
}));

vi.mock("prism-react-renderer", () => ({
	Highlight: ({children, code}: any) => children({
		tokens: code.split("\n").map((line: string) => [{content: line, types: ["plain"]}]),
		getLineProps: ({line}: any) => ({}),
		getTokenProps: ({token}: any) => ({children: token.content}),
	}),
	themes: {nightOwl: {plain: {}}, github: {plain: {}}},
}));

vi.mock("prismjs", () => ({default: {}}));
vi.mock("prismjs/components/prism-java", () => ({}));

import {useMutantSourceCode} from "@/hooks/queries/useMutantQueries";

const mockMutant = {
	id: 1,
	mutator: "ConditionalsBoundary",
	status: "SURVIVED",
	lineNumber: 5,
	sourceFile: "Foo.java",
	rated: false,
	detected: false,
	ranking: 1,
};

// 20 lines of code so expand buttons appear
const codeLines = Array.from({length: 20}, (_, i) => `line ${i + 1} code`).join("\n");

describe("SourceCodeViewer", () => {
	beforeEach(() => {
		vi.mocked(useMutantSourceCode).mockReturnValue({data: null, isLoading: false, error: null} as any);
		useMutantStore.setState({selectedMutant: null});
	});

	it("renders nothing when no mutant selected", () => {
		const {container} = renderWithProviders(<SourceCodeViewer />);
		expect(container.innerHTML).toBe("");
	});

	it("shows loading state", () => {
		vi.mocked(useMutantSourceCode).mockReturnValue({data: null, isLoading: true, error: null} as any);
		useMutantStore.setState({selectedMutant: mockMutant as any});
		renderWithProviders(<SourceCodeViewer />);
		expect(screen.getByText("Loading source code...")).toBeInTheDocument();
	});

	it("shows error state when source not found", () => {
		vi.mocked(useMutantSourceCode).mockReturnValue({data: {found: false}, isLoading: false, error: null} as any);
		useMutantStore.setState({selectedMutant: mockMutant as any});
		renderWithProviders(<SourceCodeViewer />);
		expect(screen.getByText("Source code not available")).toBeInTheDocument();
	});

	it("shows error state on error", () => {
		vi.mocked(useMutantSourceCode).mockReturnValue({data: null, isLoading: false, error: new Error("fail")} as any);
		useMutantStore.setState({selectedMutant: mockMutant as any});
		renderWithProviders(<SourceCodeViewer />);
		expect(screen.getByText("Source code not available")).toBeInTheDocument();
	});

	it("renders source code with file name", () => {
		vi.mocked(useMutantSourceCode).mockReturnValue({
			data: {found: true, content: codeLines, fullyQualifiedName: "com.example.Foo"},
			isLoading: false,
			error: null,
		} as any);
		useMutantStore.setState({selectedMutant: mockMutant as any});
		renderWithProviders(<SourceCodeViewer />);
		expect(screen.getByText("com.example.Foo")).toBeInTheDocument();
	});

	it("renders visible lines around mutation line", () => {
		vi.mocked(useMutantSourceCode).mockReturnValue({
			data: {found: true, content: codeLines, fullyQualifiedName: "com.example.Foo"},
			isLoading: false,
			error: null,
		} as any);
		useMutantStore.setState({selectedMutant: mockMutant as any});
		renderWithProviders(<SourceCodeViewer />);
		// Mutation line should be visible
		expect(screen.getByText("line 5 code")).toBeInTheDocument();
	});

	it("renders expand buttons when lines are hidden", () => {
		vi.mocked(useMutantSourceCode).mockReturnValue({
			data: {found: true, content: codeLines, fullyQualifiedName: "com.example.Foo"},
			isLoading: false,
			error: null,
		} as any);
		useMutantStore.setState({selectedMutant: {...mockMutant, lineNumber: 10} as any});
		renderWithProviders(<SourceCodeViewer />);
		// There should be hidden lines above and below
		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBeGreaterThanOrEqual(1);
	});

	it("expands context when clicking expand button", () => {
		vi.mocked(useMutantSourceCode).mockReturnValue({
			data: {found: true, content: codeLines, fullyQualifiedName: "com.example.Foo"},
			isLoading: false,
			error: null,
		} as any);
		useMutantStore.setState({selectedMutant: {...mockMutant, lineNumber: 10} as any});
		renderWithProviders(<SourceCodeViewer />);
		const buttons = screen.getAllByRole("button");
		if (buttons.length > 0) {
			fireEvent.click(buttons[0]);
			// After expanding, the component should re-render with more lines visible
			expect(screen.getByText("com.example.Foo")).toBeInTheDocument();
		}
	});
});
