import { test, expect } from "@playwright/experimental-ct-react";
import { DeleteUser } from "@/components/users/DeleteUser";
import { makeAdminUser } from "../pw-test-utils";

const activeUser = makeAdminUser({ id: 2, username: "john_doe", isActive: true });

test.describe("DeleteUser", () => {
  test("renders deactivation dialog when open", async ({ mount }) => {
    const component = await mount(
      <DeleteUser user={activeUser} open={true} onOpenChange={() => {}} />,
    );

    await expect(component.page().getByText("Deactivate this user?")).toBeVisible();
  });

  test("shows permanent deletion checkbox", async ({ mount }) => {
    const component = await mount(
      <DeleteUser user={activeUser} open={true} onOpenChange={() => {}} />,
    );

    await expect(component.page().getByText("Also fully delete user data?")).toBeVisible();
  });

  test("toggling checkbox changes confirmation text", async ({ mount }) => {
    const component = await mount(
      <DeleteUser user={activeUser} open={true} onOpenChange={() => {}} />,
    );

    // Initially shows deactivation confirm
    await expect(component.page().getByRole("button", { name: "Yes, deactivate user" })).toBeVisible();

    // Check the permanent deletion checkbox
    await component.page().getByText("Also fully delete user data?").click();

    // Should now show the permanent deletion dialog
    await expect(component.page().getByText("Permanently delete user data?")).toBeVisible();
    await expect(component.page().getByRole("button", { name: "Yes, delete user data" })).toBeVisible();
  });

  test("does not render when closed", async ({ mount }) => {
    const component = await mount(
      <DeleteUser user={activeUser} open={false} onOpenChange={() => {}} />,
    );

    await expect(component.page().getByText("Deactivate this user?")).not.toBeVisible();
  });

  test("cancel button closes dialog", async ({ mount }) => {
    let openState = true;
    const component = await mount(
      <DeleteUser user={activeUser} open={openState} onOpenChange={(v) => { openState = v; }} />,
    );

    await component.page().getByRole("button", { name: "Cancel" }).click();
    expect(openState).toBe(false);
  });
});
