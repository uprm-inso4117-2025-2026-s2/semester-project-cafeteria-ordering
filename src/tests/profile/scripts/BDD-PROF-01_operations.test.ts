/// <reference types="jest" />


import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import {
  createProfile,
  getProfileByUserId,
  updateProfileName,
  updateProfilePhone,
} from "../../../lib/profiles";



const mockSingle = jest.fn();
const mockMaybeSingle = jest.fn();

function buildMockClient() {
  return {
    from: () => ({
      insert: () => ({ select: () => ({ single: mockSingle }) }),
      select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: mockSingle }) }) }),
      delete: () => ({ eq: () => ({}) }),
    }),
  };
}



function givenSupabaseReturns(data: object) {
  mockSingle.mockResolvedValue({ data, error: null });
  mockMaybeSingle.mockResolvedValue({ data, error: null });
}

function givenSupabaseReturnsNull() {
  mockMaybeSingle.mockResolvedValue({ data: null, error: null });
}

function givenSupabaseReturnsError(message: string) {
  const err = { message };
  mockSingle.mockResolvedValue({ data: null, error: err });
  mockMaybeSingle.mockResolvedValue({ data: null, error: err });
}


let client: ReturnType<typeof buildMockClient>;

beforeEach(() => {
  jest.clearAllMocks();
  client = buildMockClient();
});



describe("BDD: Fetch User Profile", () => {

  test(`Given a profile exists for user-bdd-01
    When getProfileByUserId is called
    Then it returns the profile with correct fields`, async () => {

    // Given
    givenSupabaseReturns({
      user_id: "user-bdd-01",
      full_name: "Kevin Lara",
      phone: "787-555-0001",
    });

    // When
    const result = await getProfileByUserId("user-bdd-01", client);

    // Then
    expect(result).not.toBeNull();
    expect(result?.full_name).toBe("Kevin Lara");
    expect(result?.phone).toBe("787-555-0001");
  });

  test(`Given no profile exists for user-ghost
    When getProfileByUserId is called
    Then it returns null without throwing`, async () => {

    // Given
    givenSupabaseReturnsNull();

    // When
    let result;
    let threw = false;
    try {
      result = await getProfileByUserId("user-ghost", client);
    } catch {
      threw = true;
    }

    // Then
    expect(threw).toBe(false);
    expect(result).toBeNull();
  });

  test(`Given Supabase returns an error on fetch
    When getProfileByUserId is called
    Then it throws an error containing "Error finding profile"`, async () => {

    // Given
    givenSupabaseReturnsError("connection refused");

    // When / Then
    await expect(
      getProfileByUserId("user-any", client)
    ).rejects.toThrow("Error finding profile");
  });
});


describe("BDD: Create Profile on Signup", () => {

  test(`Given a new student authenticated with user-bdd-new
    When createProfile is called
    Then the returned record contains the correct user_id and full_name`, async () => {

    // Given
    givenSupabaseReturns({
      user_id: "user-bdd-new",
      full_name: "New Student",
    });

    // When
    const result = await createProfile(
      { user_id: "user-bdd-new", full_name: "New Student" },
      client
    );

    // Then
    expect(result).not.toBeNull();
    expect(result?.user_id).toBe("user-bdd-new");
    expect(result?.full_name).toBe("New Student");
  });

  test(`Given a profile already exists for user-bdd-dup
    When createProfile is called again with the same user_id
    Then it throws an error containing "Error creating profile"`, async () => {

    // Given
    givenSupabaseReturnsError("duplicate key value violates unique constraint");

    // When / Then
    await expect(
      createProfile({ user_id: "user-bdd-dup" }, client)
    ).rejects.toThrow("Error creating profile");
  });
});


describe("BDD: Update Profile Name", () => {

  test(`Given a profile exists for user-bdd-02
    When updateProfileName is called with "New Name"
    Then the returned record has full_name "New Name"`, async () => {

    // Given
    givenSupabaseReturns({
      user_id: "user-bdd-02",
      full_name: "New Name",
      phone: "787-000-0000",
    });

    // When
    const result = await updateProfileName("user-bdd-02", "New Name", client);

    // Then
    expect(result).not.toBeNull();
    expect(result?.full_name).toBe("New Name");
  });

  test(`Given a profile for user-bdd-03 has phone "787-000-1111"
    When updateProfileName is called
    Then full_name is updated and phone is unchanged`, async () => {

    // Given
    givenSupabaseReturns({
      user_id: "user-bdd-03",
      full_name: "Kevin Updated",
      phone: "787-000-1111",
    });

    // When
    const result = await updateProfileName("user-bdd-03", "Kevin Updated", client);

    // Then
    expect(result?.full_name).toBe("Kevin Updated");
    expect(result?.phone).toBe("787-000-1111");
  });

  test(`Given Supabase returns an error on update
    When updateProfileName is called
    Then it throws an error containing "Error updating name"`, async () => {

    // Given
    givenSupabaseReturnsError("update failed");

    // When / Then
    await expect(
      updateProfileName("user-any", "Any Name", client)
    ).rejects.toThrow("Error updating name");
  });
});

describe("BDD: Update Profile Phone", () => {

  test(`Given a profile exists for user-bdd-04 with phone "787-000-0000"
    When updateProfilePhone is called with "787-999-9999"
    Then the returned record has phone "787-999-9999"`, async () => {

    // Given
    givenSupabaseReturns({
      user_id: "user-bdd-04",
      full_name: "Pedro",
      phone: "787-999-9999",
    });

    // When
    const result = await updateProfilePhone("user-bdd-04", "787-999-9999", client);

    // Then
    expect(result).not.toBeNull();
    expect(result?.phone).toBe("787-999-9999");
  });

  test(`Given a profile for user-bdd-05 has full_name "Pedro"
    When updateProfilePhone is called
    Then phone is updated and full_name is unchanged`, async () => {

    // Given
    givenSupabaseReturns({
      user_id: "user-bdd-05",
      full_name: "Pedro",
      phone: "787-111-3333",
    });

    // When
    const result = await updateProfilePhone("user-bdd-05", "787-111-3333", client);

    // Then
    expect(result?.phone).toBe("787-111-3333");
    expect(result?.full_name).toBe("Pedro");
  });

  test(`Given Supabase returns an error on update
    When updateProfilePhone is called
    Then it throws an error containing "Error updating phone"`, async () => {

    // Given
    givenSupabaseReturnsError("update failed");

    // When / Then
    await expect(
      updateProfilePhone("user-any", "787-000-0000", client)
    ).rejects.toThrow("Error updating phone");
  });
});