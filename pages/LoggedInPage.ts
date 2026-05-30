import { Page, Locator, expect } from '@playwright/test';
import { loggedInSuccessUrl } from '../config/urls';
import loginTestData from '../testData/loginTestData.json';

export class LoggedInPage {
  private readonly logoutButton: Locator;
  private readonly successMessage: Locator;

  constructor(private readonly page: Page) {
    this.logoutButton = page.getByRole('link', { name: loginTestData.messages.logoutButton });
    this.successMessage = page.locator('.post-content');
  }

  async verifyLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(loggedInSuccessUrl());
    await expect(this.page.getByRole('heading', { name: loginTestData.pageTitles.loggedIn })).toBeVisible();
    await expect(this.successMessage).toContainText(loginTestData.messages.successText);
    await expect(this.successMessage).toContainText(loginTestData.messages.successLoggedIn);
    await expect(this.logoutButton).toBeVisible();
  }

  async clickLogout(): Promise<void> {
    await expect(this.logoutButton).toBeVisible();
    await this.logoutButton.click();
  }
}
