import { defineConfig, devices } from "@playwright/experimental-ct-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  testDir: "./src/ui-tests",
  testMatch: "**/*.spec.tsx",
  snapshotDir: "./__snapshots__",
  timeout: 10_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    trace: "on-first-retry",
    ctPort: 3100,
    ctViteConfig: {
      resolve: {
        alias: {
          "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
      },
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
