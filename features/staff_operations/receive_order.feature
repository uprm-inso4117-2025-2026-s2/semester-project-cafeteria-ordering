Feature: Staff receives orders

  Scenario: Staff receives a newly placed order
    Given a customer has placed a new order
    When the staff member opens the staff orders view
    Then the new order should appear in the pending orders list