import {beforeEach, describe, expect, it, vi} from "vitest";

type QueryOptions = {
    queryKey: readonly unknown[];
    queryFn: () => Promise<unknown>;
};

async function loadAuthRoute() {
    const queryKeysMock = {
        auth: {
            me: ["auth", "me"] as const,
        },
    };
    const ensureQueryDataMock = vi.fn(async (options: QueryOptions) =>
        options.queryFn(),
    );
    const meMock = vi.fn(async () => ({id: 1, username: "alice"}));

    vi.doMock("@/lib/queryClient", () => ({
        queryClient: {
            ensureQueryData: ensureQueryDataMock,
        },
        queryKeys: queryKeysMock,
    }));
    vi.doMock("@/lib/services", () => ({
        services: {
            authService: {
                me: meMock,
            },
        },
    }));
    vi.doMock("@/components/utils/Toaster", () => ({
        Toaster: () => null,
    }));
    vi.doMock("@/components/Topbar/GlobalHeader", () => ({
        GlobalHeader: () => null,
    }));

    const module = await import("../_auth");
    return {
        Route: module.Route,
        queryKeysMock,
        ensureQueryDataMock,
        meMock,
    };
}

describe("routes/_auth beforeLoad", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("redirects to /login when auth_token is missing", async () => {
        const {Route, ensureQueryDataMock} = await loadAuthRoute();

        await expect(
            Route.options.beforeLoad?.({} as never),
        ).rejects.toMatchObject({
            options: {to: "/login"},
        });
        expect(ensureQueryDataMock).not.toHaveBeenCalled();
    });

    it("prefetches current user when auth_token exists", async () => {
        localStorage.setItem("auth_token", "valid-token");
        const {Route, queryKeysMock, ensureQueryDataMock, meMock} =
            await loadAuthRoute();

        await expect(
            Route.options.beforeLoad?.({} as never),
        ).resolves.toBeUndefined();
        expect(ensureQueryDataMock).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: queryKeysMock.auth.me,
                queryFn: expect.any(Function),
            }),
        );
        expect(meMock).toHaveBeenCalledTimes(1);
    });

    it("propagates me-query failures", async () => {
        localStorage.setItem("auth_token", "valid-token");
        const {Route, meMock} = await loadAuthRoute();
        const authError = new Error("me query failed");
        meMock.mockRejectedValueOnce(authError);

        await expect(Route.options.beforeLoad?.({} as never)).rejects.toBe(
            authError,
        );
    });
});
