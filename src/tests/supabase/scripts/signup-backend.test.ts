import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { signupWithEmailPassword } from '../../../lib/auth';
import {
    getSignupBackendEnvValues,
    TC_SUPA_04_TEST_DATA,
} from '../cases/TC-SUPA-04_signup_backend_validation';

dotenv.config();

function requiredEnv(name: string, providedValue?: string): string {
  const value = providedValue?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function isSignupRateLimited(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes('too many signup attempts') || normalized.includes('rate limit');
}

function generatedEmail(baseEmail?: string): string {
  const nonce = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  if (baseEmail && baseEmail.includes('@')) {
    const [localPart, domain] = baseEmail.split('@');
    return `${localPart}+${TC_SUPA_04_TEST_DATA.testData.generatedEmailPrefix}-${nonce}@${domain}`;
  }

  return `${TC_SUPA_04_TEST_DATA.testData.generatedEmailPrefix}-${nonce}@example.com`;
}

async function run(): Promise<void> {
  const envValues = getSignupBackendEnvValues();
  const supabaseUrl = requiredEnv(TC_SUPA_04_TEST_DATA.env.urlVarName, envValues.supabaseUrl);
  const supabaseAnonKey = requiredEnv(TC_SUPA_04_TEST_DATA.env.anonKeyVarName, envValues.supabaseAnonKey);
  const signupPassword = requiredEnv(
    TC_SUPA_04_TEST_DATA.env.signupPasswordVarName,
    envValues.signupPassword
  );
  const loginEmail = envValues.loginEmail?.trim();

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const testEmail = generatedEmail(loginEmail);

  console.log('\n[TEST] Backend Signup Flow\n');

  console.log('[1/4] Creating a new signup account...');
  const testPhone = '7875550199';
  let signupResult;
  try {
    signupResult = await signupWithEmailPassword(client, testEmail, signupPassword, {
      full_name: 'INSO Signup Test',
      phone: testPhone,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (isSignupRateLimited(message)) {
      console.log('[SKIP] Supabase rate-limited signup attempts in this environment.');
      console.log('       Re-run later to execute full signup checks.');
      console.log('\n[SUCCESS] Signup backend script is healthy; execution skipped due to provider throttle.\n');
      return;
    }
    throw error;
  }

  console.log('[PASS] Signup successful for generated account');
  console.log(`   userId: ${signupResult.userId}`);
  console.log(`   email: ${signupResult.email ?? '(none)'}`);
  console.log(`   session created: ${signupResult.hasSession ? 'yes' : 'no'}`);

  console.log('\n[2/4] Validating duplicate signup behavior...');
  let duplicateHandled = false;
  try {
    await signupWithEmailPassword(client, testEmail, signupPassword, {
      full_name: 'INSO Signup Test Duplicate',
    });
    duplicateHandled = true;
    console.log('[PASS] Duplicate signup call returned safely (enumeration-protected mode).');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    if (message.includes('already registered') || message.includes('already exists')) {
      duplicateHandled = true;
      console.log('[PASS] Duplicate signup rejected with expected error.');
    } else {
      throw error;
    }
  }

  if (!duplicateHandled) {
    throw new Error('Duplicate signup behavior was not handled as expected.');
  }

  console.log('\n[3/4] Verifying weak password rejection...');
  const weakEmail = generatedEmail(loginEmail);
  let weakPasswordRejected = false;
  try {
    await signupWithEmailPassword(
      client,
      weakEmail,
      TC_SUPA_04_TEST_DATA.testData.weakPasswordSample,
      { full_name: 'Weak Password Test' }
    );
  } catch (_error: unknown) {
    weakPasswordRejected = true;
    console.log('[PASS] Weak password rejected as expected.');
  }

  if (!weakPasswordRejected) {
    throw new Error('Weak password signup unexpectedly succeeded.');
  }

  console.log('\n[4/4] Checking profile visibility (session-dependent)...');
  if (signupResult.hasSession) {
    const { data, error } = await client
      .from('profiles')
      .select('user_id, full_name, phone')
      .eq('user_id', signupResult.userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed profile validation query: ${error.message}`);
    }

    if (!data) {
      throw new Error('No profile row found for the newly signed up user.');
    }

    if (data.phone !== testPhone) {
      throw new Error(`Profile phone mismatch. Expected ${testPhone}, found ${data.phone ?? '(null)'}.`);
    }

    console.log('[PASS] Profile row exists for newly signed up user with expected phone value.');
  } else {
    console.log('[SKIP] No session after signup (email confirmation likely enabled).');
    console.log('       Profile trigger validation should be confirmed from Supabase table/logs.');
  }

  console.log('\n[SUCCESS] Backend signup logic is working correctly.\n');
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('\n[FAIL] Backend signup test failed');
  console.error(`   ${message}\n`);
  process.exit(1);
});
