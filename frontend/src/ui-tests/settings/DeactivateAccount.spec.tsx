import { test, expect } from "@playwright/experimental-ct-react";
import { DeactivateAccount } from "@/components/settings/DeactivateAccount";

test.describe("DeactivateAccount", () => {
  test("renders danger zone card", async ({ mount }) => {
    const component = await mount(
      <DeactivateAccount />,
    );

    await expect(component.getByText("Danger Zone")).toBeVisible();
    await expect(component.getByText("Deactivate Account")).toBeVisible();
  });

  test("shows deactivation button", async ({ mount }) => {
    const component = await mount(
      <DeactivateAccount />,
    );

    await expect(component.getByRole("button", { name: "Deactivate this account" })).toBeVisible();
  });

  test("clicking deactivate opens confirmation dialog", async ({ mount }) => {
    const component = await mount(
      <DeactivateAccount />,
    );

    await component.getByRole("button", { name: "Deactivate this account" }).click();

    await expect(component.page().getByText("Are you absolutely sure?")).toBeVisible();
    await expect(component.page().getByRole("button", { name: "Yes, deactivate my account" })).toBeVisible();
  });

  test("cancel dismisses confirmation dialog", async ({ mount }) => {
    const component = await mount(
      <DeactivateAccount />,
    );

    await component.getByRole("button", { name: "Deactivate this account" }).click();
    await expect(component.page().getByText("Are you absolutely sure?")).toBeVisible();

    await component.page().getByRole("button", { name: "Cancel" }).click();
    await expect(component.page().getByText("Are you absolutely sure?")).not.toBeVisible();
  });
});
