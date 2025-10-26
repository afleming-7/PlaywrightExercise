import { defineConfig } from "@playwright/test";
import { env } from "./utils/env";
import path from "path";

export default defineConfig({
  globalSetup: require.resolve("./tests/support/globalSetup.ts"),
  use: {
    baseURL: env.BASE_URL,
    acceptDownloads: true,
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
  ],
  reporter: [["html"]],
  timeout: 60000,
  fullyParallel: true,
});
