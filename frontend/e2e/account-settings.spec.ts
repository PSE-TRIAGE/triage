import {expect, test, type Page} from "playwright/test";
import {
    DEFAULT_TEST_PASSWORD,
    createUserViaUserManagement,
    gotoSettings,
    gotoUserManagement,
    login,
    loginAsAdmin,
    logout,
    uniqueUsername,
} from "./helpers";

async function createRegularUserAndLogin(page: Page): Promise<{
    username: string;
    password: string;
}> {
    const username = uniqueUsername("e2e_account");
    const password = DEFAULT_TEST_PASSWORD;

    await loginAsAdmin(page);
    await gotoUserManagement(page);
    await createUserViaUserManagement(page, username, password);
    await logout(page);
    await login(page, username, password);

    return {username, password};
}

async function submitLoginForm(
    page: Page,
    username: string,
    password: string,
): Promise<void> {
    await page.goto("/login");

    const loginForm = page.locator("form").first();
    await loginForm.locator('input[autocomplete="username"]').fill(username);
    await loginForm
        .locator('input[autocomplete="current-password"]')
        .fill(password);
    await loginForm.getByRole("button", {name: "Login"}).click();
}

async function expectLoginFailure(
    page: Page,
    username: string,
    password: string,
): Promise<void> {
    await submitLoginForm(page, username, password);
    await expect(page.getByText("Invalid username or password")).toBeVisible();
}

test.describe("account settings", () => {
    test("renames username and allows login with the new name", async ({page}) => {
        const {password} = await createRegularUserAndLogin(page);
        const renamedUsername = uniqueUsername("e2e_account_renamed");

        await gotoSettings(page);

        const usernameInput = page.getByPlaceholder("Your username...");
        await usernameInput.fill(renamedUsername);
        await page.getByRole("button", {name: "Save Changes"}).click();
        await expect(
            page.getByText("Username successfully updated!"),
        ).toBeVisible({timeout: 15_000});

        await expect(usernameInput).toHaveValue(renamedUsername);

        await logout(page);
        await login(page, renamedUsername, password);
    });

    test("changes password end-to-end", async ({page}) => {
        const {username, password} = await createRegularUserAndLogin(page);
        const newPassword = "Password123!New";

        await gotoSettings(page);

        await page.getByPlaceholder("Your current password...").fill(password);
        await page.getByPlaceholder("Your new password...").fill(newPassword);
        await page
            .getByPlaceholder("Your new password again...")
            .fill(newPassword);

        await page.getByRole("button", {name: "Update Password"}).click();
        await expect(
            page.getByText("Password successfully updated!"),
        ).toBeVisible({timeout: 15_000});

        await logout(page);

        await expectLoginFailure(page, username, password);
        await login(page, username, newPassword);
    });

    test("deactivates account end-to-end", async ({page}) => {
        const {username, password} = await createRegularUserAndLogin(page);

        await gotoSettings(page);

        await page.getByRole("button", {name: "Deactivate this account"}).click();

        const dialog = page.getByRole("alertdialog").first();
        await dialog
            .getByRole("button", {name: "Yes, deactivate my account"})
            .click();

        await expect(page).toHaveURL(/\/login$/, {timeout: 15_000});
        await expect(page.getByText("Welcome to Triage!")).toBeVisible({
            timeout: 15_000,
        });

        await expectLoginFailure(page, username, password);
    });

    test("shows password mismatch validation", async ({page}) => {
        const {password} = await createRegularUserAndLogin(page);

        await gotoSettings(page);

        await page.getByPlaceholder("Your current password...").fill(password);
        await page.getByPlaceholder("Your new password...").fill("Password123!A");
        await page
            .getByPlaceholder("Your new password again...")
            .fill("DifferentPassword123!");

        await page.getByRole("button", {name: "Update Password"}).click();

        await expect(
            page.getByText(
                "Passwords do not match. Please ensure both password fields are identical.",
            ),
        ).toBeVisible();
    });

    test("rejects password change when current password is wrong", async ({page}) => {
        const {username, password} = await createRegularUserAndLogin(page);
        const attemptedNewPassword = "Password123!Changed";

        await gotoSettings(page);

        await page
            .getByPlaceholder("Your current password...")
            .fill("wrong-current-password");
        await page
            .getByPlaceholder("Your new password...")
            .fill(attemptedNewPassword);
        await page
            .getByPlaceholder("Your new password again...")
            .fill(attemptedNewPassword);

        await page.getByRole("button", {name: "Update Password"}).click();

        await logout(page);

        await expectLoginFailure(page, username, attemptedNewPassword);
        await login(page, username, password);
    });

    test("prevents changing username to an existing one", async ({page}) => {
        await createRegularUserAndLogin(page);

        await gotoSettings(page);

        await page.getByPlaceholder("Your username...").fill("admin");
        await page.getByRole("button", {name: "Save Changes"}).click();

        await expect(
            page.getByText(
                "A user with this name already exists. Please choose a different username.",
            ),
        ).toBeVisible();
    });
});
