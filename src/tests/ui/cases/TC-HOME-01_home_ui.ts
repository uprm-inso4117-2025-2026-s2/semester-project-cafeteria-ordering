/*
Home Page UI Button Interactions & Navigation Flows TC
Author: @JorgeDeLeonOrama

Description
Verify that all interactive buttons, pressable cards, category chips, and the search
input on the Home page behave correctly under full headless browser engines.
Type of test: Automated End-to-End Browser UI Testing (Playwright)

Preconditions
* The local compilation server must be live at http://localhost:8081
* Supabase configuration credentials must be populated in the execution environment shell context
* At least one menu item must exist in the connected Supabase database so the Best Seller card and menu item list render with real data
*/

// Test Data
const homeRoute = '/';
const cartRoute = '/payment';
const menuDetailRoute = /\/menu\/.+/;
const categories = ['Rating', 'Breakfast', 'Lunch'];
const searchQuery = 'Spaghetti';

export { homeRoute, cartRoute, menuDetailRoute, categories, searchQuery };

/*
Test Steps

1. Navigate headless browser instance to the / (home) route and wait for the Search placeholder to confirm the page has rendered
2. Check that structural layout blocks and interactive nodes are visible: greeting, search bar, Category label, and all three category chips
3. Press the cart icon button (first role=button in the header) to verify routing to /payment
4. Wait for the Best Seller card to appear and click it to verify routing to /menu/:id
5. Click the Breakfast category chip and verify it remains visible alongside the other chips
6. Click the Lunch category chip and verify it remains visible alongside the other chips
7. Click the Rating chip to restore the default selection and verify all chips remain visible
8. Type a search query into the Search input and verify the input value reflects the typed text
9. Clear the Search input and verify the value is empty and all category chips are still visible
10. Click the Best Seller card to verify routing to /menu/:id from the menu item card interaction

Expected Results
All ten test steps pass in headless mode across Chromium, Firefox, and WebKit. The cart button
reliably routes to /payment. The Best Seller card reliably routes to /menu/:id. All three category
chips remain visible and pressable after selection. The search bar correctly accepts and clears
input. No regressions are introduced to the previously passing TC-AUTH-07 login UI tests.

Reviewed By
TBD
*/
