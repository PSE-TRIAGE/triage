import {describe, expect, it, vi, beforeEach} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useMe} from "../useUserQueries";

describe("useMe", () => {
	beforeEach(() => {
		localStorage.setItem("auth_token", "test-token");
	});

	it("calls authService.me", async () => {
		const me = vi.fn().mockResolvedValue({id: 1, username: "test"});
		const wrapper = createWrapper({authService: {me} as any});

		const {result} = renderHook(() => useMe(), {wrapper});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(me).toHaveBeenCalled();
		expect(result.current.data).toEqual({id: 1, username: "test"});
	});

	it("does not fetch without auth_token", () => {
		localStorage.clear();
		const me = vi.fn().mockResolvedValue({id: 1});
		const wrapper = createWrapper({authService: {me} as any});

		const {result} = renderHook(() => useMe(), {wrapper});
		expect(result.current.fetchStatus).toBe("idle");
	});
});
