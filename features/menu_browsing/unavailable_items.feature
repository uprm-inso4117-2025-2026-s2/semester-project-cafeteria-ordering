Feature: Manage unavailable items

  Scenario: Unavailable item cannot be added to cart
    Given the user is viewing the menu items
    And a specific item is marked as unavailable
    When the user selects that item
    Then the item detail view should be displayed
    And the item should be clearly labeled as unavailable
    And the "Add to Cart" button should be disabled
    And the button should display "Unavailable"
    And the user should not be able to add the item to the cart
