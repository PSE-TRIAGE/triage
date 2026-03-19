import {describe, expect, it} from "vitest";
import {Route as AuthIndexRoute} from "../_auth/index";
import {Route as ProjectIndexRoute} from "../_auth/project/$projectId/index";

describe("redirect-only routes", () => {
    it("redirects /_auth/ to /dashboard", async () => {
        await expect(
            (async () => AuthIndexRoute.options.beforeLoad?.({} as never))(),
        ).rejects.toMatchObject({
            options: {to: "/dashboard"},
        });
    });

    it("redirects /_auth/project/$projectId/ to /dashboard with replace", async () => {
        await expect(
            (async () => ProjectIndexRoute.options.beforeLoad?.({} as never))(),
        ).rejects.toMatchObject({
            options: {
                to: "/dashboard",
                replace: true,
            },
        });
    });
});
