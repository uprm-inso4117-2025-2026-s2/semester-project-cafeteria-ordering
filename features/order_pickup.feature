Feature: Order Pickup

    Scenario: User picks up an order
        Given the user has placed an order
        When the user goes to the pickup area
        And  the order is ready for pickup
        And the user clicks "Pick Up Order" button
        And the user shall see their order unique code
        And the staff validates the code in the system
        Then the user shall receive a confirmation message "Order picked up successfully"
        And the system shall mark the order as "picked up" in the database
