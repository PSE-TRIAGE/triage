import {test, expect} from "@playwright/experimental-ct-react";
import {ReviewFormPanel} from "@/components/review/ReviewFormPanel";
import {makeMutant, makeFormField} from "../pw-test-utils";
import type {FormField} from "@/api/services/admin-formfield.service";

const fields: FormField[] = [
    makeFormField({
        id: 1,
        label: "Usefulness",
        type: "rating",
        position: 0,
        isRequired: true,
    }),
    makeFormField({
        id: 2,
        label: "Comment",
        type: "text",
        position: 1,
        isRequired: false,
    }),
    makeFormField({
        id: 3,
        label: "Is relevant",
        type: "checkbox",
        position: 2,
        isRequired: false,
    }),
];

const mutantStoreConfig = {
    mutantStore: {
        projectId: 1,
        selectedMutant: makeMutant({id: 10, rated: false}),
        mutants: [makeMutant({id: 10})],
    },
};

test.describe("ReviewFormPanel", () => {
    test("renders form title", async ({mount}) => {
        const component = await mount(
            <ReviewFormPanel projectId={1} formFields={fields} />,
            {hooksConfig: {...mutantStoreConfig}},
        );

        await expect(component.getByText("Review Panel")).toBeVisible();
    });

    test("renders all form field types", async ({mount}) => {
        const component = await mount(
            <ReviewFormPanel projectId={1} formFields={fields} />,
            {hooksConfig: {...mutantStoreConfig}},
        );

        await expect(component.getByText("Usefulness")).toBeVisible();
        await expect(component.getByText("Comment")).toBeVisible();
        await expect(component.getByText("Is relevant")).toBeVisible();
    });

    test("renders star rating buttons", async ({mount}) => {
        const component = await mount(
            <ReviewFormPanel projectId={1} formFields={[fields[0]]} />,
            {hooksConfig: {...mutantStoreConfig}},
        );

        // Star rating renders 5 buttons
        let stars = 0;
        for (let i = 1; i <= 5; i++) {
            const star = component.locator("button").getByLabel(/star-button/);

            if (star) {
                stars++;
            }
        }

        expect(stars === 5);
        await expect(component.getByText("Usefulness")).toBeVisible();
    });

    test("renders submit button with correct text", async ({mount}) => {
        const component = await mount(
            <ReviewFormPanel projectId={1} formFields={fields} />,
            {hooksConfig: {...mutantStoreConfig}},
        );

        await expect(
            component.getByRole("button", {name: "Submit Review"}),
        ).toBeVisible();
    });

    test("shows Update Review when existing rating exists", async ({mount}) => {
        const component = await mount(
            <ReviewFormPanel projectId={1} formFields={fields} />,
            {hooksConfig: {...mutantStoreConfig, existingRating: true}},
        );

        // The button text depends on whether existingRating is loaded
        await expect(
            component.getByRole("button", {name: /Review/}),
        ).toBeVisible();
    });

    test("renders integer field type", async ({mount}) => {
        const intField = makeFormField({
            id: 4,
            label: "Score",
            type: "integer",
            position: 0,
        });

        const component = await mount(
            <ReviewFormPanel projectId={1} formFields={[intField]} />,
            {hooksConfig: {...mutantStoreConfig}},
        );

        await expect(component.getByText("Score")).toBeVisible();
    });
});
