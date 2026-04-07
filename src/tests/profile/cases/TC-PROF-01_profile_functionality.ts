/*
 * ============================================================================
 * TEST CASE: TC-PROF-01 - Profile Functionality Unit Tests
 * ============================================================================
 *
 * @id TC-PROF-01
 * @author Kevin J. Lara-Rodriguez
 * @date 2026-04-02
 *
 * ============================================================================
 * @description
 * Verify that profile-related logic in src/lib/profiles.ts works correctly at the
 * unit level. This test case validates profile creation, lookup, updates, and
 * deletion, as well as expected error handling when Supabase operations fail.
 *
 * ============================================================================
 * @preconditions
 * - The file src/lib/profiles.ts exists and exports:
 *   - createProfile
 *   - getProfileByUserId
 *   - updateProfileName
 *   - updateProfilePhone
 *   - deleteProfile
 * - The file src/lib/supabase.ts exists and exports the supabase client object.
 * - The test script can mock supabase.from(...) behavior.
 *
 * ============================================================================
 * @test_data
 */

export interface TestProfile {
    id?: string;
    user_id: string;
    student_id?: string;
    full_name?: string;
    phone?: string;
    role?: string;
    expo_push_token?: string;
    created_at?: string;
    updated_at?: string;
}

export const validProfile: TestProfile = {
    id: "prof-001",
    user_id: "user-123",
    student_id: "802000001",
    full_name: "Kevin Lara",
    phone: "787-555-1234",
    role: "student",
    expo_push_token: "expo-token-123",
    created_at: "2026-04-02T10:00:00.000Z",
    updated_at: "2026-04-02T10:00:00.000Z",
};

export const updatedNameProfile: TestProfile = {
    ...validProfile,
    full_name: "Kevin J. Lara-Rodriguez",
};

export const updatedPhoneProfile: TestProfile = {
    ...validProfile,
    phone: "939-555-9876",
};

export const testUserId = "user-123";
export const updatedName = "Kevin J. Lara-Rodriguez";
export const updatedPhone = "939-555-9876";

export const supabaseErrorMessage = "database failure";

/*
 * ============================================================================
 * @test_steps
 *
 * 1. Call createProfile() with valid profile data.
 *    Expected: returns inserted profile data and uses the "profiles" table.
 *
 * 2. Call createProfile() when Supabase insert returns an error.
 *    Expected: throws "Error creating profile: <message>".
 *
 * 3. Call getProfileByUserId() with a valid user ID.
 *    Expected: returns the matching profile and queries by user_id.
 *
 * 4. Call getProfileByUserId() when Supabase select returns an error.
 *    Expected: throws "Error finding profile: <message>".
 *
 * 5. Call updateProfileName() with valid user ID and name.
 *    Expected: returns updated profile and updates full_name.
 *
 * 6. Call updateProfileName() when Supabase update returns an error.
 *    Expected: throws "Error updating name: <message>".
 *
 * 7. Call updateProfilePhone() with valid user ID and phone.
 *    Expected: returns updated profile and updates phone.
 *
 * 8. Call updateProfilePhone() when Supabase update returns an error.
 *    Expected: throws "Error updating phone: <message>".
 *
 * 9. Call deleteProfile() with valid user ID.
 *    Expected: returns { success: true } and deletes by user_id.
 *
 * 10. Call deleteProfile() when Supabase delete returns an error.
 *     Expected: throws "Error deleting profile: <message>".
 *
 * ============================================================================
 * @expected_results
 *
 * - Profile CRUD helper functions behave correctly under success conditions.
 * - Each function targets the "profiles" table.
 * - Each function uses the correct fields and filters (especially user_id).
 * - Each function throws the expected error message when Supabase fails.
 *
 * ============================================================================
 * @reviewed_by
 * <reviewer(s)>
 */
