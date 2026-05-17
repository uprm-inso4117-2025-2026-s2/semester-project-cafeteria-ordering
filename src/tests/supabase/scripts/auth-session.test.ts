/**
 * Supabase Auth Session Creation Test
 *
 * Purpose:
 * - Confirm that authentication creates a Supabase session (access_token + user)
 * - Confirm session can be retrieved via getSession()
 * - Confirm signOut clears the session
 *
 * Run:
 *   npx tsx src/tests/supabase/scripts/auth-session.test.ts
 *
 * Requires .env:
 * - EXPO_PUBLIC_SUPABASE_URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY
 * - SUPABASE_TEST_LOGIN_EMAIL
 * - SUPABASE_TEST_LOGIN_PASSWORD
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

type StepResult = {
  name: string;
  passed: boolean;
  message: string;
  error?: unknown;
};

function requireEnvValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

async function step(name: string, fn: () => Promise<string>): Promise<StepResult> {
  try {
    const message = await fn();
    return { name, passed: true, message };
  } catch (error: any) {
    return {
      name,
      passed: false,
      message: error?.message ?? 'Unknown error',
      error,
    };
  }
}

async function main() {
  console.log('\n[TEST] Supabase Auth Session Creation\n');

  const results: StepResult[] = [];

  const supabaseUrlRaw = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKeyRaw = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const emailRaw = process.env.SUPABASE_TEST_LOGIN_EMAIL;
  const passwordRaw = process.env.SUPABASE_TEST_LOGIN_PASSWORD;

  const envCheck = await step('Environment variables', async () => {
    // Supabase
    requireEnvValue(supabaseUrlRaw, 'EXPO_PUBLIC_SUPABASE_URL');
    requireEnvValue(supabaseAnonKeyRaw, 'EXPO_PUBLIC_SUPABASE_ANON_KEY');

    // Test user
    requireEnvValue(emailRaw, 'SUPABASE_TEST_LOGIN_EMAIL');
    requireEnvValue(passwordRaw, 'SUPABASE_TEST_LOGIN_PASSWORD');

    return 'Required env vars present';
  });
  results.push(envCheck);

  if (!envCheck.passed) {
    console.log('[FAIL] Environment is not configured.');
    console.log('Add these to your .env (see .env.example):');
    console.log('- EXPO_PUBLIC_SUPABASE_URL');
    console.log('- EXPO_PUBLIC_SUPABASE_ANON_KEY');
    console.log('- SUPABASE_TEST_LOGIN_EMAIL');
    console.log('- SUPABASE_TEST_LOGIN_PASSWORD');
    process.exit(1);
  }

  const supabaseUrl = requireEnvValue(supabaseUrlRaw, 'EXPO_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = requireEnvValue(
    supabaseAnonKeyRaw,
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  );
  const email = requireEnvValue(emailRaw, 'SUPABASE_TEST_LOGIN_EMAIL');
  const password = requireEnvValue(passwordRaw, 'SUPABASE_TEST_LOGIN_PASSWORD');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  results.push(
    await step('Initial signOut (clean slate)', async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return 'Signed out (or no session existed)';
    }),
  );

  results.push(
    await step('signInWithPassword creates session', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (!data.session) {
        throw new Error('No session returned from signInWithPassword');
      }
      if (!data.session.access_token) {
        throw new Error('Session missing access_token');
      }
      if (!data.user) {
        throw new Error('No user returned from signInWithPassword');
      }

      return `Session created for ${data.user.email ?? '(no email)'}`;
    }),
  );

  results.push(
    await step('getSession returns active session', async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) {
        throw new Error('Expected an active session, got null');
      }

      return `Active session user_id=${session.user.id}`;
    }),
  );

  results.push(
    await step('getUser resolves authenticated user', async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!data.user) {
        throw new Error('Expected getUser() to return a user');
      }
      return `getUser() ok: ${data.user.email ?? '(no email)'}`;
    }),
  );

  results.push(
    await step('Optional: refreshSession (if supported)', async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;
      if (!session) {
        throw new Error('No active session to refresh');
      }

      // Some projects/configs may not return refresh_token depending on settings.
      if (!session.refresh_token) {
        return 'Skipped: no refresh_token present on session';
      }

      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;
      if (!refreshed.session?.access_token) {
        throw new Error('refreshSession did not return a valid session');
      }

      return 'refreshSession ok';
    }),
  );

  results.push(
    await step('signOut clears session', async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        throw new Error('Expected no session after signOut, but session still exists');
      }

      return 'Session cleared';
    }),
  );

  for (const r of results) {
    console.log(`${r.passed ? '[PASS]' : '[FAIL]'} ${r.name}`);
    console.log(`   ${r.message}`);
    if (r.error) console.error('   Error:', r.error);
  }

  const passed = results.filter(r => r.passed).length;
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[SUMMARY] ${passed}/${results.length} steps passed`);

  if (passed !== results.length) {
    process.exit(1);
  }

  console.log('[SUCCESS] Auth session creation verified.\n');
}

main().catch(err => {
  console.error('\n[FATAL]', err);
  process.exit(1);
});
