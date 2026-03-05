import {expect, test} from "playwright/test";
import {
    createUserViaUserManagement,
    gotoUserManagement,
    loginAsAdmin,
    uniqueUsername,
} from "./helpers";

test.describe("user management", () => {
    test("creates a user", async ({page}) => {
        await loginAsAdmin(page);
        await gotoUserManagement(page);

        const username = uniqueUsername("e2e_create");

        await createUserViaUserManagement(page, username);

        const userRow = page.locator("tr").filter({hasText: username}).first();
        await expect(userRow).toBeVisible();
        await expect(userRow.getByText("Member")).toBeVisible();
    });

    test("searches users independently", async ({page}) => {
        await loginAsAdmin(page);
        await gotoUserManagement(page);

        await page.getByPlaceholder("Search Usernames...").fill("admin");

        const userRow = page.locator("tr").filter({hasText: "admin"}).first();
        await expect(userRow).toBeVisible();
    });

    test("deactivates and reactivates a user", async ({page}) => {
        await loginAsAdmin(page);
        await gotoUserManagement(page);

        const username = uniqueUsername("e2e_toggle");
        await createUserViaUserManagement(page, username);

        await page.getByPlaceholder("Search Usernames...").fill(username);

        let userRow = page.locator("tr").filter({hasText: username}).first();
        await expect(userRow).toBeVisible();

        await userRow.getByRole("button").first().click();
        await page.getByRole("menuitem", {name: "Delete User"}).click();
        await page.getByRole("button", {name: "Yes, deactivate user"}).click();

        await expect(userRow.getByText("Deactivated")).toBeVisible();

        userRow = page.locator("tr").filter({hasText: username}).first();
        await userRow.getByRole("button").first().click();
        await page.getByRole("menuitem", {name: "Reactivate User"}).click();
        await page.getByRole("button", {name: "Yes, reactivate user"}).click();

        await expect(userRow.getByText("Deactivated")).toHaveCount(0);
    });
});
