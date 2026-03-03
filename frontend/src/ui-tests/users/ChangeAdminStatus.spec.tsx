import { test, expect } from "@playwright/experimental-ct-react";
import { ChangeAdminStatus } from "@/components/users/ChangeAdminStatus";
import { makeAdminUser } from "../pw-test-utils";

test.describe("ChangeAdminStatus", () => {
  test("shows Make Admin button for non-admin user", async ({ mount }) => {
    const user = makeAdminUser({ id: 2, username: "john", isAdmin: false });

    const component = await mount(
      <ChangeAdminStatus user={user} />,
    );

    await expect(component.page().getByRole("button", { name: "Make Admin" })).toBeVisible();
  });

  test("shows Remove Admin button for admin user", async ({ mount }) => {
    const user = makeAdminUser({ id: 2, username: "john", isAdmin: true });

    const component = await mount(
      <ChangeAdminStatus user={user} />,
    );

    await expect(component.page().getByRole("button", { name: "Remove Admin" })).toBeVisible();
  });

  test("clicking Make Admin opens confirmation dialog", async ({ mount }) => {
    const user = makeAdminUser({ id: 2, username: "john", isAdmin: false });

    const component = await mount(
      <ChangeAdminStatus user={user} />,
    );

    await component.page().getByRole("button", { name: "Make Admin" }).click();
    await expect(component.page().getByText("Grant admin privileges?")).toBeVisible();
    await expect(component.page().getByRole("button", { name: "Yes, grant access" })).toBeVisible();
  });

  test("clicking Remove Admin opens revoke dialog", async ({ mount }) => {
    const user = makeAdminUser({ id: 2, username: "john", isAdmin: true });

    const component = await mount(
      <ChangeAdminStatus user={user} />,
    );

    await component.page().getByRole("button", { name: "Remove Admin" }).click();
    await expect(component.page().getByText("Revoke admin privileges?")).toBeVisible();
    await expect(component.page().getByRole("button", { name: "Yes, remove access" })).toBeVisible();
  });
});
