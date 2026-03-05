import {beforeEach, describe, expect, it, vi} from "vitest";
import {ApiError} from "../client";

describe("ApiError", () => {
    it("creates an error with correct properties", () => {
        const error = new ApiError(404, "Not Found", {
            detail: "Resource not found",
        });
        expect(error.status).toBe(404);
        expect(error.statusText).toBe("Not Found");
        expect(error.data).toEqual({detail: "Resource not found"});
        expect(error.message).toBe("API Error: 404 Not Found");
        expect(error.name).toBe("ApiError");
    });

    it("extends Error", () => {
        const error = new ApiError(500, "Internal Server Error");
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ApiError);
    });

    it("works without data parameter", () => {
        const error = new ApiError(401, "Unauthorized");
        expect(error.data).toBeUndefined();
    });
});

describe("apiClient", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
        window.location.href = "";
        window.location.pathname = "/";
    });

    it("parses successful JSON responses with schema validation", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({id: 1, name: "Project"}), {
                status: 200,
                headers: {"content-type": "application/json"},
            }),
        );

        const {apiClient} = await import("../client");
        const {z} = await import("zod");
        const result = await apiClient.get(
            "/test",
            z.object({id: z.number(), name: z.string()}),
        );

        expect(result).toEqual({id: 1, name: "Project"});
    });

    it("throws when successful JSON response fails schema validation", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({id: "not-a-number"}), {
                status: 200,
                headers: {"content-type": "application/json"},
            }),
        );

        const {apiClient} = await import("../client");
        const {z, ZodError} = await import("zod");

        await expect(
            apiClient.get("/test", z.object({id: z.number()})),
        ).rejects.toBeInstanceOf(ZodError);
    });

    it("includes Authorization header when token exists", async () => {
        localStorage.setItem("auth_token", "test-token");

        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({id: 1}), {
                status: 200,
                headers: {"content-type": "application/json"},
            }),
        );

        // Dynamic import to get fresh module with mocked env
        const {apiClient} = await import("../client");
        const {z} = await import("zod");
        await apiClient.get("/test", z.object({id: z.number()}));

        expect(fetchSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: "Bearer test-token",
                }),
            }),
        );
    });

    it("does not include Authorization header when token does not exist", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({id: 1}), {
                status: 200,
                headers: {"content-type": "application/json"},
            }),
        );

        const {apiClient} = await import("../client");
        const {z} = await import("zod");
        await apiClient.get("/test", z.object({id: z.number()}));

        const call = fetchSpy.mock.calls[0];
        expect(call[1]?.headers).not.toHaveProperty("Authorization");
    });

    it("throws ApiError on non-ok response", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({detail: "Bad request"}), {
                status: 400,
                statusText: "Bad Request",
                headers: {"content-type": "application/json"},
            }),
        );

        const {apiClient} = await import("../client");
        const {z} = await import("zod");

        await expect(apiClient.get("/test", z.any())).rejects.toThrow(ApiError);
    });

    it("handles 401 by clearing token", async () => {
        localStorage.setItem("auth_token", "old-token");

        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({detail: "Unauthorized"}), {
                status: 401,
                statusText: "Unauthorized",
                headers: {"content-type": "application/json"},
            }),
        );

        const {apiClient} = await import("../client");
        const {z} = await import("zod");

        await expect(apiClient.get("/test", z.any())).rejects.toThrow(ApiError);
        expect(localStorage.getItem("auth_token")).toBeNull();
    });

    it("handles 401 by redirecting to /login when not already on login page", async () => {
        localStorage.setItem("auth_token", "old-token");
        window.location.pathname = "/dashboard";
        window.location.href = "";

        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({detail: "Unauthorized"}), {
                status: 401,
                statusText: "Unauthorized",
                headers: {"content-type": "application/json"},
            }),
        );

        const {apiClient} = await import("../client");
        const {z} = await import("zod");

        await expect(apiClient.get("/test", z.any())).rejects.toThrow(ApiError);
        expect(window.location.href).toBe("/login");
    });

    it("POST sends JSON body", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({ok: true}), {
                status: 200,
                headers: {"content-type": "application/json"},
            }),
        );

        const {apiClient} = await import("../client");
        const {z} = await import("zod");
        await apiClient.post("/test", z.object({ok: z.boolean()}), {
            foo: "bar",
        });

        expect(fetchSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({foo: "bar"}),
            }),
        );
    });

    it("PUT sends correct method", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({ok: true}), {
                status: 200,
                headers: {"content-type": "application/json"},
            }),
        );

        const {apiClient} = await import("../client");
        const {z} = await import("zod");
        await apiClient.put("/test", z.object({ok: z.boolean()}), {data: 1});

        expect(fetchSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({method: "PUT"}),
        );
    });

    it("PATCH sends correct method", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({ok: true}), {
                status: 200,
                headers: {"content-type": "application/json"},
            }),
        );

        const {apiClient} = await import("../client");
        const {z} = await import("zod");
        await apiClient.patch("/test", z.object({ok: z.boolean()}));

        expect(fetchSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({method: "PATCH"}),
        );
    });

    it("DELETE sends correct method", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(null, {
                status: 204,
                statusText: "No Content",
            }),
        );

        const {apiClient} = await import("../client");
        const {z} = await import("zod");
        await apiClient.delete("/test", z.void());

        expect(fetchSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({method: "DELETE"}),
        );
    });

    it("handles empty response (204 No Content)", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(null, {status: 204, statusText: "No Content"}),
        );

        const {apiClient} = await import("../client");
        const {z} = await import("zod");
        const result = await apiClient.delete("/test", z.void());
        expect(result).toBeUndefined();
    });

    it("downloadFile throws on error", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({detail: "Not found"}), {
                status: 404,
                statusText: "Not Found",
                headers: {"content-type": "application/json"},
            }),
        );

        const {apiClient} = await import("../client");
        await expect(apiClient.downloadFile("/test")).rejects.toThrow(ApiError);
    });

    it("downloadFile returns blob on success", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(new Blob(["hello world"], {type: "text/plain"}), {
                status: 200,
                statusText: "OK",
            }),
        );

        const {apiClient} = await import("../client");
        const blob = await apiClient.downloadFile("/test");

        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toContain("text/plain");
        expect(blob.size).toBeGreaterThan(0);
    });

    it("uploadFile sends FormData", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({id: 1}), {
                status: 200,
                headers: {"content-type": "application/json"},
            }),
        );

        const {apiClient} = await import("../client");
        const {z} = await import("zod");
        const file = new File(["content"], "test.xml", {type: "text/xml"});
        await apiClient.uploadFile(
            "/upload",
            z.object({id: z.number()}),
            file,
            {key: "value"},
        );

        const call = fetchSpy.mock.calls[0];
        expect(call[1]?.body).toBeInstanceOf(FormData);
        expect(call[1]?.method).toBe("POST");
    });

    it("uploadFile appends additional form fields", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({id: 1}), {
                status: 200,
                headers: {"content-type": "application/json"},
            }),
        );

        const {apiClient} = await import("../client");
        const {z} = await import("zod");
        const file = new File(["content"], "test.xml", {type: "text/xml"});
        await apiClient.uploadFile(
            "/upload",
            z.object({id: z.number()}),
            file,
            {projectId: "123", source: "web"},
        );

        const body = fetchSpy.mock.calls[0][1]?.body as FormData;
        expect(body.get("file")).toBe(file);
        expect(body.get("projectId")).toBe("123");
        expect(body.get("source")).toBe("web");
    });

    it("uploadFile supports PUT method", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({id: 1}), {
                status: 200,
                headers: {"content-type": "application/json"},
            }),
        );

        const {apiClient} = await import("../client");
        const {z} = await import("zod");
        const file = new File(["content"], "test.xml", {type: "text/xml"});
        await apiClient.uploadFile(
            "/upload",
            z.object({id: z.number()}),
            file,
            undefined,
            "PUT",
        );

        expect(fetchSpy.mock.calls[0][1]?.method).toBe("PUT");
    });
});
