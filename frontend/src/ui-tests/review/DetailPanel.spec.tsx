import { test, expect } from "@playwright/experimental-ct-react";
import { DetailPanel } from "@/components/review/DetailPanel";
import { makeMutant } from "../pw-test-utils";

test.describe("DetailPanel", () => {
  test("shows placeholder when no mutant selected", async ({ mount }) => {
    const component = await mount(
      <DetailPanel />,
    );

    await expect(component.getByText("No Mutant Selected")).toBeVisible();
    await expect(component.getByText("Select a mutant from the list to begin your review")).toBeVisible();
  });

  test("displays mutant details when selected", async ({ mount }) => {
    const mutant = makeMutant({
      id: 42,
      status: "SURVIVED",
      sourceFile: "Calculator.java",
      lineNumber: 15,
    });

    const component = await mount(
      <DetailPanel />,
      { hooksConfig: { mutantStore: { selectedMutant: mutant } } },
    );

    await expect(component.getByText("Mutant Details")).toBeVisible();
    await expect(component.getByText("ID: 42")).toBeVisible();
    await expect(component.getByText("survived", { exact: true })).toBeVisible();
    await expect(component.getByText("Calculator.java")).toBeVisible();
    await expect(component.getByText("15", { exact: true })).toBeVisible();
  });

  test("shows Previously Reviewed badge for rated mutant", async ({ mount }) => {
    const component = await mount(
      <DetailPanel />,
      { hooksConfig: { mutantStore: { selectedMutant: makeMutant({ id: 1, rated: true }) } } },
    );

    await expect(component.getByText("Previously Reviewed")).toBeVisible();
  });

  test("shows Source Code section header", async ({ mount }) => {
    const component = await mount(
      <DetailPanel />,
      { hooksConfig: { mutantStore: { projectId: 1, selectedMutant: makeMutant() } } },
    );

    await expect(component.getByText("Source Code", { exact: true })).toBeVisible();
    await expect(component.getByText(/Mutation at line 42/)).toBeVisible();
  });
});
