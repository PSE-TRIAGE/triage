import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { getStatusBadge } from "../getStatusBadge";
import type { MutantOverview } from "@/api/services/mutants.service";

const makeMutant = (status: MutantOverview["status"]): MutantOverview => ({
	id: 1,
	detected: true,
	status,
	sourceFile: "Foo.java",
	lineNumber: 42,
	mutator: "SomeMutator",
	ranking: 1,
	rated: false,
});

describe("getStatusBadge", () => {
	it("renders Survived badge for SURVIVED status", () => {
		const { getByText } = render(<>{getStatusBadge(makeMutant("SURVIVED"))}</>);
		expect(getByText("Survived")).toBeInTheDocument();
	});

	it("renders Killed badge for KILLED status", () => {
		const { getByText } = render(<>{getStatusBadge(makeMutant("KILLED"))}</>);
		expect(getByText("Killed")).toBeInTheDocument();
	});

	it("renders Timeout badge for TIMED_OUT status", () => {
		const { getByText } = render(<>{getStatusBadge(makeMutant("TIMED_OUT"))}</>);
		expect(getByText("Timeout")).toBeInTheDocument();
	});

	it("renders No Coverage badge for NO_COVERAGE status", () => {
		const { getByText } = render(<>{getStatusBadge(makeMutant("NO_COVERAGE"))}</>);
		expect(getByText("No Coverage")).toBeInTheDocument();
	});

	it("renders raw status for unknown status types", () => {
		const { getByText } = render(<>{getStatusBadge(makeMutant("RUN_ERROR"))}</>);
		expect(getByText("RUN ERROR")).toBeInTheDocument();
	});

	it("renders NON_VIABLE as default badge", () => {
		const { getByText } = render(<>{getStatusBadge(makeMutant("NON_VIABLE"))}</>);
		expect(getByText("NON VIABLE")).toBeInTheDocument();
	});

	it("renders MEMORY_ERROR as default badge", () => {
		const { getByText } = render(<>{getStatusBadge(makeMutant("MEMORY_ERROR"))}</>);
		expect(getByText("MEMORY ERROR")).toBeInTheDocument();
	});
});
