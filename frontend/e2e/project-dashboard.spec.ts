import {expect, test} from "playwright/test";
import {
    SOURCE_ZIP_FILE,
    createProjectFromDashboard,
    loginAsAdmin,
    openReviewForProject,
    uniqueName,
} from "./helpers";

test.describe("project dashboard", () => {
    test("creates a project with mutations.xml and source upload", async ({page}) => {
        await loginAsAdmin(page);

        const projectName = uniqueName("e2e-dashboard");

        await createProjectFromDashboard(page, projectName, {
            sourceZipFile: SOURCE_ZIP_FILE,
        });

        await openReviewForProject(page, projectName);

        await expect(page.getByText("Mutant Details")).toBeVisible();
        await expect(page.getByText("com.example.Bar")).toBeVisible();
        await expect(page.getByText("Source code not available")).toHaveCount(0);
    });
});
