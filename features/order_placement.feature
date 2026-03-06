Feature: Order Placement

    Scenario: Successful order placement
        Given the user is logged in
        And the user is on the menu page
        When the user selects "Pollo Asado" with sides "Arroz Blanco" and "Habichuelas"
        And the user clicks "Add to Cart" button
        And the user proceeds to checkout with "ASAP" pickup time
        And the user completes the payment process
        Then the system should confirm the order
        And the cafeteria staff should be notified of the new order
        And the user should receive an order confirmation message