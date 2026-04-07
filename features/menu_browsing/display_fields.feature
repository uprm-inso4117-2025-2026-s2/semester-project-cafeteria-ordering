Feature: Displaying Required Fields

    Scenario: Menu items show required fields
        Given the menu page has finished loading
        When the user views the list of menu items
        Then each item should include a name
        And each item should include a price
        And each item should include an image
        And no item should contain missing or undefined values