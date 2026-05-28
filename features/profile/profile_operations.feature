Feature: Profile Operations

  Scenario: Fetching an existing profile by user ID
    Given a profile exists for user "user-bdd-01" with name "Kevin Lara" and phone "787-555-0001"
    When the system fetches the profile for user "user-bdd-01"
    Then the profile should not be null
    And the profile name should be "Kevin Lara"
    And the profile phone should be "787-555-0001"

  Scenario: Returning null when a profile does not exist
    Given no profile exists for user "user-ghost"
    When the system fetches the profile for user "user-ghost"
    Then the profile should be null
    And no error should be thrown

  Scenario: Creating a new profile on signup
    Given a new student has authenticated with user ID "user-bdd-new"
    When a profile is created with user ID "user-bdd-new" and name "New Student"
    Then the created profile should not be null
    And the created profile user ID should be "user-bdd-new"
    And the created profile name should be "New Student"

  Scenario: Handling a duplicate profile creation gracefully
    Given a profile already exists for user "user-bdd-dup"
    When a profile is created again for user "user-bdd-dup"
    Then the system should throw an error

  Scenario: Updating a profile name successfully
    Given a profile exists for user "user-bdd-02" with name "Old Name"
    When the profile name for user "user-bdd-02" is updated to "New Name"
    Then the updated profile should not be null
    And the updated profile name should be "New Name"

  Scenario: Updating a name does not affect the phone number
    Given a profile exists for user "user-bdd-03" with name "Kevin" and phone "787-000-1111"
    When the profile name for user "user-bdd-03" is updated to "Kevin Updated"
    Then the updated profile name should be "Kevin Updated"
    And the updated profile phone should still be "787-000-1111"

  Scenario: Updating a profile phone number successfully
    Given a profile exists for user "user-bdd-04" with phone "787-000-0000"
    When the profile phone for user "user-bdd-04" is updated to "787-999-9999"
    Then the updated profile should not be null
    And the updated profile phone should be "787-999-9999"

  Scenario: Updating a phone number does not affect the name
    Given a profile exists for user "user-bdd-05" with name "Pedro" and phone "787-000-2222"
    When the profile phone for user "user-bdd-05" is updated to "787-111-3333"
    Then the updated profile phone should be "787-111-3333"
    And the updated profile name should still be "Pedro"

  Scenario: Handling a Supabase error when fetching a profile
    Given Supabase returns an error for any profile fetch
    When the system attempts to fetch any profile
    Then the system should throw an error

  Scenario: Handling a Supabase error when updating a profile name
    Given Supabase returns an error for any profile update
    When the system attempts to update any profile name
    Then the system should throw an error

  Scenario: Handling a Supabase error when updating a profile phone
    Given Supabase returns an error for any profile update
    When the system attempts to update any profile phone
    Then the system should throw an error
