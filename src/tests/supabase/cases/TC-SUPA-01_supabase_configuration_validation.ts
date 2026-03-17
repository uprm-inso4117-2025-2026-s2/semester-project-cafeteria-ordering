/*
Supabase Configuration Validation TC
Author: Luis J.

Description
Validate Supabase integration for backend/database baseline readiness.
Test type: Integration

Preconditions
* `.env` file exists with valid Supabase credentials.
* Dependencies are installed (`npm install`).
* Supabase project is active and reachable.
* Script file `src/tests/supabase/scripts/supabase-connection.test.ts` is available.
*/

// Test Data
// - EXPO_PUBLIC_SUPABASE_URL
// - EXPO_PUBLIC_SUPABASE_ANON_KEY
// - Existing Supabase project resources (Auth/DB/Storage)

/*
Test Steps
. Execute the script `src/tests/supabase/scripts/supabase-connection.test.ts` through the app entry point.
. Confirm test logs for client initialization and environment variables.
. Confirm database connectivity check executes without blocking errors.
. Confirm authentication session retrieval succeeds.
. Confirm storage configuration check executes and reports bucket status.

Expected Results
* Script runs without runtime crash.
* Core connection checks pass and output clear pass/fail messages.
* Any failing section includes actionable error details.

Notes
This case validates readiness and diagnostics, not business workflow behavior.

*/

export const TC_SUPA_01_TEST_DATA = {
	env: {
		urlVarName: 'EXPO_PUBLIC_SUPABASE_URL',
		anonKeyVarName: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
	},
	databaseProbe: {
		table: 'menu_items',
		selectColumn: 'id',
	},
	storageProbe: {
		bucket: 'menu-images',
		sampleObject: 'test.jpg',
	},
} as const;

export function getSupabaseCredentialsFromEnv() {
	const supabaseUrl = process.env[TC_SUPA_01_TEST_DATA.env.urlVarName];
	const supabaseAnonKey = process.env[TC_SUPA_01_TEST_DATA.env.anonKeyVarName];

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			`Missing Supabase environment variables. Ensure ${TC_SUPA_01_TEST_DATA.env.urlVarName} and ${TC_SUPA_01_TEST_DATA.env.anonKeyVarName} are set in .env`
		);
	}

	return { supabaseUrl, supabaseAnonKey };
}
