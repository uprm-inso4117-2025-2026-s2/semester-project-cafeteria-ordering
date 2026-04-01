Feature: Staff updates order status

  Scenario: Staff updates an order from pending to in progress
    Given an order is currently marked as "pending"
    When the staff member changes the order status to "in progress"
    Then the order status should be updated successfully
    And the updated status should be shown in the staff orders table