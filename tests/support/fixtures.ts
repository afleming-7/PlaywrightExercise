import { test as base, Page, BrowserContext } from "@playwright/test";
import { PopupHandler } from "../pages/PopupHandler";
import { env } from "../../utils/env";

type MyFixtures = {
  loggedInPage: Page;
};

export const test = base.extend<MyFixtures>({
  page: async ({ page, context }, use) => {
    // Clean session
    await context.clearCookies();
    await context.clearPermissions();
    await page.goto(env.BASE_URL, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Dismiss popups
    const popup = new PopupHandler(page);
    await popup.handlePopups();

    // Re-handle popups on navigation
    page.on("framenavigated", async (frame) => {
      if (frame === page.mainFrame()) {
        await page.waitForLoadState("domcontentloaded").catch(() => null);
        await popup.handlePopups();
      }
    });

    // Dismiss JS dialogs
    page.on("dialog", async (dialog) => await dialog.dismiss());

    await use(page);
  },

  loggedInPage: async ({ browserName, browser }, use) => {
    const storageFile = `tests/support/storageState.${browserName}.json`;
    const context = await browser.newContext({ storageState: storageFile });
    const page = await context.newPage();
    await page.goto("about:blank");
    await use(page);
    await context.close();
  },
});

export const expect = test.expect;
