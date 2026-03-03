import { test, expect } from "@playwright/experimental-ct-react";
import { ReactivateUser } from "@/components/users/ReactivateUser";
import { makeAdminUser } from "../pw-test-utils";

const disabledUser = makeAdminUser({ id: 3, username: "jane_doe", isActive: false });

test.describe("ReactivateUser", () => {
  test("renders reactivation dialog when open", async ({ mount }) => {
    const component = await mount(
      <ReactivateUser user={disabledUser} open={true} onOpenChange={() => {}} />,
    );

    await expect(component.page().getByText("Reactivate this user?")).toBeVisible();
  });

  test("shows confirm button", async ({ mount }) => {
    const component = await mount(
      <ReactivateUser user={disabledUser} open={true} onOpenChange={() => {}} />,
    );

    await expect(component.page().getByRole("button", { name: "Yes, reactivate user" })).toBeVisible();
  });

  test("does not render when closed", async ({ mount }) => {
    const component = await mount(
      <ReactivateUser user={disabledUser} open={false} onOpenChange={() => {}} />,
    );

    await expect(component.page().getByText("Reactivate this user?")).not.toBeVisible();
  });

  test("cancel button closes dialog", async ({ mount }) => {
    let openState = true;
    const component = await mount(
      <ReactivateUser user={disabledUser} open={openState} onOpenChange={(v) => { openState = v; }} />,
    );

    await component.page().getByRole("button", { name: "Cancel" }).click();
    expect(openState).toBe(false);
  });
});
