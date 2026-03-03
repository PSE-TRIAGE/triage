import {describe, expect, it, vi, beforeEach} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useAlgorithms} from "../useAlgorithms";

describe("useAlgorithms", () => {
	beforeEach(() => {
		localStorage.setItem("auth_token", "test-token");
	});

	it("calls algorithmsService.listAlgorithms", async () => {
		const listAlgorithms = vi.fn().mockResolvedValue([{id: "1", name: "algo"}]);
		const wrapper = createWrapper({algorithmsService: {listAlgorithms} as any});

		const {result} = renderHook(() => useAlgorithms(), {wrapper});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(listAlgorithms).toHaveBeenCalled();
	});
});
