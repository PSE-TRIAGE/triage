import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {GlobalHeader} from "../GlobalHeader";

vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock("@/hooks/mutations/useAuthMutations", () => ({
    useLogout: () => ({mutate: vi.fn(), isPending: false}),
}));

vi.mock("@/hooks/queries/useUserQueries", () => ({
    useMe: () => ({
        data: {username: "Test User", isAdmin: true},
        isLoading: false,
    }),
}));

describe("GlobalHeader", () => {
    it("renders Triage logo text", () => {
        render(<GlobalHeader />);
        expect(screen.getByText("Triage")).toBeInTheDocument();
    });

    it("renders user initials from username", () => {
        render(<GlobalHeader />);
        // "Test User" → split by space → ["T", "U"] → "TU"
        expect(screen.getByText("TU")).toBeInTheDocument();
    });

    it("renders dropdown trigger", () => {
        render(<GlobalHeader />);
        // Dropdown content is hidden until interacted with, just verify the trigger exists
        const trigger = document.querySelector(
            '[data-slot="dropdown-menu-trigger"]',
        );
        expect(trigger).toBeInTheDocument();
    });

    it("renders header element", () => {
        render(<GlobalHeader />);
        expect(document.querySelector("header")).toBeInTheDocument();
    });
});
