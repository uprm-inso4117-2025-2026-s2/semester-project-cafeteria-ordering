/*
Supabase Signup Backend Validation TC
Author: Luis J.

Description
Validate backend signup behavior using Supabase email/password authentication without frontend UI dependency.
Test type: Integration

Preconditions
* `.env` file exists with valid Supabase credentials.
* Supabase project is active and reachable.
* Script file `src/tests/supabase/scripts/signup-backend.test.ts` is available.

Test Data
The concrete input values for this case are defined in the uncommented export directly below.

Test Steps
. Run: `npm run test:signup-backend`.
. Verify signup succeeds for a newly generated email.
. Verify phone metadata is persisted to profile when session context allows profile read.
. Verify duplicate signup attempt is blocked or safely handled.
. Verify weak password signup is rejected.
. If a session exists post-signup, verify profile row accessibility for the signed-in user.

Expected Results
* New-user signup succeeds.
* Signup metadata can include phone for profile persistence.
* Duplicate signup does not create a second valid registration flow.
* Weak password is rejected.
* Profile linkage can be validated when session context is available.

Notes
When email confirmation is enabled, Supabase may return a user with no active session after signup.
*/

export const TC_SUPA_04_INPUT_VALUES = {
  envVars: {
    url: 'EXPO_PUBLIC_SUPABASE_URL',
    anonKey: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    signupPassword: 'SUPABASE_TEST_SIGNUP_PASSWORD',
    loginEmail: 'SUPABASE_TEST_LOGIN_EMAIL',
  },
  generatedEmailPrefix: 'inso-signup-test',
  weakPasswordSample: 'abc',
} as const;

export const TC_SUPA_04_TEST_DATA = {
  inputValues: TC_SUPA_04_INPUT_VALUES,
  env: {
    urlVarName: TC_SUPA_04_INPUT_VALUES.envVars.url,
    anonKeyVarName: TC_SUPA_04_INPUT_VALUES.envVars.anonKey,
    signupPasswordVarName: TC_SUPA_04_INPUT_VALUES.envVars.signupPassword,
    loginEmailVarName: TC_SUPA_04_INPUT_VALUES.envVars.loginEmail,
  },
  testData: {
    generatedEmailPrefix: TC_SUPA_04_INPUT_VALUES.generatedEmailPrefix,
    weakPasswordSample: TC_SUPA_04_INPUT_VALUES.weakPasswordSample,
  },
} as const;

export function getSignupBackendEnvValues() {
  return {
    supabaseUrl: process.env[TC_SUPA_04_TEST_DATA.env.urlVarName],
    supabaseAnonKey: process.env[TC_SUPA_04_TEST_DATA.env.anonKeyVarName],
    signupPassword: process.env[TC_SUPA_04_TEST_DATA.env.signupPasswordVarName],
    loginEmail: process.env[TC_SUPA_04_TEST_DATA.env.loginEmailVarName],
  };
}
