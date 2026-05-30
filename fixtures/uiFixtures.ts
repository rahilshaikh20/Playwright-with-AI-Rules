import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LoggedInPage } from '../pages/LoggedInPage';

type UiFixtures = {
  loginPage: LoginPage;
  loggedInPage: LoggedInPage;
};

export const test = base.extend<UiFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  loggedInPage: async ({ page }, use) => {
    await use(new LoggedInPage(page));
  },
});

export { expect } from '@playwright/test';
