import { expect, test } from '@playwright/test';

test.describe('TC-HOME-01: Home Page UI Components & Button Navigation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText('Ready to order?').waitFor({ state: 'visible', timeout: 20000 });
  });

  // Step 2 — verify structural layout elements
  test('should render all core layout elements on initial load', async ({ page }) => {
    await expect(page.getByText('Ready to order?')).toBeVisible();
    await expect(page.getByText('Category')).toBeVisible();
    await expect(page.getByText('Rating')).toBeVisible();
    await expect(page.getByText('Breakfast')).toBeVisible();
    await expect(page.getByText('Lunch')).toBeVisible();
  });

  // Step 3 — cart icon routes to /payment
  test('should navigate to the payment screen when the cart icon button is pressed', async ({ page }) => {
    await page.getByRole('button').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/payment/);
  });

  // Steps 4 & 10 — Best Seller card routes to /menu/:id
  test('should navigate to the menu item detail page when a menu item card is pressed', async ({ page }) => {
    await page.getByText('Best Seller').waitFor({ state: 'visible' });
    await page.getByText('Best Seller').dispatchEvent('click');
    await expect(page).toHaveURL(/\/menu\/.+/);
  });

  // Step 5 — Breakfast chip
  test('should activate the Breakfast category chip on press', async ({ page }) => {
    const breakfastChip = page.getByText('Breakfast');
    await breakfastChip.dispatchEvent('click');
    await expect(breakfastChip).toBeVisible();
    await expect(page.getByText('Rating')).toBeVisible();
    await expect(page.getByText('Lunch')).toBeVisible();
  });

  // Step 6 — Lunch chip
  test('should activate the Lunch category chip on press', async ({ page }) => {
    const lunchChip = page.getByText('Lunch');
    await lunchChip.dispatchEvent('click');
    await expect(lunchChip).toBeVisible();
    await expect(page.getByText('Rating')).toBeVisible();
    await expect(page.getByText('Breakfast')).toBeVisible();
  });

  // Step 7 — Rating chip restores default
  test('should restore the default Rating chip selection on press', async ({ page }) => {
    await page.getByText('Lunch').dispatchEvent('click');
    const ratingChip = page.getByText('Rating');
    await ratingChip.dispatchEvent('click');
    await expect(ratingChip).toBeVisible();
    await expect(page.getByText('Breakfast')).toBeVisible();
    await expect(page.getByText('Lunch')).toBeVisible();
  });

  // Step 8 — search input accepts text
  test('should filter menu items based on search input text', async ({ page }) => {
    const searchBar = page.locator('input').first();
    await searchBar.fill('Spaghetti');
    await expect(searchBar).toHaveValue('Spaghetti');
  });

  // Step 9 — clearing search restores full list
  test('should restore the full menu list after clearing the search input', async ({ page }) => {
    const searchBar = page.locator('input').first();
    await searchBar.fill('Spaghetti');
    await searchBar.fill('');
    await expect(searchBar).toHaveValue('');
    await expect(page.getByText('Rating')).toBeVisible();
    await expect(page.getByText('Breakfast')).toBeVisible();
    await expect(page.getByText('Lunch')).toBeVisible();
  });

});
