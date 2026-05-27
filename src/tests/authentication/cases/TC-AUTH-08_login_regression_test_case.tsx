/**
 * ============================================================================
 * TEST CASE: TC-AUTH-08 - User Login Regression Testing
 * ============================================================================
 *
 * @id TC-AUTH-08
 * @author Januel E. Torres Marquez
 * @date 2026-05-27
 *
 * ============================================================================
 * @description
 * Perform comprehensive regression testing on the User Login functionality.
 * Verify that recent system updates and newly merged features (e.g. frontend
 * session-persistence validation, Apple/Google OAuth additions) have NOT broken
 * the existing email/password authentication flow. This covers valid login and
 * role-based redirect, invalid credential handling, client-side form
 * validation, the Google sign-in entry point, the existing-session check on
 * mount, and navigation links (Forgot password / Sign up).
 *
 * Scope: regression of the screen at `src/app/login/index.tsx`.
 *
 * ============================================================================
 * @preconditions
 * - Login page UI is implemented and accessible at the `/login` route
 * - Client-side form validation (`src/lib/validation.ts`) is implemented
 * - Supabase auth client (`src/lib/supabase.ts`) is configured for the test env
 * - Login error mapping (`src/lib/auth.ts` -> mapLoginError) is available
 * - Test environment database contains a registered user account
 * - No active session exists before each test (clean auth state)
 *
 * ============================================================================
 * @test_data
 *
 * Valid Scenarios:
 * | Field    | Valid Value         |
 * |----------|---------------------|
 * | Email    | valid.user@uni.edu  |
 * | Password | CorrectPass123!     |
 *
 * Invalid Scenarios (Equivalence Partitioning):
 * | ID                | Field Under Test | Input Value        | Expected Error                          |
 * |-------------------|------------------|--------------------|-----------------------------------------|
 * | TC-AUTH-08-NEG-01 | Password         | "WrongPassword99"  | "Invalid login credentials" (mapped)    |
 * | TC-AUTH-08-NEG-02 | Email            | "ghost@uni.edu"    | "Invalid login credentials" (mapped)    |
 * | TC-AUTH-08-NEG-03 | Email            | "notanemail"       | "Please enter a valid email address."   |
 * | TC-AUTH-08-NEG-04 | Email (empty)    | ""                 | "Email is required."                    |
 * | TC-AUTH-08-NEG-05 | Password (empty) | ""                 | "Password is required."                 |
 *
 * Methodology Used:
 * - Equivalence Partitioning (EP): valid vs. invalid classes of input
 * - Regression: re-running the established TC-AUTH-04 suite against current code
 *
 * ============================================================================
 */

// ============================================================================
// IMPORTS
// ============================================================================
import { supabase } from '../../../lib/supabase';

// ============================================================================
// TEST DATA
// ============================================================================

// Valid email/password user
export const validLoginUser = {
  email: 'valid.user@uni.edu',
  password: 'CorrectPass123!',
};

// Staff user — exercises the role-based redirect branch
export const staffLoginUser = {
  email: 'staff.user@uni.edu',
  password: 'StaffPass123!',
  role: 'staff',
};

// Invalid credentials for negative testing
export const invalidCredentials = {
  wrongPassword: {
    email: 'valid.user@uni.edu',
    password: 'WrongPassword99',
  },
  unregisteredEmail: {
    email: 'ghost@uni.edu',
    password: 'AnyPassword123!',
  },
  malformedEmail: {
    email: 'notanemail',
    password: 'AnyPassword123!',
  },
  emptyEmail: {
    email: '',
    password: 'AnyPassword123!',
  },
  emptyPassword: {
    email: 'valid.user@uni.edu',
    password: '',
  },
};

// ============================================================================
// MOCK API RESPONSES
// ============================================================================

// supabase.auth.signInWithPassword — success (regular user)
export const mockSignInSuccess = () => ({
  data: {
    user: { id: 'user-123', email: validLoginUser.email },
    session: { access_token: 'mock-access-token', refresh_token: 'mock-refresh-token' },
  },
  error: null,
});

// supabase.auth.signInWithPassword — invalid credentials (covers wrong
// password AND unregistered email; Supabase returns the same generic error)
export const mockSignInInvalidCredentials = () => ({
  data: { user: null, session: null },
  error: { message: 'Invalid login credentials' },
});

// supabase.auth.getSession — REGRESSION-CRITICAL.
// LoginScreen's mount effect (added by the session-persistence feature, PR #694)
// calls supabase.auth.getSession(). Any test that renders LoginScreen MUST stub
// this or the render throws "getSession is not a function". See @notes.
export const mockGetSessionEmpty = () => ({
  data: { session: null },
});

export const mockGetSessionActive = () => ({
  data: {
    session: {
      access_token: 'restored-access-token',
      user: { id: 'user-123', email: validLoginUser.email },
    },
  },
});

// supabase.from('profiles')...maybeSingle() — role lookup for redirect branch
export const mockProfileRole = (role: 'staff' | 'student' | null) => ({
  data: role ? { role } : null,
  error: null,
});

// ============================================================================
// EXPECTED UI TEXT / ELEMENTS (must match src/app/login/index.tsx exactly)
// ============================================================================
export const expectedTitle = 'Welcome back!';
export const expectedEmailLabel = 'Email';
export const expectedPasswordLabel = 'Password';
export const expectedSignInButton = 'Sign in';
export const expectedGoogleButton = 'Sign in with Google';
export const expectedForgotPasswordLink = 'Forgot password?';
export const expectedSignUpLink = 'Sign up';

// Expected messages
export const errEmailRequired = 'Email is required.';
export const errEmailInvalid = 'Please enter a valid email address.';
export const errPasswordRequired = 'Password is required.';
export const errInvalidCredentials = 'Invalid login credentials';
// NOTE: Google login is currently a placeholder, NOT a working OAuth flow.
export const msgGooglePlaceholder =
  'Google sign-in is not enabled yet. Please sign in with email and password.';

export {
  supabase, // re-exported so execution scripts can import the mocked client
};

/*
 * ============================================================================
 * @test_steps
 * ============================================================================
 *
 * STEP 1: Login screen renders (mount + existing-session check)
 *   Precondition: mock getSession -> mockGetSessionEmpty()
 *   Action: Navigate to /login.
 *   Expected: Screen renders with title "Welcome back!" and logo. The mount
 *     effect calls supabase.auth.getSession() exactly once WITHOUT throwing.
 *
 * STEP 2: Verify UI elements
 *   Expected: Visible -> "Email" field, "Password" field, "Sign in" button,
 *     "Sign in with Google" button, "Forgot password?" link, "Sign up" link.
 *
 * STEP 3: TC-AUTH-08-NEG-04 / NEG-05 — Empty field validation
 *   Action: Press "Sign in" with both fields empty.
 *   Expected: "Email is required." and "Password is required." shown.
 *     supabase.auth.signInWithPassword is NOT called (submission blocked).
 *
 * STEP 4: TC-AUTH-08-NEG-03 — Malformed email validation
 *   Input: email = "notanemail", password = "AnyPassword123!".
 *   Action: Press "Sign in".
 *   Expected: "Please enter a valid email address." shown.
 *     signInWithPassword is NOT called (validation runs before the API call).
 *
 * STEP 5: TC-AUTH-08-NEG-02 — Unregistered email
 *   Precondition: mock signInWithPassword -> mockSignInInvalidCredentials().
 *   Input: invalidCredentials.unregisteredEmail.
 *   Expected: Generic mapped error displayed; no session created; user remains
 *     on the login screen.
 *
 * STEP 6: TC-AUTH-08-NEG-01 — Wrong password
 *   Precondition: mock signInWithPassword -> mockSignInInvalidCredentials().
 *   Input: invalidCredentials.wrongPassword.
 *   Expected: Same generic mapped error (no user enumeration); no session.
 *
 * STEP 7: Valid login — regular user redirect
 *   Precondition: signInWithPassword -> mockSignInSuccess(),
 *     profiles role lookup -> mockProfileRole('student' | null).
 *   Input: validLoginUser.
 *   Expected: Authentication succeeds and the app redirects to the tabs home
 *     route '/(tabs)'.
 *
 * STEP 8: Valid login — staff redirect branch
 *   Precondition: signInWithPassword -> mockSignInSuccess(),
 *     profiles role lookup -> mockProfileRole('staff').
 *   Input: staffLoginUser.
 *   Expected: Authentication succeeds and the app redirects to '/staff/ViewOrders'.
 *
 * STEP 9: Google sign-in entry point (placeholder)
 *   Action: Press "Sign in with Google".
 *   Expected: Placeholder message shown -> msgGooglePlaceholder. No OAuth
 *     redirect occurs (feature not yet enabled). This documents current,
 *     intended behavior so a future OAuth implementation is caught by regression.
 *
 * STEP 10: Existing-session restoration on mount
 *   Precondition: mock getSession -> mockGetSessionActive().
 *   Action: Mount the login screen.
 *   Expected: getSession resolves with an active session and the mount effect
 *     completes without error (session-persistence behavior preserved).
 *
 * STEP 11: Forgot password navigation
 *   Action: Tap "Forgot password?".
 *   Expected: Router navigates to the '/PasswordRecovery' route.
 *
 * STEP 12: Sign up navigation
 *   Action: Tap "Sign up".
 *   Expected: Router navigates to the '/signup' route.
 *
 * ============================================================================
 * @expected_results
 * ============================================================================
 * - Login screen renders and the mount-time getSession() check does not throw.
 * - All UI elements render with the exact expected labels.
 * - Empty and malformed inputs are blocked client-side before any API call.
 * - Unregistered email and wrong password both return the same generic error.
 * - Valid credentials authenticate and redirect by role (student -> /(tabs),
 *   staff -> /staff/ViewOrders).
 * - The Google button shows the placeholder message (OAuth not yet enabled).
 * - Forgot-password and sign-up links route correctly.
 * - No regression in any previously passing TC-AUTH-04 behavior.
 *
 * ============================================================================
 * @notes
 * ============================================================================
 * - This regression case re-validates the login screen after the
 *   session-persistence (PR #694) and OAuth additions were merged. Run it after
 *   any authentication-related change.
 *
 * - REGRESSION RISK (getSession): LoginScreen now calls
 *   supabase.auth.getSession() inside its mount useEffect
 *   (src/app/login/index.tsx ~line 130). Any execution script that renders the
 *   screen must stub auth.getSession (see mockGetSessionEmpty) AND the
 *   profiles `from(...).select(...).eq(...).maybeSingle()` chain, or every
 *   render will throw "getSession is not a function". The legacy TC-AUTH-04
 *   suite predates this feature and does NOT stub it — confirm/repair before
 *   reporting (tracked for the TR-AUTH-08 report).
 *
 * - Google sign-in is intentionally a placeholder today; STEP 9 asserts that
 *   exact behavior rather than a full OAuth flow.
 *
 * EXECUTION SCRIPTS (to run during the reporting phase — NOT executed here,
 * pending other implementations):
 * - Unit/Integration (Jest): src/tests/authentication/scripts/login.test.tsx
 * - UI (Playwright):         src/tests/ui/scripts/login.spec.ts
 *
 * FILE LOCATIONS:
 * - Test Case:   src/tests/authentication/cases/TC-AUTH-08_login_regression_test_case.tsx
 * - Test Report: src/tests/authentication/reports/  (TR-AUTH-08, to be created)
 *
 * BRANCH: issue676-regression-testing-login
 *
 * Reviewed By: [To be filled by reviewer]
 */

export {};
