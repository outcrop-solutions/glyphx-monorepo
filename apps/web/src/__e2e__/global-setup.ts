import {chromium, FullConfig} from '@playwright/test';
import {ADMIN_STORAGE, USER_STORAGE, APP_URL, LOGIN_URL, u1, u2} from './constants';
import {userService} from 'business';

async function globalSetup(_config: FullConfig) {
  // These User Factories are specific to our boilerplate
  // The goal here is to create an Admin and User for your future specs

  const browser = await chromium.launch();
  const adminPage = await browser.newPage();
  await adminPage.goto(LOGIN_URL);
  await adminPage.getByPlaceholder('user@email.com').click();
  await adminPage.getByPlaceholder('user@email.com').fill(admin.email as string);
  await adminPage.getByRole('button', {name: 'Send the Magic Link'}).click();
  await adminPage.waitForURL((url) => url.origin === APP_URL, {waitUntil: 'networkidle'});
  await adminPage.context().storageState({path: ADMIN_STORAGE});

  const userPage = await browser.newPage();
  await userPage.goto(LOGIN_URL);
  await userPage.getByPlaceholder('user@email.com').click();
  await userPage.getByPlaceholder('user@email.com').fill(user.email as string);
  await userPage.getByRole('button', {name: 'Send the Magic Link'}).click();
  await userPage.waitForURL((url) => url.origin === APP_URL, {waitUntil: 'networkidle'});
  await userPage.context().storageState({path: USER_STORAGE});

  // We are done for now :)
  await browser.close();
}

export default globalSetup;
