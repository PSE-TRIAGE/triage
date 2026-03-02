import {describe, expect, it} from "vitest";
import {cn} from "../utils";

describe("cn utility", () => {
    it("merges class names", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("handles conditional classes", () => {
        expect(cn("base", false && "hidden", "visible")).toBe("base visible");
    });

    it("merges tailwind classes correctly", () => {
        expect(cn("px-4", "px-6")).toBe("px-6");
    });

    it("handles undefined and null inputs", () => {
        expect(cn("base", undefined, null)).toBe("base");
    });

    it("handles empty input", () => {
        expect(cn()).toBe("");
    });

    it("handles arrays", () => {
        expect(cn(["foo", "bar"])).toBe("foo bar");
    });
});
