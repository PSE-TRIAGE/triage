import {screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {renderWithProviders} from "@/test-utils";
import {DeactivateAccount} from "../DeactivateAccount";

vi.mock("@/hooks/mutations/useAuthMutations", () => ({
    useDeactivateAccount: () => ({mutateAsync: vi.fn(), isPending: false}),
}));

describe("DeactivateAccount", () => {
    it("renders danger zone card", () => {
        renderWithProviders(<DeactivateAccount />);
        expect(screen.getByText("Danger Zone")).toBeInTheDocument();
    });

    it("renders deactivate button", () => {
        renderWithProviders(<DeactivateAccount />);
        expect(screen.getByText("Deactivate this account")).toBeInTheDocument();
    });

    it("renders description text", () => {
        renderWithProviders(<DeactivateAccount />);
        expect(
            screen.getByText(/Sensitive actions that affect/),
        ).toBeInTheDocument();
    });
});
