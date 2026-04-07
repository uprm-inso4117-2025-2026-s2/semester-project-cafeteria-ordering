Feature: Displaying item detail page

    Scenario: Selecting a menu item displayed its details and interaction options
        Given the user is viewing the list of menu items
        When the user taps on a specific menu item
        Then the system should navigate to or display the item detail view
        And the item detail view should display the item image
        And the item detail view should display the item name
        And the item detail view should display the item description
        And the item detail view should display the item price
        And the item detail view should include "+" and "-" buttons to adjust quantity
        And the default quantity should be set to 1
        And the item detail view should include selectable add-on options
        And the item detail view should include an "Add to Cart" button
        And all displayed information should correspond to the selected item