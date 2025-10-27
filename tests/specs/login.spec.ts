import { test, expect } from "../support/fixtures";
import { LoginPage } from "../pages/LoginPage";
import { env } from "../../utils/env";

test.describe("Assignment 1 - Login Tests", () => {
  const { USERNAME, PASSWORD, WRONG_PASSWORD } = env;

  test("1a - Invalid login shows error message", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("Navigate to login page", async () => {
      await loginPage.gotoLogin();
    });

    await test.step("Attempt login with wrong password", async () => {
      await loginPage.login(USERNAME, WRONG_PASSWORD);
    });

    await test.step("Verify error message is displayed", async () => {
      await loginPage.verifyErrorMessage(
        "The supplied credentials do not match our records. Please verify them and try again"
      );
    });
  });

  test("1b - Successful login redirects to homepage", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("Navigate to login page", async () => {
      await loginPage.gotoLogin();
    });

    await test.step("Login with valid credentials", async () => {
      await loginPage.login(USERNAME, PASSWORD);
    });

    await test.step("Verify successful login", async () => {
      await loginPage.verifySuccessfulLogin();
    });
  });
});
