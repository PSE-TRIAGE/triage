import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {ChangeAdminStatus} from "../ChangeAdminStatus";
import {renderWithProviders} from "@/test-utils";

vi.mock("@/hooks/mutations/useAdminMutations", () => ({
	useAdminChangeRole: () => ({mutateAsync: vi.fn(), isPending: false}),
}));

const regularUser = {id: 1, username: "user1", isAdmin: false, isActive: true};
const adminUser = {id: 2, username: "admin1", isAdmin: true, isActive: true};

describe("ChangeAdminStatus", () => {
	it("shows Make Admin for regular user", () => {
		renderWithProviders(<ChangeAdminStatus user={regularUser as any} />);
		expect(screen.getByText("Make Admin")).toBeInTheDocument();
	});

	it("shows Remove Admin for admin user", () => {
		renderWithProviders(<ChangeAdminStatus user={adminUser as any} />);
		expect(screen.getByText("Remove Admin")).toBeInTheDocument();
	});
});
