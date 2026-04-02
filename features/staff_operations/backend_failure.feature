Feature: Backend failures

  Scenario: Staff update fails due to a backend error
    Given an order is currently marked as "pending"
    When the staff member updates the order status
    But the backend update fails
    Then the system should show an error message
    And the order should remain in its previous persisted state