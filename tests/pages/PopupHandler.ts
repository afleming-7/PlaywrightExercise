import { Page, Locator } from "@playwright/test";

export class PopupHandler {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Attempt to close any popups, alerts, or cookie banners.
   */
  async handlePopups() {
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
      if (await this.isVisible(element)) {
        console.log(`Dismissing popup: ${selector}`);
        await element.click();
        await element
          .waitFor({ state: "detached", timeout: 5000 })
          .catch(() => null);
        await this.page.waitForTimeout(300);
      }
    }

    // Handle JS dialogs
    this.page.once("dialog", async (dialog) => {
      console.log(`Dismissing JS dialog: ${dialog.message()}`);
      await dialog.dismiss();
    });
  }

  private async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible().catch(() => false);
  }
}
