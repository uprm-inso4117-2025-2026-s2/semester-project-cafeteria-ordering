import { strict as assert } from "node:assert";
import {
    supabaseErrorMessage,
    testUserId,
    updatedName,
    updatedNameProfile,
    updatedPhone,
    updatedPhoneProfile,
    validProfile,
} from "../cases/TC-PROF-01_profile_functionality";

type QueryResult = {
    data?: any;
    error?: { message: string } | null;
};

type CallTracker = {
    table?: string;
    insertArg?: any;
    selectArg?: any;
    eqArg?: { column: string; value: any };
    updateArg?: any;
    deleteCalled?: boolean;
};

async function main() {
    const {
        createProfile,
        getProfileByUserId,
        updateProfileName,
        updateProfilePhone,
        deleteProfile,
    } = await import("../../../lib/profiles");

    function resetCalls(): CallTracker {
        return {};
    }

    function mockCreateProfile(result: QueryResult, calls: CallTracker) {
        return {
            from: (table: string) => {
                calls.table = table;
                return {
                    insert: (arg: any) => {
                        calls.insertArg = arg;
                        return {
                            select: () => ({
                                single: async () => result,
                            }),
                        };
                    },
                };
            },
        };
    }

    function mockGetProfile(result: QueryResult, calls: CallTracker) {
        return {
            from: (table: string) => {
                calls.table = table;
                return {
                    select: (arg: any) => {
                        calls.selectArg = arg;
                        return {
                            eq: (column: string, value: any) => {
                                calls.eqArg = { column, value };
                                return {
                                    maybeSingle: async () => result,
                                };
                            },
                        };
                    },
                };
            },
        };
    }

    function mockUpdateProfile(result: QueryResult, calls: CallTracker) {
        return {
            from: (table: string) => {
                calls.table = table;
                return {
                    update: (arg: any) => {
                        calls.updateArg = arg;
                        return {
                            eq: (column: string, value: any) => {
                                calls.eqArg = { column, value };
                                return {
                                    select: () => ({
                                        single: async () => result,
                                    }),
                                };
                            },
                        };
                    },
                };
            },
        };
    }

    function mockDeleteProfile(result: QueryResult, calls: CallTracker) {
        return {
            from: (table: string) => {
                calls.table = table;
                return {
                    delete: () => {
                        calls.deleteCalled = true;
                        return {
                            eq: async (column: string, value: any) => {
                                calls.eqArg = { column, value };
                                return result;
                            },
                        };
                    },
                };
            },
        };
    }

    console.log("Running TC-PROF-01 Unit Tests...");

    async function testCreateProfileSuccess() {
        const calls = resetCalls();
        const client = mockCreateProfile({ data: validProfile, error: null }, calls);

        const result = await createProfile(validProfile as any, client);

        assert.equal(calls.table, "profiles");
        assert.deepEqual(calls.insertArg, [validProfile]);
        assert.deepEqual(result, validProfile);
        console.log("Test 1 passed: createProfile() success");
    }

    async function testCreateProfileFailure() {
        const calls = resetCalls();
        const client = mockCreateProfile(
            { data: null, error: { message: supabaseErrorMessage } },
            calls
        );

        await assert.rejects(async () => await createProfile(validProfile as any, client), {
            message: `Error creating profile: ${supabaseErrorMessage}`,
        });

        assert.equal(calls.table, "profiles");
        console.log("Test 2 passed: createProfile() failure");
    }

    async function testGetProfileByUserIdSuccess() {
        const calls = resetCalls();
        const client = mockGetProfile({ data: validProfile, error: null }, calls);

        const result = await getProfileByUserId(testUserId, client);

        assert.equal(calls.table, "profiles");
        assert.equal(calls.selectArg, "*");
        assert.deepEqual(calls.eqArg, { column: "user_id", value: testUserId });
        assert.deepEqual(result, validProfile);
        console.log("Test 3 passed: getProfileByUserId() success");
    }

    async function testGetProfileByUserIdFailure() {
        const calls = resetCalls();
        const client = mockGetProfile(
            { data: null, error: { message: supabaseErrorMessage } },
            calls
        );

        await assert.rejects(async () => await getProfileByUserId(testUserId, client), {
            message: `Error finding profile: ${supabaseErrorMessage}`,
        });

        assert.equal(calls.table, "profiles");
        console.log("Test 4 passed: getProfileByUserId() failure");
    }

    async function testUpdateProfileNameSuccess() {
        const calls = resetCalls();
        const client = mockUpdateProfile({ data: updatedNameProfile, error: null }, calls);

        const result = await updateProfileName(testUserId, updatedName, client);

        assert.equal(calls.table, "profiles");
        assert.deepEqual(calls.updateArg, { full_name: updatedName });
        assert.deepEqual(calls.eqArg, { column: "user_id", value: testUserId });
        assert.deepEqual(result, updatedNameProfile);
        console.log("Test 5 passed: updateProfileName() success");
    }

    async function testUpdateProfileNameFailure() {
        const calls = resetCalls();
        const client = mockUpdateProfile(
            { data: null, error: { message: supabaseErrorMessage } },
            calls
        );

        await assert.rejects(async () => await updateProfileName(testUserId, updatedName, client), {
            message: `Error updating name: ${supabaseErrorMessage}`,
        });

        assert.equal(calls.table, "profiles");
        console.log("Test 6 passed: updateProfileName() failure");
    }

    async function testUpdateProfilePhoneSuccess() {
        const calls = resetCalls();
        const client = mockUpdateProfile({ data: updatedPhoneProfile, error: null }, calls);

        const result = await updateProfilePhone(testUserId, updatedPhone, client);

        assert.equal(calls.table, "profiles");
        assert.deepEqual(calls.updateArg, { phone: updatedPhone });
        assert.deepEqual(calls.eqArg, { column: "user_id", value: testUserId });
        assert.deepEqual(result, updatedPhoneProfile);
        console.log("Test 7 passed: updateProfilePhone() success");
    }

    async function testUpdateProfilePhoneFailure() {
        const calls = resetCalls();
        const client = mockUpdateProfile(
            { data: null, error: { message: supabaseErrorMessage } },
            calls
        );

        await assert.rejects(async () => await updateProfilePhone(testUserId, updatedPhone, client), {
            message: `Error updating phone: ${supabaseErrorMessage}`,
        });

        assert.equal(calls.table, "profiles");
        console.log("Test 8 passed: updateProfilePhone() failure");
    }

    async function testDeleteProfileSuccess() {
        const calls = resetCalls();
        const client = mockDeleteProfile({ error: null }, calls);

        const result = await deleteProfile(testUserId, client);

        assert.equal(calls.table, "profiles");
        assert.equal(calls.deleteCalled, true);
        assert.deepEqual(calls.eqArg, { column: "user_id", value: testUserId });
        assert.deepEqual(result, { success: true });
        console.log("Test 9 passed: deleteProfile() success");
    }

    async function testDeleteProfileFailure() {
        const calls = resetCalls();
        const client = mockDeleteProfile({ error: { message: supabaseErrorMessage } }, calls);

        await assert.rejects(async () => await deleteProfile(testUserId, client), {
            message: `Error deleting profile: ${supabaseErrorMessage}`,
        });

        assert.equal(calls.table, "profiles");
        console.log("Test 10 passed: deleteProfile() failure");
    }

    try {
        await testCreateProfileSuccess();
        await testCreateProfileFailure();
        await testGetProfileByUserIdSuccess();
        await testGetProfileByUserIdFailure();
        await testUpdateProfileNameSuccess();
        await testUpdateProfileNameFailure();
        await testUpdateProfilePhoneSuccess();
        await testUpdateProfilePhoneFailure();
        await testDeleteProfileSuccess();
        await testDeleteProfileFailure();

        console.log("\nAll TC-PROF-01 unit tests passed successfully.");
    } catch (error) {
        if (error instanceof Error) {
            console.error("\nTest failed:", error.message);
            console.error(error.stack);
        } else {
            console.error("\nTest failed:", error);
        }
        process.exit(1);
    }
}

main();
