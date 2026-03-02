import {beforeEach, describe, expect, it, vi} from "vitest";
import {AdminFormFieldServiceImpl} from "../admin-formfield.service";

vi.mock("@/api/client", () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("AdminFormFieldServiceImpl", () => {
    let service: AdminFormFieldServiceImpl;

    beforeEach(() => {
        service = new AdminFormFieldServiceImpl();
        vi.clearAllMocks();
    });

    it("listFormFields calls get with project id", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        await service.listFormFields(5);
        expect(apiClient.get).toHaveBeenCalledWith(
            "/projects/5/form-fields",
            expect.any(Object),
        );
    });

    it("createFormField calls post", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: 1,
            projectId: 5,
            label: "Rating",
            type: "rating",
            isRequired: true,
            position: 0,
        });
        const result = await service.createFormField(5, {
            label: "Rating",
            type: "rating",
            is_required: true,
        });
        expect(apiClient.post).toHaveBeenCalledWith(
            "/admin/projects/5/form-fields",
            expect.any(Object),
            {label: "Rating", type: "rating", is_required: true},
        );
        expect(result.label).toBe("Rating");
    });

    it("updateFormField calls put", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.put as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: 1,
            projectId: 5,
            label: "Updated",
            type: "text",
            isRequired: false,
            position: 0,
        });
        const result = await service.updateFormField(5, 1, {label: "Updated"});
        expect(apiClient.put).toHaveBeenCalledWith(
            "/admin/projects/5/form-fields/1",
            expect.any(Object),
            {label: "Updated"},
        );
        expect(result.label).toBe("Updated");
    });

    it("deleteFormField calls delete", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.delete as ReturnType<typeof vi.fn>).mockResolvedValue({
            success: true,
        });
        await service.deleteFormField(5, 1);
        expect(apiClient.delete).toHaveBeenCalledWith(
            "/admin/projects/5/form-fields/1",
            expect.any(Object),
        );
    });

    it("reorderFormFields calls patch", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        await service.reorderFormFields(5, [3, 1, 2]);
        expect(apiClient.patch).toHaveBeenCalledWith(
            "/admin/projects/5/form-fields/reorder",
            expect.any(Object),
            [3, 1, 2],
        );
    });
});
