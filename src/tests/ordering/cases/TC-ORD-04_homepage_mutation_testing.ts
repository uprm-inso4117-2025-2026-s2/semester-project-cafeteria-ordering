/*
TC-ORD-04: Mutation Testing for Homepage Filtering and Display Logic
Author: Kaysha Pagan

Description
Tests homepage filtering and display logic using mutation testing.
Tests category filtering, search behavior and the logic that combines both filters in the homepage screen.
Mutations are applied to existing homepage logic to verify if incorrect behavior can be detected during validation.

Preconditions
* Application runs correctly.
* Homepage loads correctly
* dummyMenuItems are available
* Original homepage logic is restored before each mutation
*/

//Test Data

// Homepage filtering behavior was tested using the existing menu items available in the application homepage.

/*
Test Steps

. Start application
. Open homepage screen
. Verify normal search and category behavior before mutations
. Apply mutation to homepage filtering or display logic
. Reload application
. Test search bar and category filters
. Record incorrect behavior caused by mutation
. Revert mutation back to original logic
. Repeat process until all 5 mutations are completed

Expected Results

. Homepage should correctly filter menu items using search and category filters
. Incorrect logic mutations should visibly affect homepage behavior
. Mutations should help identify weak points in current validation/testing
. Search and category filters should only display matching items

Notes

- Mutation testing focuses only on homepage logic
- Performance and UI speed are not part of this test
- All mutations are tested independently

Author: Kaysha Pagan
Date Created: 2026-05-16

Reviewed By
<reviewer(s) fill this part>

*/