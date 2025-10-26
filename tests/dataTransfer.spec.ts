import { test, expect } from "./support/fixtures";
import { DataTransferPage } from "./pages/DataTransferPage";

test("Upload, download, remove files", async ({ loggedInPage }) => {
  const dtPage = new DataTransferPage(loggedInPage);

  await dtPage.gotoDataTransfer();
  await dtPage.uploadFile("File1.txt", "Test file upload 1");
  await dtPage.downloadFile("File1.txt");
  await dtPage.removeFile("File1.txt");
});
