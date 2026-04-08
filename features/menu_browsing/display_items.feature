Feature: Displaying menu items

    Scenario: Menu items are displayed on load
        Given the application is running
        And menu data is available
        When the user navigates to the menu page
        Then a list of menu items should be visible
        And the list should contain at least one item
        And the items should be arranged in a scrollable layout