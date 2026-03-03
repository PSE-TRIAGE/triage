import {describe, expect, it} from "vitest";
import reportWebVitals from "../reportWebVitals";

describe("reportWebVitals", () => {
	it("does nothing without a callback", () => {
		expect(() => reportWebVitals()).not.toThrow();
	});

	it("does nothing with non-function argument", () => {
		expect(() => reportWebVitals(undefined)).not.toThrow();
	});
});
