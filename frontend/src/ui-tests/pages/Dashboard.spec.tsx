import { test, expect } from "@playwright/experimental-ct-react";
import { Dashboard } from "@/pages/Dashboard";

test.describe("Dashboard Page", () => {
  test("renders page title and description", async ({ mount }) => {
    const component = await mount(
      <Dashboard />,
    );

    await expect(component.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
    await expect(component.getByText("Manage and review mutation testing projects")).toBeVisible();
  });

  test("renders search input", async ({ mount }) => {
    const component = await mount(
      <Dashboard />,
    );

    await expect(component.getByPlaceholder("Search projects...")).toBeVisible();
  });

  test("shows projects when loaded", async ({ mount }) => {
    const component = await mount(
      <Dashboard />,
      { hooksConfig: { admin: true, projectList: [{ id: 1, name: "Project Alpha" }, { id: 2, name: "Project Beta" }] } },
    );

    await expect(component.getByText("Project Alpha")).toBeVisible();
    await expect(component.getByText("Project Beta")).toBeVisible();
  });

  test("shows Create New Project button for admin", async ({ mount }) => {
    const component = await mount(
      <Dashboard />,
      { hooksConfig: { admin: true } },
    );

    await expect(component.getByRole("button", { name: "Create New Project" })).toBeVisible();
  });

  test("search filters projects", async ({ mount }) => {
    const component = await mount(
      <Dashboard />,
      { hooksConfig: { projectList: [{ id: 1, name: "Alpha" }, { id: 2, name: "Beta" }] } },
    );

    // Wait for projects to load
    await expect(component.getByText("Alpha")).toBeVisible();

    // Type in search
    await component.getByPlaceholder("Search projects...").fill("Beta");

    // Alpha should be filtered out
    await expect(component.getByText("Alpha")).not.toBeVisible();
    await expect(component.getByText("Beta")).toBeVisible();
  });
});
