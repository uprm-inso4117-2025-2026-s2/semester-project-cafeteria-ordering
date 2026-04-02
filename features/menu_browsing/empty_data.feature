Feature: Handling empty data set

    Scenario: Menu page displays empty state
        Given the menu dataset it empty
        When the user opens the menu page
        Then the system should display an empty state message
        And the interface should not display broken or incomplete components