import {describe, expect, it, vi, beforeEach} from "vitest";
import {render, screen} from "@testing-library/react";
import {Toaster} from "../Toaster";

const mockSonner = vi.hoisted(() => vi.fn(() => <div data-testid="sonner" />));

vi.mock("sonner", () => ({
	Toaster: (props: any) => mockSonner(props),
}));

describe("Toaster", () => {
	beforeEach(() => {
		mockSonner.mockClear();
	});

	it("renders Sonner with expected defaults", () => {
		render(<Toaster />);

		expect(screen.getByTestId("sonner")).toBeInTheDocument();
		expect(mockSonner).toHaveBeenCalledTimes(1);

		const sonnerProps = mockSonner.mock.calls[0][0];
		expect(sonnerProps.className).toBe("toaster group");
		expect(sonnerProps.position).toBe("bottom-right");
		expect(sonnerProps.toastOptions).toEqual(
			expect.objectContaining({
				classNames: expect.objectContaining({
					toast: expect.stringContaining("group toast"),
					success: expect.stringContaining("border-success"),
					error: expect.stringContaining("border-destructive"),
				}),
			}),
		);
	});
});
