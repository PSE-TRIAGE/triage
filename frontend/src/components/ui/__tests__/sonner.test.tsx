import {describe, expect, it, vi} from "vitest";
import {render} from "@testing-library/react";

vi.mock("next-themes", () => ({
    useTheme: () => ({theme: "dark"}),
}));

import {Toaster} from "../sonner";

describe("Toaster", () => {
    it("renders without crashing", () => {
        const {container} = render(<Toaster />);
        expect(container).toBeTruthy();
    });

    it("renders with custom props", () => {
        const {container} = render(<Toaster position="top-center" />);
        expect(container).toBeTruthy();
    });
});
