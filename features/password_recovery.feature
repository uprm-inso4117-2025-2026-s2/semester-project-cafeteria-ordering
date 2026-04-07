Feature: Password Recovery

  Scenario: User requests password recovery link
    Given the user is on the forgot password page
    When the user enters their email address
    And submits the recovery request
    Then the system should send a recovery link to the email
    And display a confirmation message

  Scenario: User resets password successfully
    Given the user has received a recovery link
    When the user enters a new password
    And confirms the new password
    And submits the reset request
    Then the password should be updated
    And the user should be redirected to login