import { test, expect } from "../support/fixtures";
import { DataTransferPage } from "../pages/DataTransferPage";

const COMPANY = "DropBox Customer 1";
const MAIN_FOLDER = "Folder 1";
const SUBFOLDER = "Opdracht";

// 🗂️ Files to test — can easily add more here
const FILES = [
  { name: "File1.txt", description: "Test file upload 1" },
  { name: "File2.txt", description: "Test file upload 2" },
  { name: "File3", description: "Test file upload 3" },
];

test.describe("Data Transfer file operations", () => {
  test.beforeEach(async ({ loggedInPage }) => {
    const dtPage = new DataTransferPage(loggedInPage);
    await dtPage.gotoDataTransfer();

    // Optional cleanup before running each test
    for (const file of FILES) {
      await dtPage.ensureFileDoesNotExist(
        COMPANY,
        MAIN_FOLDER,
        SUBFOLDER,
        file.name
      );
    }
  });

  // Loop over all files dynamically
  for (const file of FILES) {
    test(`Upload, download, and remove ${file.name}`, async ({
      loggedInPage,
    }) => {
      const dtPage = new DataTransferPage(loggedInPage);

      await test.step("Navigate to Data Transfer page", async () => {
        await dtPage.gotoDataTransfer();
      });

      await test.step(`Upload ${file.name}`, async () => {
        await dtPage.uploadFile(
          COMPANY,
          MAIN_FOLDER,
          SUBFOLDER,
          file.name,
          file.description
        );
      });

      await test.step(`Download ${file.name}`, async () => {
        await dtPage.downloadFile(COMPANY, MAIN_FOLDER, SUBFOLDER, file.name);
      });

      await test.step(`Remove ${file.name}`, async () => {
        await dtPage.removeFile(COMPANY, MAIN_FOLDER, SUBFOLDER, file.name);
      });
    });
  }
});
