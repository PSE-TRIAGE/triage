import {expect, type Locator, type Page} from "playwright/test";

const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "admin";

export const DEFAULT_TEST_PASSWORD = "Password123!";
export const MUTATIONS_XML_FILE = "e2e/sample-mutations.xml";
export const SOURCE_ZIP_FILE = "e2e/sample-source.zip";

export function uniqueName(prefix: string): string {
    const random = Math.floor(Math.random() * 100_000);
    return `${prefix}-${Date.now()}-${random}`;
}

export function uniqueUsername(prefix = "e2e_user"): string {
    const random = Math.floor(Math.random() * 100_000);
    return `${prefix}_${Date.now()}_${random}`;
}

export async function login(
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

    await expect(page).toHaveURL(/\/dashboard$/, {timeout: 15_000});
    await expect(
        page.getByRole("heading", {name: "Projects", exact: true}),
    ).toBeVisible();
}

export async function loginAsAdmin(page: Page): Promise<void> {
    await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
}

export async function logout(page: Page): Promise<void> {
    if (/\/login$/.test(page.url())) {
        await expect(page.getByText("Welcome to Triage!")).toBeVisible();
        return;
    }

    await openUserMenu(page);

    await Promise.all([
        page.waitForURL(/\/login$/, {timeout: 15_000}),
        page
            .getByRole("menuitem", {name: "Logout", exact: true})
            .first()
            .click({force: true}),
    ]);

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Welcome to Triage!")).toBeVisible();
}

export function projectCard(page: Page, projectName: string): Locator {
    return page
        .locator('[data-slot="card"]')
        .filter({hasText: projectName})
        .first();
}

export async function createProjectFromDashboard(
    page: Page,
    projectName: string,
    options?: {
        mutationsFile?: string;
        sourceZipFile?: string;
    },
): Promise<void> {
    await page.getByRole("button", {name: "Create New Project"}).click();

    const dialog = page
        .getByRole("dialog")
        .filter({hasText: "Create New Project"})
        .first();
    await dialog.getByPlaceholder("e.g., Team 1 - Calculator").fill(projectName);

    const fileInputs = dialog.locator('input[type="file"]');

    await fileInputs
        .nth(0)
        .setInputFiles(options?.mutationsFile ?? MUTATIONS_XML_FILE);

    if (options?.sourceZipFile) {
        await fileInputs.nth(1).setInputFiles(options.sourceZipFile);
    }

    await dialog.getByRole("button", {name: "Create Project"}).click();

    await expect(projectCard(page, projectName)).toBeVisible({timeout: 15_000});
}

export async function openProjectManagement(
    page: Page,
    projectName: string,
): Promise<void> {
    await projectCard(page, projectName)
        .getByRole("button", {name: `Manage project ${projectName}`})
        .click();

    await expect(page).toHaveURL(/\/project\/\d+\/project-settings$/);
}

export async function openReviewForProject(
    page: Page,
    projectName: string,
): Promise<void> {
    await projectCard(page, projectName)
        .getByRole("button", {name: "Continue Review"})
        .click();

    await expect(page).toHaveURL(/\/project\/\d+\/review$/);
}

export function getCurrentProjectId(page: Page): number {
    const match = page.url().match(/\/project\/(\d+)\//);
    if (!match) {
        throw new Error(`Could not parse project id from URL: ${page.url()}`);
    }
    return Number(match[1]);
}

export async function gotoProjectReview(
    page: Page,
    projectId: number,
): Promise<void> {
    await page.goto(`/project/${projectId}/review`);
    await expect(page).toHaveURL(new RegExp(`/project/${projectId}/review$`));
}

export async function gotoProjectManagement(
    page: Page,
    projectId: number,
): Promise<void> {
    await page.goto(`/project/${projectId}/project-settings`);
    await expect(page).toHaveURL(
        new RegExp(`/project/${projectId}/project-settings$`),
    );
}

export async function openUserMenu(page: Page): Promise<void> {
    const logoutMenuItem = page.getByRole("menuitem", {
        name: "Logout",
        exact: true,
    });

    const isAlreadyOpen =
        (await logoutMenuItem.count()) > 0 &&
        (await logoutMenuItem.first().isVisible().catch(() => false));

    if (!isAlreadyOpen) {
        await page
            .getByRole("button", {name: "Open profile menu", exact: true})
            .click();
    }

    await expect(logoutMenuItem.first()).toBeVisible({timeout: 10_000});
}

export async function gotoUserManagement(page: Page): Promise<void> {
    const headerNavButton = page.getByRole("button", {
        name: "User Management",
        exact: true,
    });

    if ((await headerNavButton.count()) > 0) {
        await headerNavButton.first().click();
    } else {
        await page.goto("/user-management");
    }

    await expect(page).toHaveURL(/\/user-management$/);
    await expect(
        page.getByRole("heading", {name: "User Management"}),
    ).toBeVisible();
}

export async function gotoSettings(page: Page): Promise<void> {
    await openUserMenu(page);
    await page.getByRole("menuitem", {name: "Settings", exact: true}).click();

    await expect(page).toHaveURL(/\/settings$/);
    await expect(
        page.getByRole("heading", {name: "Account Settings"}),
    ).toBeVisible();
}

export async function createUserViaUserManagement(
    page: Page,
    username: string,
    password = DEFAULT_TEST_PASSWORD,
): Promise<void> {
    await page.getByRole("button", {name: "Add User"}).click();

    const dialog = page
        .getByRole("dialog")
        .filter({hasText: "Create New User"})
        .first();
    await dialog.getByPlaceholder("e.g., john_doe").fill(username);
    await dialog.getByPlaceholder("Enter password").fill(password);
    await dialog.getByRole("button", {name: "Create User"}).click();

    const userRow = page.locator("tr").filter({hasText: username}).first();
    await expect(userRow).toBeVisible({timeout: 15_000});
}
