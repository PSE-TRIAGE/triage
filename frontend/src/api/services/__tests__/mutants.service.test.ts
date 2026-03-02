import {beforeEach, describe, expect, it, vi} from "vitest";
import {MutantsServiceImpl} from "../mutants.service";

vi.mock("@/api/client", () => ({
    apiClient: {
        get: vi.fn(),
    },
}));

describe("MutantsServiceImpl", () => {
    let service: MutantsServiceImpl;

    beforeEach(() => {
        service = new MutantsServiceImpl();
        vi.clearAllMocks();
    });

    it("listProjectMutants calls get with project id", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        await service.listProjectMutants(5);
        expect(apiClient.get).toHaveBeenCalledWith(
            "/projects/5/mutants",
            expect.any(Object),
        );
    });

    it("getMutant calls get with mutant id", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: 1,
            projectId: 1,
            detected: true,
            status: "SURVIVED",
            numberOfTestsRun: 5,
            sourceFile: "Foo.java",
            mutatedClass: "Foo",
            mutatedMethod: "bar",
            methodDescription: "desc",
            lineNumber: 10,
            mutator: "M",
            killingTest: null,
            description: "test",
            ranking: 1,
            additionalFields: null,
        });
        const result = await service.getMutant(1);
        expect(apiClient.get).toHaveBeenCalledWith(
            "/mutants/1",
            expect.any(Object),
        );
        expect(result.id).toBe(1);
    });

    it("getMutantSourceCode calls get with mutant id", async () => {
        const {apiClient} = await import("@/api/client");
        (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
            projectId: 1,
            fullyQualifiedName: "com.Foo",
            content: "class Foo {}",
            found: true,
        });
        const result = await service.getMutantSourceCode(1);
        expect(apiClient.get).toHaveBeenCalledWith(
            "/mutants/1/source",
            expect.any(Object),
        );
        expect(result.found).toBe(true);
    });
});
