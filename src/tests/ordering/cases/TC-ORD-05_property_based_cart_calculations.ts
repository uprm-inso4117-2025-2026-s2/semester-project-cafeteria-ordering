/*
TC-ORD-05
Author: Kaysha Pagan

Description
Property based test case for cart total calculations in the ordering flow.
This is a unit test that checks randomized cart item prices, quantities,
and add-ons to verify that cart totals remain consistent.

Preconditions
* fast check is installed as a development dependency.
* MenuItem model exists in src/models/food-item-class.ts.
* Cart subtotal behavior follows the formula used in src/app/payment.tsx.
*/

// Test Data
export const minItemPrice = 0;
export const maxItemPrice = 5000;
export const minAddonPrice = 0;
export const maxAddonPrice = 1000;
export const minQuantity = 1;
export const maxQuantity = 10;

/*
Test Steps

. Generate randomized menu item prices, quantities, and add ons.
. Build randomized cart items using the MenuItem class.
. Calculate subtotal using the same subtotal formula used in payment.tsx.
. Verify five cart calculation properties.

Expected Results
. Cart totals should never be negative.
. Adding an item should not decrease the total.
. Removing an item should not increase the total.
. Recalculating the same cart should return the same total.
. Add on prices should be included in the item subtotal.

Reviewed By
<reviewer(s) fill this part>
*/