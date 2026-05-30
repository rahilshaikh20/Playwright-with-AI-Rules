import * as allure from 'allure-js-commons';
import { test, expect } from '../../fixtures/uiFixtures';
import loginTestData from '../../testData/loginTestData.json';
import { logUiTest } from '../../utils/uiLogger';

test.describe('Login Module', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test.afterEach(async ({ browser }, testInfo) => {
    const endTime = Date.now();
    const startTime = endTime - testInfo.duration;
    logUiTest({
      testTitle: testInfo.title,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      durationMs: testInfo.duration,
      status: testInfo.status === 'passed' ? 'passed' : testInfo.status === 'skipped' ? 'skipped' : 'failed',
      browser: browser.browserType().name(),
      environment: process.env.TEST_ENV ?? 'qa',
      failureReason: testInfo.error?.message,
    });
  });

  test('TC-LOGIN-001: Positive LogIn test', async ({ loginPage, loggedInPage, page }) => {
    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.story('Valid Login');
    await allure.severity('critical');

    await test.step('Enter valid credentials', async () => {
      await loginPage.login(loginTestData.validUser.username, loginTestData.validUser.password);
    });

    await test.step('Verify successful login', async () => {
      await loggedInPage.verifyLoginSuccess();
      await expect(page).toHaveURL(/logged-in-successfully/);
    });
  });

  test('TC-LOGIN-002: Negative username test', async ({ loginPage }) => {
    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.story('Invalid Username');
    await allure.severity('critical');

    await test.step('Enter invalid username', async () => {
      await loginPage.login(loginTestData.invalidUser.username, loginTestData.invalidUser.password);
    });

    await test.step('Verify error message', async () => {
      await loginPage.verifyErrorMessage(loginTestData.messages.invalidUsername);
    });
  });

  test('TC-LOGIN-003: Negative password test', async ({ loginPage }) => {
    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.story('Invalid Password');
    await allure.severity('critical');

    await test.step('Enter invalid password', async () => {
      await loginPage.login(loginTestData.invalidPassword.username, loginTestData.invalidPassword.password);
    });

    await test.step('Verify error message', async () => {
      await loginPage.verifyErrorMessage(loginTestData.messages.invalidPassword);
    });
  });

  test('TC-LOGIN-004: Empty credentials validation', async ({ loginPage }) => {
    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.story('Empty Credentials');
    await allure.severity('normal');

    await test.step('Submit empty credentials', async () => {
      await loginPage.login(loginTestData.emptyCredentials.username, loginTestData.emptyCredentials.password);
    });

    await test.step('Verify error is displayed', async () => {
      await loginPage.verifyErrorMessage(loginTestData.messages.invalidUsername);
    });
  });

  test('TC-LOGIN-005: Login page UI elements validation', async ({ loginPage }) => {
    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.story('UI Elements');
    await allure.severity('normal');

    await test.step('Verify form elements', async () => {
      await loginPage.verifyLoginFormVisible();
    });
  });

  test('TC-LOGIN-006: Log out after successful login', async ({ loginPage, loggedInPage }) => {
    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.story('Logout');
    await allure.severity('normal');

    await test.step('Login with valid credentials', async () => {
      await loginPage.login(loginTestData.validUser.username, loginTestData.validUser.password);
      await loggedInPage.verifyLoginSuccess();
    });

    await test.step('Click logout and verify redirect', async () => {
      await loggedInPage.clickLogout();
      await loginPage.verifyOnLoginPage();
    });
  });
});
