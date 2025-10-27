import { test as base, Page } from "@playwright/test";
import { PopupHandler } from "../pages/PopupHandler";
import { env } from "../../utils/env";

// Extend the base test type with custom fixture
type MyFixtures = {
  loggedInPage: Page;
};

export const test = base.extend<MyFixtures>({
  page: async ({ page, context }, use) => {
    // Logged-out session cleanup
    await context.clearCookies();
    await context.clearPermissions();

    await page.goto(env.BASE_URL, { waitUntil: "domcontentloaded" });

    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn("Could not clear storage:", e);
      }
    });

    // Handle JS dialogs
    page.on("dialog", async (dialog) => {
      console.log(`Dismissing dialog: ${dialog.message()}`);
      await dialog.dismiss();
    });

    // Handle popups
    const popup = new PopupHandler(page);
    await popup.handlePopups();

    // Re-handle popups on navigation
    page.on("framenavigated", async (frame) => {
      if (frame === page.mainFrame()) {
        await page.waitForLoadState("domcontentloaded").catch(() => null);
        await popup.handlePopups();
      }
    });

    await use(page);
  },

  // Logged-in fixture
  loggedInPage: async ({ browserName, browser }, use) => {
    const storageFile = `tests/support/storageState.${browserName}.json`;
    const context = await browser.newContext({
      storageState: storageFile,
    });

    const page = await context.newPage();
    await page.goto("about:blank"); // optional, just to ensure page is initialized

    await use(page);

    await context.close();
  },
});

export const expect = test.expect;
