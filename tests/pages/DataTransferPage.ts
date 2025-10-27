import { Page, expect, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import path from "path";
import fs from "fs";

export class DataTransferPage extends BasePage {
  readonly descriptionField: Locator;
  readonly nextButton: Locator;
  readonly uploadButton: Locator;
  subfolderContainer!: Locator;

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

  // --- Dynamic locator helper
  async locateSubfolder(
    companyName: string,
    mainFolderName: string,
    subfolderName: string
  ): Promise<Locator> {
    // Locate the company accordion group
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

    // Click the main folder inside the company accordion
    const mainFolderLink = companyAccordion.locator(
      `div.bg-light a:text-is("${mainFolderName}")`
    );
    await mainFolderLink.click();

    // Scope to the subfolder frame
    const subfolderFrame = this.page.locator("div.accordion.acc-home");

    // Locate the specific subfolder inside the frame
    const subfolderContainer = subfolderFrame.locator(
      `div.accordion-group:has(a.accordion-toggle:text-is("${subfolderName}"))`
    );

    // Expand the subfolder if collapsed
    const subfolderToggle = subfolderContainer.locator("a.accordion-toggle");
    if ((await subfolderToggle.getAttribute("class"))?.includes("collapsed")) {
      await subfolderToggle.click();
    }

    return subfolderContainer;
  }

  // --- Upload
  async uploadFile(
    companyName: string,
    mainFolderName: string,
    subfolderName: string,
    fileName: string,
    description: string
  ) {
    // Locate and expand the subfolder
    this.subfolderContainer = await this.locateSubfolder(
      companyName,
      mainFolderName,
      subfolderName
    );

    // Remove the file if it already exists
    await this.ensureFileDoesNotExist(
      companyName,
      mainFolderName,
      subfolderName,
      fileName
    );

    // Click "Add file"
    await this.clickAddFileButton();

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

    // Wait for the upload to complete (works for large files)
    await this.waitForUploadSuccess(fileName);
  }

  // --- Download
  async downloadFile(
    companyName: string,
    mainFolderName: string,
    subfolderName: string,
    fileName: string
  ) {
    this.subfolderContainer = await this.locateSubfolder(
      companyName,
      mainFolderName,
      subfolderName
    );

    const downloadsDir = path.resolve(process.cwd(), "downloads");
    if (!fs.existsSync(downloadsDir))
      fs.mkdirSync(downloadsDir, { recursive: true });

    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.subfolderContainer.getByRole("link", { name: fileName }).click(),
    ]);

    const targetPath = path.join(downloadsDir, fileName);
    await download.saveAs(targetPath);
    await this.verifyDownloadedFile(targetPath);
  }

  // --- Remove
  async removeFile(
    companyName: string,
    mainFolderName: string,
    subfolderName: string,
    fileName: string
  ) {
    this.subfolderContainer = await this.locateSubfolder(
      companyName,
      mainFolderName,
      subfolderName
    );

    const fileRow = this.subfolderContainer.locator("tr", {
      hasText: fileName,
    });

    if (!(await this.isElementVisible(fileRow))) return;

    const deleteButton = fileRow.locator('a[title="Delete file"]');
    await expect(deleteButton).toBeAttached({ timeout: 5000 });
    await deleteButton.click({ force: true });
    await this.confirmDeletePopup();

    await this.page.waitForLoadState("networkidle");
    await expect(fileRow).not.toBeVisible({ timeout: 10000 });
  }

  // --- File existence check
  async ensureFileDoesNotExist(
    companyName: string,
    mainFolderName: string,
    subfolderName: string,
    fileName: string
  ) {
    this.subfolderContainer = await this.locateSubfolder(
      companyName,
      mainFolderName,
      subfolderName
    );

    const fileLink = this.subfolderContainer.getByRole("link", {
      name: fileName,
    });

    if (await this.isElementVisible(fileLink)) {
      await this.removeFile(
        companyName,
        mainFolderName,
        subfolderName,
        fileName
      );
    }
  }

  // --- Helpers
  private async clickAddFileButton() {
    const addFileButton = this.subfolderContainer.locator("a.btn.btn-default", {
      hasText: "Add file",
    });
    await addFileButton.click();
  }

  // --- Wait for upload to finish and click "Next"
  private async waitForUploadSuccess(fileName: string) {
    // Wait for the upload modal to exist
    const uploadModal = this.page.locator("#addFileWindow");
    await uploadModal.waitFor({ state: "attached", timeout: 10000 });

    // Wait for the file item to appear
    const fileItem = uploadModal.locator(
      `ul.k-upload-files li:has(span.k-file-name:text-is("${fileName}"))`
    );
    await fileItem.waitFor({ state: "attached", timeout: 120000 });

    // Wait until the file status shows "Uploaded" without scrolling
    const status = fileItem.locator('span.k-file-state:text-is("Uploaded")');
    await expect(status).toHaveText("Uploaded", { timeout: 300000 });
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
    if ((await popups.count()) === 0) {
      // No popup appeared, skip
      return;
    }

    const popup = popups.last();

    // Wait for popup to be visible, but catch timeout
    try {
      await popup.waitFor({ state: "visible", timeout: 10000 });
    } catch {
      console.warn("Delete confirmation popup did not appear.");
      return;
    }

    const okButton = popup.locator('input[type="button"][value="Ok"]');
    await expect(okButton).toBeVisible({ timeout: 5000 });
    await okButton.click();
  }

  // Change from private to public
  public async isElementVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible().catch(() => false);
  }
}
