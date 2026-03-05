import {expect, test} from "playwright/test";
import {
    createProjectFromDashboard,
    loginAsAdmin,
    openReviewForProject,
    uniqueName,
} from "./helpers";

test.describe("review dashboard", () => {
    test("submits a rating and keeps it persisted", async ({page}) => {
        const projectName = uniqueName("e2e-review");

        await loginAsAdmin(page);
        await createProjectFromDashboard(page, projectName);
        await openReviewForProject(page, projectName);

        await page.getByRole("button", {name: "4 star-button"}).click();
        await page.getByRole("button", {name: "Submit Review"}).click();

        await expect(page.getByText("Previously Reviewed")).toBeVisible();

        await page.getByLabel("Filter mutants").click();
        await page.getByRole("option", {name: "Reviewed", exact: true}).click();

        const reviewedMutant = page
            .locator("button[aria-pressed]")
            .filter({hasText: /Mutant ID:/})
            .first();
        await reviewedMutant.click();

        await expect(page.getByRole("button", {name: "Update Review"})).toBeVisible();
        await expect(page.getByText("Selected: 4 out of 5")).toBeVisible();

        await page.reload();

        await expect(page.getByText("Mutants", {exact: true})).toBeVisible();

        await page.getByLabel("Filter mutants").click();
        await page.getByRole("option", {name: "Reviewed", exact: true}).click();

        await reviewedMutant.click();

        await expect(page.getByRole("button", {name: "Update Review"})).toBeVisible();
        await expect(page.getByText("Selected: 4 out of 5")).toBeVisible();
    });
});
