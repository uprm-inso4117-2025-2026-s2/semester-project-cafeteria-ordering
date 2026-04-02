Feature: Staff cancels orders

  Scenario: Staff cancels an eligible order
    Given an order is in a cancellable state
    When the staff member cancels the order
    Then the order should be marked as cancelled
    And the staff orders table should reflect the cancellation