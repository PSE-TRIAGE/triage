import {beforeEach, describe, expect, it, vi} from "vitest";
import {renderHook, waitFor} from "@testing-library/react";
import {createWrapper} from "@/test-utils";
import {useMe} from "../useUserQueries";

describe("useMe", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("fetches current user when auth token exists", async () => {
        localStorage.setItem("auth_token", "test-token");
        const me = vi.fn().mockResolvedValue({id: "1", username: "test-user"});
        const wrapper = createWrapper({authService: {me} as any});
        const {result} = renderHook(() => useMe(), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(me).toHaveBeenCalledTimes(1);
        expect(result.current.data).toEqual({id: "1", username: "test-user"});
    });

    it("does not fetch when auth token is missing", () => {
        const me = vi.fn().mockResolvedValue({id: "1"});
        const wrapper = createWrapper({authService: {me} as any});
        const {result} = renderHook(() => useMe(), {wrapper});

        expect(result.current.fetchStatus).toBe("idle");
        expect(me).not.toHaveBeenCalled();
    });

    it("surfaces query errors", async () => {
        localStorage.setItem("auth_token", "test-token");
        const me = vi.fn().mockRejectedValue(new Error("failed"));
        const wrapper = createWrapper({authService: {me} as any});
        const {result} = renderHook(() => useMe(), {wrapper});

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(me).toHaveBeenCalledTimes(1);
    });
});
