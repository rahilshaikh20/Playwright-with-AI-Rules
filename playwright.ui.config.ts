import { defineConfig, devices } from '@playwright/test';
import { constants } from './config/constants';
import { urls } from './config/urls';

export default defineConfig({
  testDir: './tests/ui',
  testMatch: '**/*.spec.ts',
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  retries: constants.retries,
  workers: process.env.CI ? 1 : undefined,
  timeout: constants.timeout.default,
  reporter: [
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results', detail: true, suiteTitle: true }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: urls.baseUrl,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: constants.timeout.action,
    navigationTimeout: constants.timeout.navigation,
  },
  outputDir: 'test-results/ui',
  globalSetup: './utils/uiGlobalSetup.ts',
});
