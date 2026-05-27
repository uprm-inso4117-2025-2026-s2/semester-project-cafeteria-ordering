/*
Logout UI Functionality Validation TC
Author: Luis J. Cruz

Description
Validate that logging out properly clears auth/session state, resets UI state,
redirects to the login screen, and blocks protected routes.
Test type: Manual UI + Integration (frontend + Supabase auth)

Preconditions
* User can log in successfully.
* Supabase auth session management is enabled in the app.
* At least one confirmed test user exists.
*/

// Test Data
export const TC_AUTH_06_INPUT_VALUES = {
	routes: {
		login: '/login',
		tabsRoot: '/(tabs)',
		profile: '/profile',
		staffRoot: '/staff',
	},
	protectedRouteProbes: ['/(tabs)', '/profile', '/staff'],
	localStorageKeysToClear: ['@profile_avatar', '@profile_info'],
} as const;

export const TC_AUTH_06_TEST_DATA = {
	inputValues: TC_AUTH_06_INPUT_VALUES,
	routes: {
		loginPath: TC_AUTH_06_INPUT_VALUES.routes.login,
		tabsRootPath: TC_AUTH_06_INPUT_VALUES.routes.tabsRoot,
		profilePath: TC_AUTH_06_INPUT_VALUES.routes.profile,
		staffRootPath: TC_AUTH_06_INPUT_VALUES.routes.staffRoot,
	},
	stateReset: {
		asyncStorageKeys: TC_AUTH_06_INPUT_VALUES.localStorageKeysToClear,
	},
} as const;

/*
Test Steps
. Log in as User A.
. Navigate to the Profile screen.
. Tap Logout and confirm.
. Verify redirect to /login.
. Verify UI state is cleared (no name/email/phone/avatar remnants).
. Attempt to access protected routes; verify redirect back to /login.
. (Optional) Repeat with User B to confirm no cross-user leakage.

Expected Results
* Supabase session/auth state is cleared.
* App redirects to the Login screen.
* UI is reset (no residual user data visible).
* Protected routes are blocked while logged out.

Notes
This case validates UI security posture and state-reset behavior after logout.

*/

export function getLogoutValidationTestData() {
	return TC_AUTH_06_TEST_DATA;
}

