import { test, expect } from "@playwright/experimental-ct-react";
import { GlobalHeader } from "@/components/Topbar/GlobalHeader";

test.describe("GlobalHeader", () => {
  test("renders app logo with Triage text", async ({ mount }) => {
    const component = await mount(
      <GlobalHeader />,
    );

    await expect(component.getByText("Triage")).toBeVisible();
  });

  test("shows user avatar/dropdown trigger", async ({ mount }) => {
    const component = await mount(
      <GlobalHeader />,
      { hooksConfig: { admin: true } },
    );

    await expect(component.getByText("Triage")).toBeVisible();
  });

  test("dropdown menu has expected items for admin", async ({ mount }) => {
    const component = await mount(
      <GlobalHeader />,
      { hooksConfig: { admin: true } },
    );

    // Click the dropdown trigger (avatar button)
    const trigger = component.locator("button").last();
    await trigger.click();

    await expect(component.page().getByText("User Management")).toBeVisible();
    await expect(component.page().getByText("Settings")).toBeVisible();
    await expect(component.page().getByText("Logout")).toBeVisible();
  });
});
