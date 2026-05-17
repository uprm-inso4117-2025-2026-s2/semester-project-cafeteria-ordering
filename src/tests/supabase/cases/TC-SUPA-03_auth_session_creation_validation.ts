/*
Supabase Auth Session Creation Validation TC
Author: Luis J.

Description
Validate that an authentication event produces a usable session in Supabase JS,
that the session is retrievable with getSession(), and that signOut clears it.
Test type: Integration / Smoke

Preconditions
* `.env` exists with valid Supabase credentials.
* `.env` includes a confirmed test user:
  - SUPABASE_TEST_LOGIN_EMAIL
  - SUPABASE_TEST_LOGIN_PASSWORD
* Dependencies installed (`npm install`).
* Script file `src/tests/supabase/scripts/auth-session.test.ts` is available.

Test Data
Env Vars:
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_TEST_LOGIN_EMAIL
- SUPABASE_TEST_LOGIN_PASSWORD

Test Steps
. Run: `npx tsx src/tests/supabase/scripts/auth-session.test.ts`.
. Verify script signs out first (clean slate).
. Verify `signInWithPassword` returns a non-null `session` with `access_token`.
. Verify `getSession()` returns the active session.
. Verify `getUser()` resolves the authenticated user.
. (Optional) Verify `refreshSession()` succeeds if `refresh_token` exists.
. Verify `signOut()` clears the session.

Expected Results
* Script exits with status code 0.
* Output includes PASS lines for each step.
* Failures include actionable messages (missing env var, auth failure, etc.).

Notes
This test is designed to be fast (< 1 minute) and runnable before CI or demos.
*/

export const TC_SUPA_03_INPUT_VALUES = {
  envVars: {
    url: 'EXPO_PUBLIC_SUPABASE_URL',
    anonKey: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    testEmail: 'SUPABASE_TEST_LOGIN_EMAIL',
    testPassword: 'SUPABASE_TEST_LOGIN_PASSWORD',
  },
} as const;

export const TC_SUPA_03_TEST_DATA = {
  inputValues: TC_SUPA_03_INPUT_VALUES,
  env: {
    urlVarName: TC_SUPA_03_INPUT_VALUES.envVars.url,
    anonKeyVarName: TC_SUPA_03_INPUT_VALUES.envVars.anonKey,
    testEmailVarName: TC_SUPA_03_INPUT_VALUES.envVars.testEmail,
    testPasswordVarName: TC_SUPA_03_INPUT_VALUES.envVars.testPassword,
  },
} as const;
