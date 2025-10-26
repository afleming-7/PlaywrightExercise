import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import path from "path";
import fs from "fs";

export class DataTransferPage extends BasePage {
  readonly addFileButton = this.page
    .locator("a.btn.btn-default", { hasText: "Add file" })
    .first();
  readonly descriptionField = this.page.locator("#FileViewModel_Description");
  readonly nextButton = this.page.locator("#addfileNext");
  readonly uploadButton = this.page.getByText(/upload selected file/i);
  readonly okayButton = this.page.getByText(/ok/i);

  constructor(page: Page) {
    super(page);
  }

  async gotoDataTransfer() {
    await this.page.goto("/data/datatransfer");
    await this.page.waitForLoadState("networkidle");
  }

  async uploadFile(fileName: string, description: string) {
    await this.ensureFileDoesNotExist(fileName);

    const filePath = path.resolve(process.cwd(), "uploads", fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Upload file not found: ${filePath}`);
    }

    await this.addFileButton.click();
    await this.descriptionField.fill(description);
    await this.nextButton.click();

    await this.page.setInputFiles('input[type="file"]', filePath);
    await this.uploadButton.click();

    await this.waitForUploadToast();
    // await this.page.waitForSelector(`text=${fileName}`, { timeout: 20000 });
    // await this.page.waitForLoadState("networkidle");

    const fileLink = this.page.getByRole("link", { name: fileName });
    await expect(fileLink).toBeVisible();
  }

  async downloadFile(fileName: string) {
    const downloadsDir = path.resolve(process.cwd(), "downloads");

    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.getByRole("link", { name: fileName }).click(),
    ]);

    const targetPath = path.join(downloadsDir, fileName);
    await download.saveAs(targetPath);

    await expect(fs.existsSync(targetPath)).toBeTruthy();
    const stats = fs.statSync(targetPath);
    expect(stats.size).toBeGreaterThan(0);

    //await download.whenFinished();
    console.log(`File downloaded successfully: ${targetPath}`);
  }

  async removeFile(fileName: string) {
    await this.waitForUploadToast();

    const fileRow = this.page.getByRole("link", { name: fileName });
    if (await fileRow.isVisible().catch(() => false)) {
      const deleteButton = fileRow.getByTitle("Delete file");
      await deleteButton.scrollIntoViewIfNeeded();
      await deleteButton.click({ force: true });
      await this.okayButton.click();
      await this.page.waitForLoadState("networkidle");
      await expect(fileRow).not.toBeVisible({ timeout: 10000 });
    }
  }

  async ensureFileDoesNotExist(fileName: string) {
    const fileLocator = this.page.getByRole("link", { name: fileName });
    if (await fileLocator.isVisible().catch(() => false)) {
      await this.removeFile(fileName);
    }
  }

  async waitForUploadToast() {
    const toast = this.page.locator("div.toast-message", {
      hasText: "Upload successful",
    });
    await toast.waitFor({ state: "visible", timeout: 5000 }).catch(() => null);
    await toast.waitFor({ state: "hidden", timeout: 10000 });
  }
}
