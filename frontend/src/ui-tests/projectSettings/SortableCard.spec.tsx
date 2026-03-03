import { test, expect } from "@playwright/experimental-ct-react";
import { SortableCard } from "@/components/projectSettings/SortableCard";
import { DndTestWrapper } from "../helpers/DndTestWrapper";

test.describe("SortableCard", () => {
  test("renders field label and type", async ({ mount }) => {
    const component = await mount(
      <DndTestWrapper>
        <SortableCard id={1} label="Usefulness" type="rating" projectId={1} onDelete={() => {}} />
      </DndTestWrapper>,
    );

    await expect(component.getByText("Usefulness")).toBeVisible();
    await expect(component.getByText("rating")).toBeVisible();
  });

  test("has drag handle button", async ({ mount }) => {
    const component = await mount(
      <DndTestWrapper>
        <SortableCard id={1} label="Field" type="text" projectId={1} onDelete={() => {}} />
      </DndTestWrapper>,
    );

    await expect(component.getByRole("button", { name: "Drag to reorder" })).toBeVisible();
  });

  test("has edit button", async ({ mount }) => {
    const component = await mount(
      <DndTestWrapper>
        <SortableCard id={1} label="Field" type="text" projectId={1} onDelete={() => {}} />
      </DndTestWrapper>,
    );

    const buttons = component.getByRole("button");
    await expect(buttons.nth(1)).toBeVisible();
  });

  test("shows delete confirmation dialog", async ({ mount }) => {
    const component = await mount(
      <DndTestWrapper>
        <SortableCard id={1} label="My Field" type="rating" projectId={1} onDelete={() => {}} />
      </DndTestWrapper>,
    );

    const deleteBtn = component.locator("button.text-destructive");
    await deleteBtn.click();

    await expect(component.page().getByText("Are you absolutely sure?")).toBeVisible();
    await expect(component.page().getByText("Yes, delete this form value")).toBeVisible();
  });

  test("delete dialog has cancel button", async ({ mount }) => {
    const component = await mount(
      <DndTestWrapper>
        <SortableCard id={1} label="Field" type="text" projectId={1} onDelete={() => {}} />
      </DndTestWrapper>,
    );

    const deleteBtn = component.locator("button.text-destructive");
    await deleteBtn.click();

    const cancelBtn = component.page().getByRole("button", { name: "Cancel" });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    await expect(component.page().getByText("Are you absolutely sure?")).not.toBeVisible();
  });

  test("renders correct icon for each field type", async ({ mount }) => {
    const component = await mount(
      <DndTestWrapper>
        <SortableCard id={1} label="Rating Field" type="rating" projectId={1} onDelete={() => {}} />
      </DndTestWrapper>,
    );

    await expect(component.getByText("Rating Field")).toBeVisible();
  });
});
