import { test, expect } from "@playwright/experimental-ct-react";
import { Login } from "@/pages/Login";

test.describe("Login Page", () => {
  test("renders welcome message and form", async ({ mount }) => {
    const component = await mount(
      <Login />,
    );

    await expect(component.getByText("Welcome to Triage!")).toBeVisible();
    await expect(component.getByText("Login to your account")).toBeVisible();
  });

  test("renders username and password fields", async ({ mount }) => {
    const component = await mount(
      <Login />,
    );

    await expect(component.getByText("Username:")).toBeVisible();
    await expect(component.getByText("Password:")).toBeVisible();
  });

  test("renders login button", async ({ mount }) => {
    const component = await mount(
      <Login />,
    );

    await expect(component.getByRole("button", { name: "Login" })).toBeVisible();
  });

  test("shows validation errors for empty fields", async ({ mount }) => {
    const component = await mount(
      <Login />,
    );

    await component.getByRole("button", { name: "Login" }).click();

    await expect(component.getByText("please enter a valid username")).toBeVisible();
  });
});
