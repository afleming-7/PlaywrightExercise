import { defineConfig } from "@playwright/test";
import { env } from "./utils/env";

export default defineConfig({
  globalSetup: require.resolve("./tests/support/globalSetup.ts"),
  use: {
    baseURL: env.BASE_URL,
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on",
    launchOptions: {
      args: [
        "--disable-autofill",
        "--disable-password-manager",
        "--no-first-run",
      ],
    },
  },
  projects: [
    {
      name: "Chromium",
      use: { browserName: "chromium" },
    },
    {
      name: "Firefox",
      use: { browserName: "firefox" },
    },
  ],
  reporter: [["html"]],
  timeout: 60000,
  fullyParallel: true,
});
