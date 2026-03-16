/*
Order Modification TC
Author: Yadriel Rivera Rodriguez (@YadrielRivera)

Description
Verify backend order modification routines correctly update order item ingredients and price when extras are added/removed, enforce valid ingredient/extra combinations, and preserve base meal defaults. 
This is a unit test exercise focusing on the methods: `getBasePrice()`, `modBasePrice()`, `getIngredients()`, and `modIngredients()`.

Preconditions
- Supabase is running and reachable (for any backend/DB calls).
- A known menu item exists (e.g., "Spaghetti Bolognese") with a deterministic base price and base ingredient list.
- The unit under test exposes the functions: `getBasePrice(orderItem)`, `modBasePrice(orderItem, newPrice)`, `getIngredients(orderItem)`, `modIngredients(orderItem, action, ingredient)`.
- The test harness can reset order items to a known initial state between test steps.
*/

//Test Data
//<insert inputs used during execution> Section must be uncommented code.
/**
 * Menu Item | Base Price | Base Ingredients
   Spaghetti Bolognese | 10.00 | ["pasta", "tomato sauce", "meatballs"]

Extra | Price Delta | Valid for Meal?
"cheese" | +2.00 | yes
"candy" | +1.00 | no (invalid)

Ingredient to remove | Expected behavior
"meatballs" | removed; price adjusts if base price is mutable
 */

/*
Test Step | Expected Result
1 | Initialize order item with base meal state | `getBasePrice(item)` returns 10.00; `getIngredients(item)` returns ["pasta","tomato sauce","meatballs"]
2 | Add valid extra "cheese" via `modIngredients(item, "add", "cheese")` and `modBasePrice(item, 2.00)` | Ingredient list includes "cheese"; base price increases to 12.00
3 | Remove ingredient "meatballs" via `modIngredients(item, "remove", "meatballs")` | Ingredient list no longer contains "meatballs"; price updates accordingly (if base price is mutable) or remains 12.00 if static
4 | Attempt to add invalid extra "candy" via `modIngredients(item, "add", "candy")` | Operation fails/returns error; ingredient list unchanged; price remains unchanged
5 | Reset item to base meal state and verify base ingredients are restored (no extras) and base price returns to 10.00 | `getIngredients(item)` returns exactly base set; `getBasePrice(item)` returns 10.00

Notes
- The expected price "newPrice" assume the system uses a mutable base price; if the system treats base price as immutable, adjust the expected results accordingly.
- Ensure that validation logic prevents non-food extras from being added to incompatible meals.
- If `modIngredients` returns a new order item object rather than modifying in place, adjust test steps to use returned value.

Author: Yadriel Rivera Rodriguez
Reviewer: <reviewer name>
Date Created: 2026-03-15

Reviewed By
<reviewer(s) fill this part>

*/