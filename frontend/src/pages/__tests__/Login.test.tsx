import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import {Login} from "../Login";
import {renderWithProviders} from "@/test-utils";
import {ApiError} from "@/api/client";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
}));

const mockUseLogin = vi.fn();
vi.mock("@/hooks/mutations/useAuthMutations", () => ({
	useLogin: (...args: any[]) => mockUseLogin(...args),
}));

describe("Login", () => {
	beforeEach(() => {
		mockUseLogin.mockReturnValue({mutate: vi.fn(), isPending: false, isError: false, error: null});
	});

	it("renders welcome text", () => {
		renderWithProviders(<Login />);
		expect(screen.getByText(/Welcome to Triage/)).toBeInTheDocument();
	});

	it("renders login heading", () => {
		renderWithProviders(<Login />);
		expect(screen.getByText(/Login to your/)).toBeInTheDocument();
	});

	it("renders username input", () => {
		renderWithProviders(<Login />);
		expect(screen.getByPlaceholderText("e.g. I ❤ Informatik")).toBeInTheDocument();
	});

	it("renders password input", () => {
		renderWithProviders(<Login />);
		expect(screen.getByPlaceholderText("e.g. BadPassword123")).toBeInTheDocument();
	});

	it("renders login button", () => {
		renderWithProviders(<Login />);
		expect(screen.getByText("Login")).toBeInTheDocument();
	});

	it("renders KIT footer text", () => {
		renderWithProviders(<Login />);
		expect(screen.getByText(/Praxis der Softwareentwicklungs/)).toBeInTheDocument();
	});

	it("shows 401 error message", () => {
		const err = new ApiError(401, "Unauthorized");
		mockUseLogin.mockReturnValue({
			mutate: vi.fn(), isPending: false, isError: true, error: err,
		});
		renderWithProviders(<Login />);
		expect(screen.getByText("Invalid username or password")).toBeInTheDocument();
	});

	it("shows 500 error message", () => {
		const err = new ApiError(500, "Internal Server Error");
		mockUseLogin.mockReturnValue({
			mutate: vi.fn(), isPending: false, isError: true, error: err,
		});
		renderWithProviders(<Login />);
		expect(screen.getByText("Server error, please try again later")).toBeInTheDocument();
	});

	it("shows generic error message for non-ApiError", () => {
		mockUseLogin.mockReturnValue({
			mutate: vi.fn(), isPending: false, isError: true,
			error: new Error("network error"),
		});
		renderWithProviders(<Login />);
		expect(screen.getByText("Login failed. Please try again.")).toBeInTheDocument();
	});

	it("renders login image", () => {
		renderWithProviders(<Login />);
		expect(screen.getByAltText("Login Page")).toBeInTheDocument();
	});
});
