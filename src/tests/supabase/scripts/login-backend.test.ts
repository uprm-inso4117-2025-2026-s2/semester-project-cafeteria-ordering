import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { loginWithEmailPassword, logout } from '../../../lib/auth';
import {
  getLoginBackendEnvValues,
  TC_SUPA_03_TEST_DATA,
} from '../cases/TC-SUPA-03_login_backend_validation';

dotenv.config();

function requiredEnv(name: string, providedValue?: string): string {
  const value = providedValue?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function run(): Promise<void> {
  const envValues = getLoginBackendEnvValues();
  const supabaseUrl = requiredEnv(TC_SUPA_03_TEST_DATA.env.urlVarName, envValues.supabaseUrl);
  const supabaseAnonKey = requiredEnv(TC_SUPA_03_TEST_DATA.env.anonKeyVarName, envValues.supabaseAnonKey);
  const testEmail = requiredEnv(TC_SUPA_03_TEST_DATA.env.loginEmailVarName, envValues.testEmail);
  const testPassword = requiredEnv(TC_SUPA_03_TEST_DATA.env.loginPasswordVarName, envValues.testPassword);

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  console.log('\n[TEST] Backend Login Flow\n');

  console.log('[1/3] Attempting login with test credentials...');
  const loginResult = await loginWithEmailPassword(client, testEmail, testPassword);
  console.log('[PASS] Login successful');
  console.log(`   userId: ${loginResult.userId}`);
  console.log(`   email: ${loginResult.email ?? '(none)'}`);

  console.log('\n[2/3] Verifying active session...');
  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession();

  if (sessionError) {
    throw new Error(`Failed to verify session: ${sessionError.message}`);
  }

  if (!session) {
    throw new Error('Session was not created after successful login.');
  }
  console.log('[PASS] Session is active');

  console.log('\n[3/3] Signing out and validating cleanup...');
  await logout(client);

  const {
    data: { session: sessionAfterLogout },
    error: postLogoutError,
  } = await client.auth.getSession();

  if (postLogoutError) {
    throw new Error(`Failed to read session after logout: ${postLogoutError.message}`);
  }

  if (sessionAfterLogout) {
    throw new Error('Session still exists after logout.');
  }

  console.log('[PASS] Logout successful and session cleared');
  console.log('\n[SUCCESS] Backend login logic is working correctly.\n');
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('\n[FAIL] Backend login test failed');
  console.error(`   ${message}\n`);
  process.exit(1);
});
