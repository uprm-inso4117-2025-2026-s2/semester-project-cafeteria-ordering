Feature: Invalid transitions

  Scenario: Staff attempts an invalid status transition
    Given an order is already marked as "completed"
    When the staff member attempts to change the order status to "in progress"
    Then the system should reject the update
    And an appropriate validation message should be shown