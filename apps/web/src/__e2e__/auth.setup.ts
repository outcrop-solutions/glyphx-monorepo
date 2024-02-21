import {Page, test, expect} from '@playwright/test';
import {ADMIN_STORAGE, APP_URL, USER_STORAGE} from './constants';

test.describe(() => {
  test.use({storageState: USER_STORAGE});

  test('Can Login as a User', async ({page}: {page: Page}) => {
    await page.goto(APP_URL);
    await page.waitForURL((url) => url.origin === APP_URL, {waitUntil: 'networkidle'});
    // await page.waitForSelector('internal:attr=[data-testid="welcome-header"]');

    // const welcomeHeader = await page.getByTestId('welcome-header');
    // const welcomeMsg = `Welcome, ${USER.firstName}!`;
    // await expect(welcomeHeader).toContainText(welcomeMsg, {ignoreCase: true});
  });
});

test.describe(() => {
  test.use({storageState: ADMIN_STORAGE});
  test('Can Login as an Admin', async ({page}: {page: Page}) => {
    await page.goto(APP_URL);
    await page.waitForURL((url) => url.origin === APP_URL, {waitUntil: 'networkidle'});
    // await page.waitForSelector('internal:attr=[data-testid="welcome-header"]');

    // const welcomeHeader = await page.getByTestId('welcome-header');
    // const welcomeMsg = `Welcome, ${ADMIN.firstName}!`;
    // await expect(welcomeHeader).toContainText(welcomeMsg, {ignoreCase: true});
  });
});
