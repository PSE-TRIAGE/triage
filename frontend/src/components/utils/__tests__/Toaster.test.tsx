import {describe, expect, it, vi} from "vitest";
import {render} from "@testing-library/react";
import {Toaster} from "../Toaster";

vi.mock("sonner", () => ({
	Toaster: ({...props}: any) => <div data-testid="sonner" {...props} />,
}));

describe("Toaster", () => {
	it("renders without crashing", () => {
		const {container} = render(<Toaster />);
		expect(container).toBeTruthy();
	});
});
