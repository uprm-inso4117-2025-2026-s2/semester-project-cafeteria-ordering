/*
Staff Dashboard Usability TC
Author: Reinaldo J. Martinez Morales

Description
Manual usability evaluation of the staff-facing dashboard to assess workflow clarity,
ease of navigation, error prevention, response efficiency, and learnability for new
staff users. Covers five core staff workflows: viewing active orders, updating order
statuses, managing the kitchen queue via the dashboard, verifying pickups, and handling
order issues via Special Status Requests.
Type of test: Manual Usability Test

Preconditions
* The app is running and accessible on a target device or simulator.
* A staff-role account with valid credentials is available.
* At least one order exists in the system under each status category (unread, open, finished).
* Supabase is connected and reachable.
*/

// Test Data
const staffEmail = "staff@test.com";
const staffPassword = "testpassword";
const expectedTabs = ["Unread", "Open", "Finished"];
const expectedSortFields = ["Customer", "Date", "Order Number"];
const expectedPeriods = ["Day", "Week", "Month", "Year"];

export { staffEmail, staffPassword, expectedTabs, expectedSortFields, expectedPeriods };

/*
Test Steps

Workflow 1 — Viewing Active Orders
1. Log in with staff credentials and navigate to the Orders screen via the navigation drawer.
2. Verify the three tabs (Unread, Open, Finished) are visible.
3. Tap each tab and confirm that order cards are rendered and are readable.
4. Tap each sort control (Customer, Date, Order Number) and verify the list re-sorts accordingly.
5. Identify a tab with no orders and verify an empty-state message is displayed.

Workflow 2 — Updating Order Statuses
6. Tap any order card and confirm a detail view opens showing order information (items, creation
   time, order number, customer name).
7. Verify that status update action buttons are present in the detail view.
8. Trigger a status change and confirm the order moves to the appropriate tab.

Workflow 3 — Managing Kitchen Queues via Dashboard
9. Navigate to the Dashboard screen and confirm it loads without an error message.
10. Tap the Day, Week, Month, and Year tabs and confirm the displayed data updates for each period.
11. Check the Orders Overview table and verify that all status rows (including Unread and Cancelled)
    reflect real data from the database.
12. Observe the Customer Traffic card and note whether the message reflects actual order volume.

Workflow 4 — Verifying Pickups
13. In the Orders screen, locate an order with a "Ready for Pickup" status in the Open tab.
14. Confirm whether a pickup confirmation action is accessible from the order detail view.
15. If a confirmation action exists, trigger it and verify the order moves to the Finished tab.

Workflow 5 — Handling Order Issues (Special Status Requests)
16. From the navigation drawer, go to Settings and select Special Status Requests.
17. Verify whether a list of pending special status requests is displayed.
18. If requests are present, attempt to approve and deny one, and verify the resulting status changes.

Navigation
19. Tap the hamburger button and confirm the navigation drawer opens with a smooth animation.
20. Tap each drawer menu item and verify it navigates to the correct screen with the active
    item visually highlighted.
21. Tap the backdrop behind the open drawer and confirm the drawer closes correctly.

Expected Results

Workflow 1: Three tabs are visible and selectable; order cards render correctly and are readable;
sort controls reorder the list; an empty-state message appears when no orders exist in a tab.

Workflow 2: Tapping an order card opens a detail view with full order information; status update
controls are present; updating a status moves the order to the correct tab.

Workflow 3: Dashboard loads without errors; period tabs refresh data correctly; all status row
counts in the Overview table reflect live database values; Customer Traffic card displays
contextually accurate information.

Workflow 4: Orders with "Ready for Pickup" status appear in the Open tab; a pickup confirmation
action is accessible; confirmed orders transition to the Finished tab.

Workflow 5: Special Status Requests screen displays a list of pending requests; approve and deny
actions are functional and update request status accordingly.

Navigation: Drawer opens and closes with smooth animation; all menu items route correctly; active
item is visually highlighted; backdrop dismissal works correctly.

Reviewed By
<reviewer(s) fill this part>
*/
