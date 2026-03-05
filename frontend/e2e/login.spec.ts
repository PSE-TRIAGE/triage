import {expect, test} from "playwright/test";
import {loginAsAdmin} from "./helpers";

test.describe("login", () => {
    test("redirects unauthenticated users to /login", async ({page}) => {
        await page.goto("/dashboard");

        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByText("Welcome to Triage!")).toBeVisible();
    });

    test("shows an error for invalid credentials", async ({page}) => {
        await page.goto("/login");

        const loginForm = page.locator("form").first();
        await loginForm.locator('input[autocomplete="username"]').fill("admin");
        await loginForm
            .locator('input[autocomplete="current-password"]')
            .fill("wrong-password");
        await loginForm.getByRole("button", {name: "Login"}).click();

        await expect(page.getByText("Invalid username or password")).toBeVisible();
    });

    test("logs in successfully and lands on dashboard", async ({page}) => {
        await loginAsAdmin(page);
    });
});
