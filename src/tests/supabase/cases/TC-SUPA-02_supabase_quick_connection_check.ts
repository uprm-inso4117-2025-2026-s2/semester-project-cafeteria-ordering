/*
Supabase Quick Connection Check TC
Author: Luis J.

Description
Perform a fast health-check for Supabase environment, auth, DB access, and storage bucket accessibility.
Test type: Smoke / Integration

Preconditions
* `.env` file exists with valid Supabase credentials.
* Dependencies are installed (`npm install`).
* Script file `src/tests/supabase/scripts/quick-test.ts` is available.

Test Data
* EXPO_PUBLIC_SUPABASE_URL
* EXPO_PUBLIC_SUPABASE_ANON_KEY

Test Steps
. Run: `npx tsx src/tests/supabase/scripts/quick-test.ts`.
. Verify environment variables are detected.
. Verify Supabase client initializes successfully.
. Verify DB/auth/storage checks run and produce output.
. Verify script exits successfully when checks pass.

Expected Results
* Quick test executes end-to-end.
* Output includes pass/fail lines for each check.
* Script reports success when environment and connectivity are correct.

Notes
Used as a fast regression check after infrastructure or env changes.


*/
