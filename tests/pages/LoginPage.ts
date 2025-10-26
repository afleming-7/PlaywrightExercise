import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { env } from "../../utils/env";

export class LoginPage extends BasePage {
  readonly emailInput = this.page.locator('input[name="Email"]');
  readonly passwordInput = this.page.locator('input[name="Password"]');
  readonly loginButton = this.page.locator("#submit_button");
  readonly errorMessage = this.page.locator(".validation-summary-errors");

  constructor(page: Page) {
    super(page);
  }

  async gotoLogin() {
    const url = `${env.BASE_URL}/login`;
    await this.page.goto(url);
    await this.page.waitForSelector("form", { timeout: 5000 });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async verifyErrorMessage(expectedText: string) {
    await expect(this.errorMessage).toContainText(expectedText);
  }

  async verifySuccessfulLogin() {
    await expect(this.page).toHaveURL(/home/i);
  }
}
