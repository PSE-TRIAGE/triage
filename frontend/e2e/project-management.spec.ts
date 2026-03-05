import {expect, test, type Locator, type Page} from "playwright/test";
import {
    createProjectFromDashboard,
    createUserViaUserManagement,
    getCurrentProjectId,
    gotoProjectManagement,
    gotoProjectReview,
    gotoUserManagement,
    loginAsAdmin,
    openProjectManagement,
    openReviewForProject,
    projectCard,
    uniqueName,
    uniqueUsername,
} from "./helpers";

async function openProjectManagementForNewProject(
    page: Page,
    projectName: string,
): Promise<number> {
    await loginAsAdmin(page);
    await createProjectFromDashboard(page, projectName);
    await openProjectManagement(page, projectName);
    return getCurrentProjectId(page);
}

function formFieldCards(page: Page): Locator {
    return page
        .locator('[data-slot="card"]')
        .filter({
            has: page.getByRole("button", {name: "Drag to reorder"}),
        });
}

async function addFormField(
    page: Page,
    fieldName: string,
    fieldTypeLabel: "Text" | "Integer" | "Rating" | "Checkbox",
): Promise<void> {
    await page.getByRole("button", {name: "Add new Field"}).click();

    const dialog = page.getByRole("dialog").first();
    await dialog.getByPlaceholder("e.g., Usefulness").fill(fieldName);

    await dialog.getByRole("combobox").click();
    await page.getByRole("option", {name: fieldTypeLabel, exact: true}).click();

    await dialog.getByRole("button", {name: "Add Field"}).click();

    await expect(formFieldCards(page).filter({hasText: fieldName})).toHaveCount(1);
}

async function fieldTop(page: Page, label: string): Promise<number> {
    const card = formFieldCards(page).filter({hasText: label}).first();
    await expect(card).toBeVisible();

    const box = await card.boundingBox();
    if (!box) {
        throw new Error(`Expected card for '${label}' to have a bounding box`);
    }

    return box.y;
}

async function moveFieldAbove(
    page: Page,
    sourceFieldLabel: string,
    targetFieldLabel: string,
): Promise<void> {
    const sourceCard = formFieldCards(page)
        .filter({hasText: sourceFieldLabel})
        .first();
    const sourceHandle = sourceCard.getByRole("button", {
        name: "Drag to reorder",
    });
    const targetHandle = formFieldCards(page)
        .filter({hasText: targetFieldLabel})
        .first()
        .getByRole("button", {name: "Drag to reorder"});

    await sourceHandle.dragTo(targetHandle);

    await expect
        .poll(async () => {
            const sourceY = await fieldTop(page, sourceFieldLabel);
            const targetY = await fieldTop(page, targetFieldLabel);
            return sourceY < targetY;
        })
        .toBeTruthy();
}

async function renameFormField(
    page: Page,
    previousLabel: string,
    nextLabel: string,
): Promise<void> {
    const fieldCard = formFieldCards(page).filter({hasText: previousLabel}).first();

    // Buttons in the card are ordered: drag, edit, delete.
    await fieldCard.getByRole("button").nth(1).click();

    const dialog = page.getByRole("dialog").first();
    const nameInput = dialog.getByPlaceholder("e.g., Usefulness");

    await nameInput.fill(nextLabel);
    await dialog.getByRole("button", {name: "Save Changes"}).click();

    await expect(formFieldCards(page).filter({hasText: previousLabel})).toHaveCount(0);
    await expect(formFieldCards(page).filter({hasText: nextLabel})).toHaveCount(1);
}

function normalizeLabel(label: string): string {
    return label.replace(/\s*\*/g, "").replace(/\s+/g, " ").trim();
}

async function readSelectedMutantRanking(page: Page): Promise<number> {
    const rankingValue = page.locator('dt:has-text("Ranking") + dd').first();
    await expect(rankingValue).toBeVisible();

    const value = (await rankingValue.textContent())?.trim() ?? "";
    return Number(value);
}

test.describe("project management", () => {
    test.describe("form builder", () => {
        test("creates fields, reorders them, renames one, and reflects changes in review", async ({
            page,
        }) => {
            const projectName = uniqueName("e2e-form");
            const firstFieldName = uniqueName("Complexity");
            const secondFieldName = uniqueName("Notes");
            const renamedFieldName = uniqueName("ReviewNotes");

            const projectId = await openProjectManagementForNewProject(
                page,
                projectName,
            );

            await addFormField(page, firstFieldName, "Integer");
            await addFormField(page, secondFieldName, "Text");
            await moveFieldAbove(page, secondFieldName, firstFieldName);
            await renameFormField(page, secondFieldName, renamedFieldName);

            await gotoProjectReview(page, projectId);

            const reviewPanel = page
                .locator('[data-slot="card"]')
                .filter({hasText: "Review Panel"})
                .first();

            await expect(reviewPanel.getByText(renamedFieldName, {exact: true})).toBeVisible();
            await expect(reviewPanel.getByText(firstFieldName, {exact: true})).toBeVisible();

            const labels = (await reviewPanel.locator("label").allTextContents()).map(
                normalizeLabel,
            );

            const renamedIndex = labels.indexOf(renamedFieldName);
            const firstFieldIndex = labels.indexOf(firstFieldName);

            expect(renamedIndex).toBeGreaterThanOrEqual(0);
            expect(firstFieldIndex).toBeGreaterThanOrEqual(0);
            expect(renamedIndex).toBeLessThan(firstFieldIndex);
        });
    });

    test.describe("algorithm settings", () => {
        test("applies an algorithm and shows ranked mutants in review", async ({page}) => {
            const projectName = uniqueName("e2e-algo");
            const projectId = await openProjectManagementForNewProject(
                page,
                projectName,
            );

            await page
                .getByRole("tab", {name: "Algorithm Settings", exact: true})
                .click();

            const preferredCard = page
                .getByText("Status Priority Rank", {exact: true})
                .locator("xpath=ancestor::*[@data-slot='card'][1]");

            if ((await preferredCard.count()) > 0) {
                await preferredCard
                    .getByRole("button", {name: "Select", exact: true})
                    .click();
                await expect(
                    preferredCard.getByRole("button", {
                        name: "Selected",
                        exact: true,
                    }),
                ).toBeVisible();
            } else {
                await page
                    .getByRole("button", {name: "Select", exact: true})
                    .first()
                    .click();
                await expect(
                    page.getByRole("button", {name: "Selected", exact: true}).first(),
                ).toBeVisible();
            }

            await gotoProjectReview(page, projectId);

            const mutantItems = page
                .locator("button[aria-pressed]")
                .filter({hasText: /Mutant ID:/});
            await expect(mutantItems).toHaveCount(2);

            await mutantItems.nth(0).click();
            const firstRanking = await readSelectedMutantRanking(page);

            await mutantItems.nth(1).click();
            const secondRanking = await readSelectedMutantRanking(page);

            expect(Number.isNaN(firstRanking)).toBeFalsy();
            expect(Number.isNaN(secondRanking)).toBeFalsy();
            expect(firstRanking).not.toBe(secondRanking);
        });
    });

    test.describe("export data", () => {
        test("exports persisted review data as json", async ({page}) => {
            const projectName = uniqueName("e2e-export");

            await loginAsAdmin(page);
            await createProjectFromDashboard(page, projectName);
            await openReviewForProject(page, projectName);

            await page.getByRole("button", {name: "4 star-button"}).click();
            await page.getByRole("button", {name: "Submit Review"}).click();
            await expect(page.getByText("Previously Reviewed")).toBeVisible();

            const projectId = getCurrentProjectId(page);

            await gotoProjectManagement(page, projectId);
            await page.getByRole("tab", {name: "Export Data", exact: true}).click();

            await expect(page.getByRole("button", {name: "Download JSON"})).toBeVisible();

            const [exportResponse] = await Promise.all([
                page.waitForResponse((response) => {
                    return (
                        response.request().method() === "GET" &&
                        response.status() === 200 &&
                        response.url().endsWith(
                            `/api/admin/projects/${projectId}/export`,
                        )
                    );
                }),
                page.getByRole("button", {name: "Download JSON"}).click(),
            ]);

            expect(exportResponse.ok()).toBeTruthy();
            await expect(
                page.getByText("JSON successfully downloaded!"),
            ).toBeVisible();
        });
    });

    test.describe("members", () => {
        test("assigns a member to the project", async ({page}) => {
            const projectName = uniqueName("e2e-members");
            const memberUsername = uniqueUsername("e2e_member");

            await loginAsAdmin(page);
            await gotoUserManagement(page);
            await createUserViaUserManagement(page, memberUsername);

            await page.goto("/dashboard");
            await createProjectFromDashboard(page, projectName);
            await openProjectManagement(page, projectName);

            await page.getByRole("tab", {name: "Members", exact: true}).click();

            await page.getByPlaceholder("Search users...").fill(memberUsername);

            const memberRow = page.locator("tr").filter({hasText: memberUsername}).first();
            await expect(memberRow).toBeVisible();
            await expect(memberRow.getByText("Not Assigned")).toBeVisible();

            await memberRow.getByRole("button", {name: "Add"}).click();

            await expect(memberRow.getByText("Assigned")).toBeVisible();
            await expect(memberRow.getByRole("button", {name: "Remove"})).toBeVisible();
        });
    });

    test.describe("settings", () => {
        test("renames a project", async ({page}) => {
            const projectName = uniqueName("e2e-project-name");
            const renamedProjectName = uniqueName("e2e-renamed");

            await openProjectManagementForNewProject(page, projectName);

            await page.getByRole("tab", {name: "Settings", exact: true}).click();

            const projectNameCard = page
                .locator('[data-slot="card"]')
                .filter({hasText: "Project Name"})
                .first();

            const nameInput = projectNameCard.locator('input[type="text"]').first();
            await expect(nameInput).toHaveValue(projectName);

            await nameInput.fill(renamedProjectName);
            await projectNameCard.getByRole("button", {name: "Save"}).click();

            await expect(nameInput).toHaveValue(renamedProjectName);

            await page.goto("/dashboard");
            await expect(projectCard(page, renamedProjectName)).toBeVisible();
            await expect(projectCard(page, projectName)).toHaveCount(0);
        });

        test("deletes a project", async ({page}) => {
            const projectName = uniqueName("e2e-delete");

            await openProjectManagementForNewProject(page, projectName);

            await page.getByRole("tab", {name: "Settings", exact: true}).click();

            const dangerZoneCard = page
                .locator('[data-slot="card"]')
                .filter({hasText: "Danger Zone"})
                .first();
            await dangerZoneCard.getByRole("button", {name: "Delete Project"}).click();

            const confirmDialog = page.getByRole("alertdialog").first();
            await confirmDialog.getByRole("button", {name: "Delete Project"}).click();

            await expect(page).toHaveURL(/\/dashboard$/);
            await expect(projectCard(page, projectName)).toHaveCount(0);
        });
    });
});
