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
export const TC_SUPA_01_INPUT_VALUES = {
	envVars: {
		url: 'EXPO_PUBLIC_SUPABASE_URL',
		anonKey: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
	},
	databaseProbeTable: 'menu_items',
	databaseProbeColumn: 'id',
	storageBucket: 'menu-images',
	storageSampleObject: 'test.jpg',
} as const;

export const TC_SUPA_01_TEST_DATA = {
	inputValues: TC_SUPA_01_INPUT_VALUES,
	env: {
		urlVarName: TC_SUPA_01_INPUT_VALUES.envVars.url,
		anonKeyVarName: TC_SUPA_01_INPUT_VALUES.envVars.anonKey,
	},
	databaseProbe: {
		table: TC_SUPA_01_INPUT_VALUES.databaseProbeTable,
		selectColumn: TC_SUPA_01_INPUT_VALUES.databaseProbeColumn,
	},
	storageProbe: {
		bucket: TC_SUPA_01_INPUT_VALUES.storageBucket,
		sampleObject: TC_SUPA_01_INPUT_VALUES.storageSampleObject,
	},
} as const;

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

export function getSupabaseCredentialsFromEnv() {
	const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			`Missing Supabase environment variables. Ensure ${TC_SUPA_01_TEST_DATA.env.urlVarName} and ${TC_SUPA_01_TEST_DATA.env.anonKeyVarName} are set in .env`
		);
	}

	return { supabaseUrl, supabaseAnonKey };
}
