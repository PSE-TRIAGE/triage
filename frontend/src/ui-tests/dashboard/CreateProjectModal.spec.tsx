import { test, expect } from "@playwright/experimental-ct-react";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";

test.describe("CreateProjectModal", () => {
  test("renders modal title and description when open", async ({ mount }) => {
    const component = await mount(
      <CreateProjectModal open={true} handleClose={() => {}} />,
    );
    const page = component.page();

    await expect(page.getByText("Create New Project")).toBeVisible();
    await expect(page.getByText(/Set up a new mutation testing project/)).toBeVisible();
  });

  test("shows project name input, file inputs, and buttons", async ({ mount }) => {
    const component = await mount(
      <CreateProjectModal open={true} handleClose={() => {}} />,
    );
    const page = component.page();

    await expect(page.getByText("Project Name")).toBeVisible();
    await expect(page.getByText(/mutations\.xml File/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Project" })).toBeVisible();
  });

  test("shows validation error for empty project name on submit", async ({ mount }) => {
    const component = await mount(
      <CreateProjectModal open={true} handleClose={() => {}} />,
    );
    const page = component.page();

    await page.getByRole("button", { name: "Create Project" }).click();
    await expect(page.getByText("Project name is required")).toBeVisible();
  });

  test("shows validation error for missing mutation file on submit", async ({ mount }) => {
    const component = await mount(
      <CreateProjectModal open={true} handleClose={() => {}} />,
    );
    const page = component.page();

    await page.getByPlaceholder("e.g., Team 1 - Calculator").fill("Test Project");
    await page.getByRole("button", { name: "Create Project" }).click();
    await expect(page.getByText("Please upload a mutations.xml file")).toBeVisible();
  });

  test("does not render when closed", async ({ mount }) => {
    const component = await mount(
      <CreateProjectModal open={false} handleClose={() => {}} />,
    );

    await expect(component.page().getByText("Create New Project")).not.toBeVisible();
  });
});
