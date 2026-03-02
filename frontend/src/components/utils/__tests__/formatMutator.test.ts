import { describe, it, expect } from "vitest";
import { formatMutatorForLineBreaks } from "../formatMutator";

describe("formatMutatorForLineBreaks", () => {
	it("inserts zero-width space after dots", () => {
		const result = formatMutatorForLineBreaks("org.pitest.mutationtest");
		expect(result).toBe("org.\u200bpitest.\u200bmutationtest");
	});

	it("handles string without dots", () => {
		const result = formatMutatorForLineBreaks("NoDots");
		expect(result).toBe("NoDots");
	});

	it("handles empty string", () => {
		const result = formatMutatorForLineBreaks("");
		expect(result).toBe("");
	});

	it("handles multiple consecutive dots", () => {
		const result = formatMutatorForLineBreaks("a..b");
		expect(result).toBe("a.\u200b.\u200bb");
	});

	it("handles dot at the end", () => {
		const result = formatMutatorForLineBreaks("end.");
		expect(result).toBe("end.\u200b");
	});
});
