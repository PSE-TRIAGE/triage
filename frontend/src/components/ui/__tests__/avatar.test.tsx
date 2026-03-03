import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {Avatar, AvatarImage, AvatarFallback} from "../avatar";

describe("Avatar", () => {
	it("renders with data-slot attribute", () => {
		render(<Avatar data-testid="avatar" />);
		expect(screen.getByTestId("avatar")).toHaveAttribute("data-slot", "avatar");
	});

	it("renders fallback text", () => {
		render(
			<Avatar>
				<AvatarFallback>AB</AvatarFallback>
			</Avatar>,
		);
		expect(screen.getByText("AB")).toBeInTheDocument();
	});

	it("renders image element", () => {
		const {container} = render(
			<Avatar>
				<AvatarImage src="test.png" alt="avatar" />
				<AvatarFallback>AB</AvatarFallback>
			</Avatar>,
		);
		const avatar = container.querySelector('[data-slot="avatar"]');
		expect(avatar).toBeTruthy();
	});

	it("applies custom className", () => {
		render(<Avatar className="custom-class" data-testid="avatar" />);
		expect(screen.getByTestId("avatar").className).toContain("custom-class");
	});

	it("renders fallback with data-slot", () => {
		render(
			<Avatar>
				<AvatarFallback data-testid="fallback">AB</AvatarFallback>
			</Avatar>,
		);
		expect(screen.getByTestId("fallback")).toHaveAttribute(
			"data-slot",
			"avatar-fallback",
		);
	});
});
