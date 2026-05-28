import { test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../../../playwright/.auth/user.json');

setup('authenticate as test user', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('img', { name: 'Cafeteria ordering system logo' }).waitFor({ state: 'visible' });

  await page.getByLabel('Email', { exact: true }).fill('tester123@gmail.com');
  await page.getByLabel('Password', { exact: true }).fill('Tester123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  // 'Ready to order?' is a plain text node on the home screen — more reliably
  // detected by Playwright than a React Native Web TextInput placeholder attribute
  await page.waitForURL(/\/(menu|tabs|\(tabs\)|$)/, { timeout: 15000 });

  await page.context().storageState({ path: authFile });
});
