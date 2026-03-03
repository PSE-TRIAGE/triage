import { test, expect } from "@playwright/experimental-ct-react";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { makeProject } from "../pw-test-utils";

test.describe("ProjectCard", () => {
  test("renders project name and creation date", async ({ mount }) => {
    const project = makeProject({ name: "My Project", createdAt: "2024-06-15T10:00:00Z" });

    const component = await mount(
      <ProjectCard project={project} />,
    );

    await expect(component.getByText("My Project")).toBeVisible();
    await expect(component.getByText(/Jun 15, 2024/)).toBeVisible();
  });

  test("renders review statistics", async ({ mount }) => {
    const project = makeProject({ reviewedMutants: 25, totalMutants: 100 });

    const component = await mount(
      <ProjectCard project={project} />,
    );

    await expect(component.getByText(/25.*Reviewed/)).toBeVisible();
    await expect(component.getByText(/100.*Total Mutants/)).toBeVisible();
  });

  test("displays correct progress percentage", async ({ mount }) => {
    const project = makeProject({ reviewedMutants: 25, totalMutants: 100 });

    const component = await mount(
      <ProjectCard project={project} />,
    );

    await expect(component.getByText("25.0%")).toBeVisible();
    await expect(component.getByText("In Progress")).toBeVisible();
  });

  test("shows Complete badge when fully reviewed", async ({ mount }) => {
    const project = makeProject({ reviewedMutants: 100, totalMutants: 100 });

    const component = await mount(
      <ProjectCard project={project} />,
    );

    await expect(component.getByText("100.0%")).toBeVisible();
    await expect(component.getByText("Complete", { exact: true })).toBeVisible();
    await expect(component.getByText("Review Complete")).toBeVisible();
  });

  test("Continue Review button is enabled when not complete", async ({ mount }) => {
    const project = makeProject({ reviewedMutants: 50, totalMutants: 100 });

    const component = await mount(
      <ProjectCard project={project} />,
    );

    const btn = component.getByRole("button", { name: "Continue Review" });
    await expect(btn).toBeEnabled();
  });

  test("Review Complete button is disabled when complete", async ({ mount }) => {
    const project = makeProject({ reviewedMutants: 100, totalMutants: 100 });

    const component = await mount(
      <ProjectCard project={project} />,
    );

    const btn = component.getByRole("button", { name: "Review Complete" });
    await expect(btn).toBeDisabled();
  });

  test("shows settings icon for admin users", async ({ mount }) => {
    const project = makeProject({ name: "Admin Project" });

    const component = await mount(
      <ProjectCard project={project} />,
      { hooksConfig: { admin: true } },
    );

    await expect(component.getByRole("button", { name: /Manage project/ })).toBeVisible();
  });
});
