import { Page, expect, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import path from "path";
import fs from "fs";

export class DataTransferPage extends BasePage {
  readonly descriptionField: Locator;
  readonly nextButton: Locator;
  readonly uploadButton: Locator;

  constructor(page: Page) {
    super(page);
    this.descriptionField = page.locator("#FileViewModel_Description");
    this.nextButton = page.locator("#addfileNext");
    this.uploadButton = page.getByText(/upload selected file/i);
  }

  // --- Navigation
  async gotoDataTransfer() {
    await this.page.goto("/data/datatransfer");
    await this.page.waitForLoadState("networkidle");
  }

  // --- Get specific folder locator dynamically
  public async getFolder(
    companyName: string,
    mainFolderName: string,
    subfolderName: string
  ): Promise<Locator> {
    // Locate company
    const companyAccordion = this.page.locator(
      `div.accordion-group:has(a.accordion-toggle:text-is("${companyName}"))`
    );

    // Expand company if collapsed
    const companyToggle = companyAccordion.locator(
      `a.accordion-toggle:text-is("${companyName}")`
    );
    if ((await companyToggle.getAttribute("class"))?.includes("collapsed")) {
      await companyToggle.click();
    }

    // Click the main folder
    const mainFolderLink = companyAccordion.locator(
      `div.bg-light a:text-is("${mainFolderName}")`
    );
    await mainFolderLink.click();
    await this.page.waitForLoadState("networkidle");

    // Wait for subfolder section
    const subfolderFrame = this.page.locator(
      "div#accordion-subfolder.accordion.acc-home"
    );
    await subfolderFrame.waitFor({ state: "visible", timeout: 15000 });

    // Locate the subfolder
    const subfolderContainer = subfolderFrame.locator(
      `div.accordion-group:has(a.accordion-toggle:text-is("${subfolderName}"))`
    );

    // Expand if collapsed
    const subfolderToggle = subfolderContainer.locator("a.accordion-toggle");
    if ((await subfolderToggle.getAttribute("class"))?.includes("collapsed")) {
      await subfolderToggle.click();
    }

    await this.page.waitForLoadState("networkidle");
    return subfolderContainer;
  }

  // --- Upload
  async uploadFile(fileName: string, description: string, subfolder: Locator) {
    // Click "Add file"
    const addFileButton = subfolder.locator("a.btn.btn-default", {
      hasText: "Add file",
    });
    await addFileButton.click();

    // Fill description
    await this.descriptionField.fill(description);
    await this.nextButton.click();

    // Select the file for upload
    const filePath = path.resolve(process.cwd(), "uploads", fileName);
    if (!fs.existsSync(filePath))
      throw new Error(`Upload file not found: ${filePath}`);
    await this.page.setInputFiles('input[type="file"]', filePath);

    // Click the modal's upload button
    await this.uploadButton.click();

    // Wait for success or handle expected failure
    try {
      await this.waitForUploadSuccess(fileName);
      // Only wait for success toast if no error occurred
      const successToast = this.page.locator(
        '#toast-container .toast-message:text-is("Upload successful!")'
      );
      await successToast.waitFor({ state: "detached", timeout: 40000 });
    } catch (err) {
      const message = String(err);
      if (message.includes("Upload failed")) {
        console.warn(`Expected upload failure for ${fileName}: ${message}`);
        // Don't rethrow — let the test verify the toast
        return;
      }
      throw err; // Unexpected error → rethrow
    }
  }

  // --- Download
  async downloadFile(fileName: string, subfolder: Locator) {
    const downloadsDir = path.resolve(process.cwd(), "downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Start waiting for the download *before* the click
    const [download] = await Promise.all([
      this.page.waitForEvent("download", { timeout: 600_000 }),
      subfolder.getByRole("link", { name: fileName }).click(),
    ]);

    // Ensure the download fully finishes writing to disk before saving
    await download.path();

    const targetPath = path.join(downloadsDir, fileName);
    await download.saveAs(targetPath);

    await this.verifyDownloadedFile(targetPath);
  }

  // --- Remove
  async removeFile(fileName: string, subfolder: Locator) {
    const fileRow = subfolder.locator("tr", { hasText: fileName });
    if (!(await this.isElementVisible(fileRow))) return;

    const deleteButton = fileRow.locator('a[title="Delete file"]');
    await this.page.waitForLoadState("networkidle");
    await expect(deleteButton).toBeVisible({ timeout: 30000 });
    await deleteButton.click({ force: true });
    await this.confirmDeletePopup();

    await this.page.waitForLoadState("networkidle");
    await expect(fileRow).not.toBeVisible({ timeout: 10000 });
  }

  // --- File existence check
  async ensureFileDoesNotExist(fileName: string, subfolder: Locator) {
    const fileLink = subfolder.getByRole("link", { name: fileName });
    if (await this.isElementVisible(fileLink)) {
      await this.removeFile(fileName, subfolder);
    }
  }

  // --- Helpers
  private async waitForUploadSuccess(fileName: string) {
    const uploadModal = this.page.locator("#addFileWindow");
    await uploadModal.waitFor({ state: "visible", timeout: 10000 });

    const timeout = 10 * 90000;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const fileItem = uploadModal.locator(
        `ul.k-upload-files li:has(span.k-file-name:text-is("${fileName}"))`
      );

      if ((await fileItem.count()) > 0) {
        const status = fileItem.locator("span.k-file-state");
        const text = (await status.textContent())?.trim();
        if (text === "Uploaded") {
          console.log(`${fileName} upload complete`);
          return;
        }
      }

      //check for Invalid file type error
      const errorToast = this.page.locator("#toast-container");
      if (await errorToast.count()) {
        const toastText = (await errorToast.innerText()).trim();
        if (
          toastText.includes("Upload failed") ||
          toastText.includes("Illegal file type")
        ) {
          console.warn(`Upload failed for ${fileName}: ${toastText}`);
          return; // exit early, expected failure
        }
      }

      await this.page.waitForTimeout(500);
    }

    throw new Error(`Timeout waiting for "${fileName}" to reach "Uploaded"`);
  }

  private async verifyDownloadedFile(filePath: string) {
    const exists = fs.existsSync(filePath);
    expect(exists).toBeTruthy();
    if (exists) {
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);
      console.log(`File downloaded successfully: ${filePath}`);
    }
  }

  private async confirmDeletePopup() {
    const popups = this.page.locator(
      'div[id^="template-"][data-role="window"]:visible'
    );
    if ((await popups.count()) === 0) return;

    const popup = popups.last();
    await popup.waitFor({ state: "visible", timeout: 10000 }).catch(() => null);
    const okButton = popup.locator('input[type="button"][value="Ok"]');
    await expect(okButton).toBeVisible({ timeout: 5000 });
    await okButton.click();
  }

  public async isElementVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible().catch(() => false);
  }

  public getUploadErrorToast(): Locator {
    return this.page.locator("#toast-container");
  }

  public async waitForUploadError(timeout = 10000): Promise<string> {
    const toast = this.getUploadErrorToast();
    return toast.innerText();
  }
}
