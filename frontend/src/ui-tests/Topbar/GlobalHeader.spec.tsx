import {expect, test} from "@playwright/experimental-ct-react";
import {GlobalHeader} from "@/components/Topbar/GlobalHeader";

test.describe("GlobalHeader", () => {
    test("renders app logo with Triage text", async ({mount}) => {
        const component = await mount(<GlobalHeader />);

        await expect(component.getByText("Triage")).toBeVisible();
    });

    test("shows user avatar/dropdown trigger", async ({mount}) => {
        const component = await mount(<GlobalHeader />, {
            hooksConfig: {admin: true},
        });

        await expect(
            component.getByRole("button", {name: "Open profile menu"}),
        ).toBeVisible();
    });

    test("shows top-bar action buttons for admin", async ({mount}) => {
        const component = await mount(<GlobalHeader />, {
            hooksConfig: {admin: true},
        });

        await expect(
            component.getByRole("button", {name: "Projects"}),
        ).toBeVisible();
        await expect(
            component.getByRole("button", {name: "User Management"}),
        ).toBeVisible();
    });

    test("hides user management top-bar action for non-admin", async ({
        mount,
    }) => {
        const component = await mount(<GlobalHeader />, {
            hooksConfig: {admin: false},
        });

        await expect(
            component.getByRole("button", {name: "Projects"}),
        ).toBeVisible();
        await expect(
            component.getByRole("button", {name: "User Management"}),
        ).toHaveCount(0);
    });

    test("dropdown menu has expected items for admin", async ({mount}) => {
        const component = await mount(<GlobalHeader />, {
            hooksConfig: {admin: true},
        });

        await component
            .getByRole("button", {name: "Open profile menu"})
            .click();

        await expect(
            component.page().getByRole("menuitem", {name: "Settings"}),
        ).toBeVisible();
        await expect(
            component.page().getByRole("menuitem", {name: "Logout"}),
        ).toBeVisible();
    });
});
