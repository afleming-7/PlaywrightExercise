import { chromium, firefox } from "@playwright/test"; //add webkit if needed
import { PopupHandler } from "../pages/PopupHandler";
import { LoginPage } from "../pages/LoginPage";
import { env } from "../../utils/env";

// List browsers to generate storageState for
const browsers = [
  { name: "chromium", launcher: chromium },
  { name: "firefox", launcher: firefox },
];

export default async function globalSetup() {
  for (const { name, launcher } of browsers) {
    const browser = await launcher.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Handle cookie banner
    const popup = new PopupHandler(page);
    await page.goto(`${env.BASE_URL}/login`);
    await popup.handlePopups();

    // Perform login
    const loginPage = new LoginPage(page);
    await loginPage.gotoLogin();
    await loginPage.login(env.USERNAME, env.PASSWORD);

    // Save storage state per browser
    await context.storageState({
      path: `tests/support/storageState.${name}.json`,
    });

    await browser.close();
    console.log(`Saved logged-in storage state for ${name}`);
  }
}
