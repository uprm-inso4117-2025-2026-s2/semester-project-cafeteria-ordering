import { strict as assert } from "node:assert";
import React, { useEffect } from "react";
import TestRenderer, { act } from "react-test-renderer";

import { AuthProvider, useAuth } from "../../../../../../../app/authContext";
import { supabase } from "../../../../../../../lib/supabase";

type MockSupabaseUser = {
    id: string;
    email?: string;
    user_metadata?: {
        full_name?: string;
        phone?: string;
    };
};

type MockSession = {
    user: MockSupabaseUser;
} | null;

type AuthStateEvent = "SIGNED_IN" | "SIGNED_OUT" | "USER_UPDATED" | "INITIAL_SESSION";

type Capture = {
    latestUser: { fullName: string; email: string } | null;
    latestLoggedIn: boolean;
};

type MockControl = {
    session: MockSession;
    upsertError: { message: string } | null;
    onAuthStateChangeCallback:
    | ((event: AuthStateEvent, session: MockSession) => void)
    | null;
    unsubscribeCalled: boolean;
    upsertCalls: Array<{
        table: string;
        payload: Record<string, unknown>;
        options: Record<string, unknown> | undefined;
    }>;
};

const flush = async () => {
    await Promise.resolve();
    await Promise.resolve();
};

function createMockControl(): MockControl {
    return {
        session: null,
        upsertError: null,
        onAuthStateChangeCallback: null,
        unsubscribeCalled: false,
        upsertCalls: [],
    };
}

function mockSupabase(control: MockControl) {
    const originalFrom = (supabase as any).from;
    const originalGetSession = (supabase as any).auth.getSession;
    const originalOnAuthStateChange = (supabase as any).auth.onAuthStateChange;

    (supabase as any).from = (table: string) => ({
        upsert: async (
            payload: Record<string, unknown>,
            options?: Record<string, unknown>
        ) => {
            control.upsertCalls.push({ table, payload, options });
            return { error: control.upsertError };
        },
    });

    (supabase as any).auth.getSession = async () => ({
        data: { session: control.session },
    });

    (supabase as any).auth.onAuthStateChange = (
        callback: (event: AuthStateEvent, session: MockSession) => void
    ) => {
        control.onAuthStateChangeCallback = callback;
        return {
            data: {
                subscription: {
                    unsubscribe: () => {
                        control.unsubscribeCalled = true;
                    },
                },
            },
        };
    };

    return () => {
        (supabase as any).from = originalFrom;
        (supabase as any).auth.getSession = originalGetSession;
        (supabase as any).auth.onAuthStateChange = originalOnAuthStateChange;
    };
}

function CaptureConsumer({ capture }: { capture: Capture }) {
    const auth = useAuth();

    useEffect(() => {
        capture.latestUser = auth.user;
        capture.latestLoggedIn = auth.loggedIn;
    }, [auth.user, auth.loggedIn, capture]);

    return null;
}

const sessionUserWithMetadata: MockSupabaseUser = {
    id: "user-123",
    email: "alice@example.com",
    user_metadata: {
        full_name: "Alice Rivera",
        phone: "787-555-0001",
    },
};

const sessionUserWithoutFullName: MockSupabaseUser = {
    id: "user-456",
    email: "bruno@example.com",
    user_metadata: {
        phone: "939-555-9999",
    },
};

async function testInitialSessionSyncSuccess() {
    const control = createMockControl();
    control.session = { user: sessionUserWithMetadata };

    const restore = mockSupabase(control);
    const capture: Capture = { latestUser: null, latestLoggedIn: false };

    try {
        await act(async () => {
            TestRenderer.create(
                <AuthProvider>
                    <CaptureConsumer capture={capture} />
                </AuthProvider>
            );
            await flush();
        });

        assert.equal(control.upsertCalls.length, 1);
        assert.equal(control.upsertCalls[0].table, "profiles");
        assert.deepEqual(control.upsertCalls[0].payload, {
            id: "user-123",
            user_id: "user-123",
            full_name: "Alice Rivera",
            phone: "787-555-0001",
        });
        assert.deepEqual(control.upsertCalls[0].options, { onConflict: "user_id" });

        assert.deepEqual(capture.latestUser, {
            fullName: "Alice Rivera",
            email: "alice@example.com",
        });
        assert.equal(capture.latestLoggedIn, true);

        console.log("Test 1 passed: initial session syncs metadata to profiles");
    } finally {
        restore();
    }
}

async function testInitialSessionFallbackName() {
    const control = createMockControl();
    control.session = { user: sessionUserWithoutFullName };

    const restore = mockSupabase(control);
    const capture: Capture = { latestUser: null, latestLoggedIn: false };

    try {
        await act(async () => {
            TestRenderer.create(
                <AuthProvider>
                    <CaptureConsumer capture={capture} />
                </AuthProvider>
            );
            await flush();
        });

        assert.equal(control.upsertCalls.length, 1);
        assert.deepEqual(control.upsertCalls[0].payload, {
            id: "user-456",
            user_id: "user-456",
            full_name: "bruno",
            phone: "939-555-9999",
        });

        assert.deepEqual(capture.latestUser, {
            fullName: "bruno",
            email: "bruno@example.com",
        });
        assert.equal(capture.latestLoggedIn, true);

        console.log("Test 2 passed: fallback name uses email prefix when metadata is missing");
    } finally {
        restore();
    }
}

async function testSignedInEventTriggersSync() {
    const control = createMockControl();
    control.session = null;

    const restore = mockSupabase(control);
    const capture: Capture = { latestUser: null, latestLoggedIn: false };

    try {
        await act(async () => {
            TestRenderer.create(
                <AuthProvider>
                    <CaptureConsumer capture={capture} />
                </AuthProvider>
            );
            await flush();
        });

        assert.equal(control.upsertCalls.length, 0);
        assert.equal(capture.latestUser, null);
        assert.equal(capture.latestLoggedIn, false);

        await act(async () => {
            control.onAuthStateChangeCallback?.("SIGNED_IN", {
                user: sessionUserWithMetadata,
            });
            await flush();
        });

        assert.equal(control.upsertCalls.length, 1);
        assert.deepEqual(capture.latestUser, {
            fullName: "Alice Rivera",
            email: "alice@example.com",
        });
        assert.equal(capture.latestLoggedIn, true);

        console.log("Test 3 passed: SIGNED_IN event triggers sync and updates auth state");
    } finally {
        restore();
    }
}

async function testUserUpdatedEventTriggersSync() {
    const control = createMockControl();
    control.session = null;

    const restore = mockSupabase(control);
    const capture: Capture = { latestUser: null, latestLoggedIn: false };

    const updatedUser: MockSupabaseUser = {
        id: "user-123",
        email: "alice@example.com",
        user_metadata: {
            full_name: "Alice Updated",
            phone: "787-555-7777",
        },
    };

    try {
        await act(async () => {
            TestRenderer.create(
                <AuthProvider>
                    <CaptureConsumer capture={capture} />
                </AuthProvider>
            );
            await flush();
        });

        await act(async () => {
            control.onAuthStateChangeCallback?.("USER_UPDATED", { user: updatedUser });
            await flush();
        });

        assert.equal(control.upsertCalls.length, 1);
        assert.deepEqual(control.upsertCalls[0].payload, {
            id: "user-123",
            user_id: "user-123",
            full_name: "Alice Updated",
            phone: "787-555-7777",
        });
        assert.deepEqual(capture.latestUser, {
            fullName: "Alice Updated",
            email: "alice@example.com",
        });

        console.log("Test 4 passed: USER_UPDATED event re-syncs updated metadata");
    } finally {
        restore();
    }
}

async function testSyncFailureWarnsButKeepsUserState() {
    const control = createMockControl();
    control.session = { user: sessionUserWithMetadata };
    control.upsertError = { message: "database unavailable" };

    const restore = mockSupabase(control);
    const capture: Capture = { latestUser: null, latestLoggedIn: false };

    const originalWarn = console.warn;
    let warnedMessage = "";

    console.warn = (...args: unknown[]) => {
        warnedMessage = args.map(String).join(" ");
    };

    try {
        await act(async () => {
            TestRenderer.create(
                <AuthProvider>
                    <CaptureConsumer capture={capture} />
                </AuthProvider>
            );
            await flush();
        });

        assert.equal(control.upsertCalls.length, 1);
        assert.ok(
            warnedMessage.includes("Unable to sync profile from auth metadata:")
        );
        assert.ok(warnedMessage.includes("database unavailable"));

        assert.deepEqual(capture.latestUser, {
            fullName: "Alice Rivera",
            email: "alice@example.com",
        });
        assert.equal(capture.latestLoggedIn, true);

        console.log("Test 5 passed: sync failure warns without breaking mapped auth state");
    } finally {
        console.warn = originalWarn;
        restore();
    }
}

async function testSignedOutClearsUserState() {
    const control = createMockControl();
    control.session = { user: sessionUserWithMetadata };

    const restore = mockSupabase(control);
    const capture: Capture = { latestUser: null, latestLoggedIn: false };

    try {
        await act(async () => {
            TestRenderer.create(
                <AuthProvider>
                    <CaptureConsumer capture={capture} />
                </AuthProvider>
            );
            await flush();
        });

        assert.equal(capture.latestLoggedIn, true);

        await act(async () => {
            control.onAuthStateChangeCallback?.("SIGNED_OUT", null);
            await flush();
        });

        assert.equal(capture.latestUser, null);
        assert.equal(capture.latestLoggedIn, false);

        console.log("Test 6 passed: SIGNED_OUT clears auth state");
    } finally {
        restore();
    }
}

async function testUnsubscribeOnUnmount() {
    const control = createMockControl();
    control.session = null;

    const restore = mockSupabase(control);
    const capture: Capture = { latestUser: null, latestLoggedIn: false };

    try {
        let renderer: TestRenderer.ReactTestRenderer;

        await act(async () => {
            renderer = TestRenderer.create(
                <AuthProvider>
                    <CaptureConsumer capture={capture} />
                </AuthProvider>
            );
            await flush();
        });

        await act(async () => {
            renderer!.unmount();
            await flush();
        });

        assert.equal(control.unsubscribeCalled, true);

        console.log("Test 7 passed: auth subscription is unsubscribed on unmount");
    } finally {
        restore();
    }
}

async function main() {
    console.log("Running IT-PROF-01 Integration Tests...");

    await testInitialSessionSyncSuccess();
    await testInitialSessionFallbackName();
    await testSignedInEventTriggersSync();
    await testUserUpdatedEventTriggersSync();
    await testSyncFailureWarnsButKeepsUserState();
    await testSignedOutClearsUserState();
    await testUnsubscribeOnUnmount();

    console.log("\nAll IT-PROF-01 integration tests passed successfully.");
}

main().catch((error) => {
    if (error instanceof Error) {
        console.error(`\nIntegration test failed: ${error.message}`);
        console.error(error.stack);
    } else {
        console.error("\nIntegration test failed:", error);
    }
    process.exit(1);
});
