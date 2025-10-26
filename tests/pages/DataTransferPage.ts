import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import path from "path";

export class DataTransferPage extends BasePage {
  readonly addFileButton = this.page.getByRole("button", { name: /add file/i });
  readonly descriptionField = this.page.locator('input[name="description"]');
  readonly nextButton = this.page.getByRole("button", { name: /next/i });
  readonly selectFileButton = this.page.getByRole("button", {
    name: /select a file/i,
  });
  readonly uploadButton = this.page.getByRole("button", {
    name: /upload selected file/i,
  });

  constructor(page: Page) {
    super(page);
  }

  async gotoDataTransfer() {
    await this.page.goto("/data/datatransfer");
  }

  async uploadFile(fileName: string, description: string) {
    const filePath = path.resolve(`./uploads/${fileName}`);
    await this.addFileButton.click();
    await this.descriptionField.fill(description);
    await this.nextButton.click();
    await this.page.setInputFiles('input[type="file"]', filePath);
    await this.uploadButton.click();
    await expect(this.page.getByText(fileName)).toBeVisible();
  }

  async downloadFile(fileName: string) {
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.getByText(fileName).click({ button: "right" }), // simulate right-click
    ]);
    const pathDownloaded = await download.path();
    expect(pathDownloaded).not.toBeNull();
  }

  async removeFile(fileName: string) {
    await this.page
      .getByText(fileName)
      .locator("..")
      .getByRole("button", { name: /remove/i })
      .click();
    await expect(this.page.getByText(fileName)).not.toBeVisible();
  }
}
