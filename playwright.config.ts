import { defineConfig, devices } from '@playwright/test';
import { apiConfig } from './config/api.config';
import { constants } from './config/constants';
import { urls } from './config/urls';

export default defineConfig({
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  projects: [
    {
      name: 'api',
      testDir: './tests',
      testMatch: '**/*_test.ts',
      fullyParallel: false,
      retries: apiConfig.retries,
      timeout: apiConfig.timeout,
      use: {
        baseURL: apiConfig.baseUrl,
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
      globalSetup: './utils/globalSetup.ts',
      globalTeardown: './utils/globalTeardown.ts',
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      testMatch: '**/*.spec.ts',
      fullyParallel: true,
      retries: constants.retries,
      timeout: constants.timeout.default,
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
    },
  ],
});
