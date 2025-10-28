import { test, expect } from "../support/fixtures";
import { DataTransferPage } from "../pages/DataTransferPage";

// 🗂️ Folder configuration (easy to change)
const COMPANY = "DropBox Customer 1";
const MAIN_FOLDER = "Folder 1";
const SUBFOLDER = "Opdracht";

// 🗂️ Files to test
const FILES = [
  { name: "File1.txt", description: "Test file upload 1" },
  { name: "File2.txt", description: "Test file upload 2" },
];

test.describe.configure({ mode: "serial" });

test.describe("Data Transfer file operations", () => {
  test.beforeEach(async ({ loggedInPage }) => {
    const dtPage = new DataTransferPage(loggedInPage);
    await dtPage.gotoDataTransfer();
    const subfolder = await dtPage.getFolder(COMPANY, MAIN_FOLDER, SUBFOLDER);

    // Optional cleanup before running each test
    for (const file of FILES) {
      await dtPage.ensureFileDoesNotExist(file.name, subfolder);
    }
  });

  for (const file of FILES) {
    test(`Upload, download, and remove ${file.name}`, async ({
      loggedInPage,
    }) => {
      const dtPage = new DataTransferPage(loggedInPage);
      await dtPage.gotoDataTransfer();
      const subfolder = await dtPage.getFolder(COMPANY, MAIN_FOLDER, SUBFOLDER);

      await test.step(`Upload ${file.name}`, async () => {
        await dtPage.uploadFile(file.name, file.description, subfolder);
      });

      await test.step(`Download ${file.name}`, async () => {
        await dtPage.downloadFile(file.name, subfolder);
      });

      await test.step(`Remove ${file.name}`, async () => {
        await dtPage.removeFile(file.name, subfolder);
      });
    });
  }
});

test("Upload invalid file type shows error", async ({ loggedInPage }) => {
  const dtPage = new DataTransferPage(loggedInPage);
  await dtPage.gotoDataTransfer();
  const subfolder = await dtPage.getFolder(COMPANY, MAIN_FOLDER, SUBFOLDER);

  const invalidFile = { name: "File3", description: "Test file upload 3" };

  await test.step(`Upload ${invalidFile.name}`, async () => {
    await dtPage.uploadFile(
      invalidFile.name,
      invalidFile.description,
      subfolder
    );
  });

  await test.step("Verify error toast message", async () => {
    const errorText = await dtPage.waitForUploadError(15000);
    expect(errorText).toMatch(/illegal file type/i);
  });
});
