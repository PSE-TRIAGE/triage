import { test, expect } from "@playwright/experimental-ct-react";
import { ProfileDataManagement } from "@/components/settings/ProfileDataManagement";

test.describe("ProfileDataManagement", () => {
  test("renders profile information section", async ({ mount }) => {
    const component = await mount(
      <ProfileDataManagement />,
    );

    await expect(component.getByText("Profile Information")).toBeVisible();
    await expect(component.getByText("Update your user name")).toBeVisible();
  });

  test("renders change password section", async ({ mount }) => {
    const component = await mount(
      <ProfileDataManagement />,
    );

    await expect(component.getByText("Change Password")).toBeVisible();
    await expect(component.getByText("Update your password to keep your account secure")).toBeVisible();
  });

  test("shows username input pre-filled from user data", async ({ mount }) => {
    const component = await mount(
      <ProfileDataManagement />,
    );

    await expect(component.getByText("This is your public-facing name:")).toBeVisible();
  });

  test("shows password form fields", async ({ mount }) => {
    const component = await mount(
      <ProfileDataManagement />,
    );

    await expect(component.getByRole("button", { name: "Update Password" })).toBeVisible();
  });

  test("save changes button for username", async ({ mount }) => {
    const component = await mount(
      <ProfileDataManagement />,
    );

    await expect(component.getByRole("button", { name: "Save Changes" })).toBeVisible();
  });
});
