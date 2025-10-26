import { Page, expect } from "@playwright/test";

export class BasePage {
  constructor(public page: Page) {}

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async clickNavLink(linkText: string) {
    await this.page.getByRole("link", { name: linkText }).click();
  }

  async expectUrlContains(text: string) {
    await expect(this.page).toHaveURL(new RegExp(text));
  }
}
