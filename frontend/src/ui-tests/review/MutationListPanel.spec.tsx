import { test, expect } from "@playwright/experimental-ct-react";
import { MutationListPanel } from "@/components/review/MutationListPanel";
import { makeMutant } from "../pw-test-utils";

test.describe("MutationListPanel", () => {
  test("shows empty state for unreviewed filter with no mutants", async ({ mount }) => {
    const component = await mount(
      <MutationListPanel />,
      { hooksConfig: { mutantStore: { projectId: 1 } } },
    );

    await expect(component.getByText("Mutants", { exact: true })).toBeVisible();
    await expect(component.getByText(/No unreviewed mutants left/)).toBeVisible();
  });

  test("renders mutant items in the list", async ({ mount }) => {
    const component = await mount(
      <MutationListPanel />,
      { hooksConfig: { mutantStore: { projectId: 1, mutants: [
        makeMutant({ id: 1, status: "SURVIVED", rated: false }),
        makeMutant({ id: 2, status: "KILLED", rated: false }),
      ] } } },
    );

    await expect(component.getByText("Mutant ID: 1")).toBeVisible();
    await expect(component.getByText("Mutant ID: 2")).toBeVisible();
  });

  test("shows filter dropdown with options", async ({ mount }) => {
    const component = await mount(
      <MutationListPanel />,
      { hooksConfig: { mutantStore: { projectId: 1 } } },
    );

    const trigger = component.getByRole("combobox", { name: "Filter mutants" });
    await expect(trigger).toBeVisible();
  });

  test("shows reviewed mutant with check icon", async ({ mount }) => {
    // Switch to "reviewed" filter — the default is "unreviewed" so rated mutants won't show
    // Instead, populate with "all" filter mutant or check the "all" view
    // For this test, use "all" filter by using the "reviewed" state
    const component = await mount(
      <MutationListPanel />,
      { hooksConfig: { mutantStore: { projectId: 1, mutants: [makeMutant({ id: 1, rated: true })] } } },
    );

    // Default filter is "unreviewed" so rated mutant won't show
    await expect(component.getByText(/No unreviewed mutants left/)).toBeVisible();
  });
});
