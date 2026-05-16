import { expect, test } from '@playwright/test';

test.describe('TC-AUTH-07: Login Screen UI Components & Button Navigation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate directly to the login path route
    await page.goto('/login');
    // Explicitly wait for the cafeteria logo asset to be visible on screen
    await page.getByRole('img', { name: 'Cafeteria ordering system logo' }).waitFor({ state: 'visible' });  });

  test('should verify all layout items and buttons render successfully', async ({ page }) => {
    const titleHeader = page.getByRole('heading', { name: 'Welcome back!' });
    await expect(titleHeader).toBeVisible();

    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  });

  test('should trigger client validation warning flags on an empty form submission', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign in', exact: true });
    
    // Trigger the element click event listener directly to clear sub-pixel responder limits
    await signInButton.dispatchEvent('click');
    
    const emailError = page.locator('text=Email is required.');
    await expect(emailError).toBeVisible();
  });

  test('should enforce strict formatting checking arrays on standard inputs', async ({ page }) => {
    await page.getByLabel('Email', { exact: true }).fill('EmailWithoutDomain');
    await page.getByLabel('Password', { exact: true }).fill('securePass123');
    
    const signInButton = page.getByRole('button', { name: 'Sign in', exact: true });
    await signInButton.dispatchEvent('click');

    const formatError = page.locator('text=Please enter a valid email address.');
    await expect(formatError).toBeVisible();
  });

  test('should pop up placeholder warnings on unimplemented Google authentication blocks', async ({ page }) => {
    const googleButton = page.getByRole('button', { name: 'Sign in with Google' });
    await googleButton.dispatchEvent('click');

    const expectedMessage = 'Google sign-in is not enabled yet. Please sign in with email and password.';
    await expect(page.locator(`text=${expectedMessage}`)).toBeVisible();
  });

  test('should accurately route users toward the account registration viewport on link tap', async ({ page }) => {
    const signUpLink = page.getByRole('link', { name: 'Sign up' });
    await signUpLink.dispatchEvent('click');
    
    await expect(page).toHaveURL(/\/signup/);
  });
});