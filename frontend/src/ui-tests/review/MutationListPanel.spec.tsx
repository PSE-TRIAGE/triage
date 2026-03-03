import {test, expect} from "@playwright/experimental-ct-react";
import {MutationListPanel} from "@/components/review/MutationListPanel";
import {makeMutant} from "../pw-test-utils";

test.describe("MutationListPanel", () => {
    test("shows empty state for unreviewed filter with no mutants", async ({
        mount,
    }) => {
        const component = await mount(<MutationListPanel />, {
            hooksConfig: {mutantStore: {projectId: 1}},
        });

        await expect(
            component.getByText("Mutants", {exact: true}),
        ).toBeVisible();
        await expect(
            component.getByText(/No unreviewed mutants left/),
        ).toBeVisible();
    });

    test("renders mutant items in the list", async ({mount}) => {
        const component = await mount(<MutationListPanel />, {
            hooksConfig: {
                mutantStore: {
                    projectId: 1,
                    mutants: [
                        makeMutant({id: 1, status: "SURVIVED", rated: false}),
                        makeMutant({id: 2, status: "KILLED", rated: false}),
                    ],
                },
            },
        });

        await expect(component.getByText("Mutant ID: 1")).toBeVisible();
        await expect(component.getByText("Mutant ID: 2")).toBeVisible();
    });

    test("shows filter dropdown with options", async ({mount}) => {
        const component = await mount(<MutationListPanel />, {
            hooksConfig: {mutantStore: {projectId: 1}},
        });

        const trigger = component.getByRole("combobox", {
            name: "Filter mutants",
        });
        await expect(trigger).toBeVisible();
    });

    test("shows unreviewed empty state when only reviewed mutants exist", async ({
        mount,
    }) => {
        // Default filter is "unreviewed" so rated (reviewed) mutants will not appear in the list
        const component = await mount(<MutationListPanel />, {
            hooksConfig: {
                mutantStore: {
                    projectId: 1,
                    mutants: [makeMutant({id: 1, rated: true})],
                },
            },
        });

        await expect(
            component.getByText(/No unreviewed mutants left/),
        ).toBeVisible();
    });
});
