/*
Supabase Login Backend Validation TC
Author: Luis J.

Description
Validate backend login behavior using Supabase email/password authentication without frontend UI dependency.
Test type: Integration

Preconditions
* `.env` file exists with valid Supabase credentials.
* A confirmed test user exists in the Supabase project.
* Test account credentials are available in `.env`.
* Script file `src/tests/supabase/scripts/login-backend.test.ts` is available.

Test Data
The concrete input values for this case are defined in the uncommented export directly below.

Test Steps
. Run: `npm run test:login-backend`.
. Verify login succeeds using configured test credentials.
. Verify session exists immediately after login.
. Verify logout succeeds.
. Verify session is cleared after logout.

Expected Results
* Login operation returns user/session data.
* Session verification passes after login.
* Logout clears session state.
* Script exits with success status when all checks pass.

Notes
Used to validate authentication backend readiness before frontend login screen integration.
*/

export const TC_SUPA_03_INPUT_VALUES = {
  envVars: {
    url: 'EXPO_PUBLIC_SUPABASE_URL',
    anonKey: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    loginEmail: 'SUPABASE_TEST_LOGIN_EMAIL',
    loginPassword: 'SUPABASE_TEST_LOGIN_PASSWORD',
  },
} as const;

export const TC_SUPA_03_TEST_DATA = {
  inputValues: TC_SUPA_03_INPUT_VALUES,
  env: {
    urlVarName: TC_SUPA_03_INPUT_VALUES.envVars.url,
    anonKeyVarName: TC_SUPA_03_INPUT_VALUES.envVars.anonKey,
    loginEmailVarName: TC_SUPA_03_INPUT_VALUES.envVars.loginEmail,
    loginPasswordVarName: TC_SUPA_03_INPUT_VALUES.envVars.loginPassword,
  },
} as const;

export function getLoginBackendEnvValues() {
  return {
    supabaseUrl: process.env[TC_SUPA_03_TEST_DATA.env.urlVarName],
    supabaseAnonKey: process.env[TC_SUPA_03_TEST_DATA.env.anonKeyVarName],
    testEmail: process.env[TC_SUPA_03_TEST_DATA.env.loginEmailVarName],
    testPassword: process.env[TC_SUPA_03_TEST_DATA.env.loginPasswordVarName],
  };
}
