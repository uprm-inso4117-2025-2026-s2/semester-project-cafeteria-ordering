/*
TC-ORD-07: Order Modification Integration Test
Author: Yadriel Rivera Rodriguez (@YadrielRivera)

Description
Verify that order modification routines and integration of multiple modules correctly update order item ingredients and price when extras are added 
Verify that Supabase receives the order with the specified modifications 

Preconditions
- Supabase is running and reachable (for any backend/DB calls).
- A valid user is logged in
- A known menu item exists with a deterministic base price and base ingredient list.
- One or more extras are available for the known item
*/

/*
Test data
N/A no script will be used for this testing 

*/

/*
Test Step | Expected Result
1 | Log in with valid user | user is logged in correctly and UI displays components correctly
2 | Add an extra ingredient to a known menu item selected from the main page | UI provides visual output that indicated addition of ingredient
3 | Reload app to ensure extra ingredient selections are connected to Supabase | The app retains the extra ingredient selection after refreshing
4 | Add modified order to cart and check cart | Cart correctly shows price of item and additional charges for extra ingredients
5 | Reload app to ensure that the cart items are connected to Supabase | The app retains the items in cart and data displayed previously
6 | Place Order if Stripe is not yet enabled | Order should display in "Orders" section with selected item and extras
7 | Check "Orders" table in Supabase and  reload the app to ensure that the orders are connected to the Supabase | The "Orders" table updated and displays the latest order with the correct item and extras and upon refreshing, the app maintains the order as it was displayed


Notes
- No test script is included with this integration test
- Test data is updated and valid up until the pull request date, which implies that any modifications done to the app after this date may render the test as outdated


Author: Yadriel Rivera Rodriguez
Reviewer: Lucas Matos
Date Created: 2026-05-25

Reviewed By
Lucas Matos, 

*/
