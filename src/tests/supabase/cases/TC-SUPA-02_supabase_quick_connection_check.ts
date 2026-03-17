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
The concrete input values for this case are defined in the uncommented export directly below.

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

export const TC_SUPA_02_INPUT_VALUES = {
	envVars: {
		url: 'EXPO_PUBLIC_SUPABASE_URL',
		anonKey: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
	},
	databaseProbeTable: 'menu_items',
	databaseProbeColumn: 'id',
	storageBucket: 'menu-images',
	storageSampleObject: 'test.jpg',
} as const;

export const TC_SUPA_02_TEST_DATA = {
	inputValues: TC_SUPA_02_INPUT_VALUES,
	env: {
		urlVarName: TC_SUPA_02_INPUT_VALUES.envVars.url,
		anonKeyVarName: TC_SUPA_02_INPUT_VALUES.envVars.anonKey,
	},
	databaseProbe: {
		table: TC_SUPA_02_INPUT_VALUES.databaseProbeTable,
		selectColumn: TC_SUPA_02_INPUT_VALUES.databaseProbeColumn,
	},
	storageProbe: {
		bucket: TC_SUPA_02_INPUT_VALUES.storageBucket,
		sampleObject: TC_SUPA_02_INPUT_VALUES.storageSampleObject,
	},
} as const;

export function getQuickTestEnvValues() {
	return {
		supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
		supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
	};
}
