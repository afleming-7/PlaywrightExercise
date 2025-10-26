import { Page, Locator } from "@playwright/test";

export class PopupHandler {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Attempts to close any popup, alert, or cookie banner.
   */
  async handlePopups() {
    console.log("Checking for popups...");

    const popupSelectors = [
      'button:has-text("Accept")',
      'button:has-text("Agree")',
      'button:has-text("OK")',
      'button:has-text("Got it")',
      'button:has-text("Close")',
      'button:has-text("Continue")',
      '[data-testid="cookie-accept"]',
      "#onetrust-accept-btn-handler",
    ];

    for (const selector of popupSelectors) {
      const element = this.page.locator(selector);

      if (await element.isVisible().catch(() => false)) {
        console.log(`Dismissed popup using selector: ${selector}`);
        await element.click();

        // Wait for THIS popup to disappear
        await element
          .waitFor({ state: "detached", timeout: 5000 })
          .catch(() => null);

        await this.page.waitForTimeout(300); // optional short pause
      }
    }

    // Handle JavaScript alerts, confirm dialogs, etc.
    this.page.once("dialog", async (dialog) => {
      console.log(`Dismissing JS dialog: ${dialog.message()}`);
      await dialog.dismiss();
    });
  }
}
