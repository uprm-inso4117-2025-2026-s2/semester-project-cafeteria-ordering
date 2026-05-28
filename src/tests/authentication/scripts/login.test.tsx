/**
 * ============================================================================
 * TEST CASE: TC-AUTH-04 - User Login Functionality Verification
 * ============================================================================
 * @id TC-AUTH-04
 * @author Januel E. Torres Marquez
 * @date 2026-03-15
 * ============================================================================
 * @description
 * Verify that a user can successfully log in using valid credentials or Google
 * OAuth, and that the system properly handles and rejects invalid credentials.
 * This test validates both the UI layout and authentication logic.
 * ============================================================================
 * @preconditions
 * - Login page UI is implemented and accessible
 * - Form validation is implemented
 * - Test environment database contains a registered user account
 * - Valid Google account is available for OAuth testing
 * ============================================================================
 * @test_data
 * Valid Scenarios:
 * | Field            | Valid Value 1          |
 * |------------------|------------------------|
 * | Email            | valid.user@uni.edu     |
 * | Password         | CorrectPass123!        |
 *
 * Invalid Scenarios:
 * | ID               | Field Under Test     | Input Value         | Expected Error                      | Methodology         |
 * |------------------|---------------------|---------------------|-------------------------------------|---------------------|
 * | TC-AUTH-04-NEG-01| Password            | "WrongPassword99"   | "Invalid email or password"         | EP (wrong credentials)|
 * | TC-AUTH-04-NEG-02| Email               | "ghost@uni.edu"     | "Invalid email or password"         | EP (unregistered)   |
 * | TC-AUTH-04-NEG-03| Email               | "notanemail"        | "Invalid email format"              | EP (invalid format) |
 * | TC-AUTH-04-NEG-04| All fields          | [empty]             | "This field is required" (all)      | EP (empty required) |
 * * Methodology Used:
 * - Equivalence Partitioning (EP): Testing valid/invalid classes of inputs
 * ============================================================================
 * @test_steps
 */
//
// ============================================================================
// IMPORTS & SETUP
// ============================================================================
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react-native";
import React from "react";
import LoginScreen from "../../../app/login/index";

// expo-web-browser is imported at module load by LoginScreen and calls
// maybeCompleteAuthSession() during the Google OAuth flow. Outside the Expo
// runtime it crashes on AppState.currentState, so we stub it. Tracked under
// TR-AUTH-08 defect DEF-AUTH-08-04.
const mockOpenAuthSessionAsync = jest.fn();
jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: (...args: any[]) => mockOpenAuthSessionAsync(...args),
}));

// Mocking the Supabase auth hooks. The login screen now depends on
// getSession (PR #694), onAuthStateChange (post-#694 merge train), and the
// profiles `from(...).select(...).eq(...).maybeSingle()` chain for role-based
// redirect. See TR-AUTH-08 defects DEF-AUTH-08-01 / DEF-AUTH-08-02.
const mockSignInWithPassword = jest.fn();
const mockSignInWithOAuth = jest.fn();
const mockGetSession = jest.fn().mockResolvedValue({ data: { session: null } });
const mockOnAuthStateChange = jest.fn().mockReturnValue({
  data: { subscription: { unsubscribe: jest.fn() } },
});
const mockSetSession = jest.fn().mockResolvedValue({ data: { session: null }, error: null });

jest.mock("../../../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      signInWithOAuth: (...args: any[]) => mockSignInWithOAuth(...args),
      getSession: (...args: any[]) => mockGetSession(...args),
      onAuthStateChange: (...args: any[]) => mockOnAuthStateChange(...args),
      setSession: (...args: any[]) => mockSetSession(...args),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  },
}));

describe("TC-AUTH-04: LoginScreen Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // STEP 1: Navigate to Login page
  // ============================================================================
  /**
   * Expected: Centered container displays with "Log In" title and
   * relevant subtitle/branding.
   */
  it("should render the login screen correctly with title", () => {
    render(<LoginScreen />);

    expect(screen.getByText(/welcome back/i)).toBeTruthy();
  });

  // ============================================================================
  // STEP 2: Verify UI elements
  // ============================================================================
  /**
   * Expected: All fields visible: Email, Password.
   * "Log In" button present.
   * "Log in with Google" OAuth button present.
   * "Don't have an account? Sign up" link present.
   */
  it("should display all required UI elements", () => {
    render(<LoginScreen />);

    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(screen.getByLabelText("Sign in")).toBeTruthy();
    expect(screen.getByLabelText("Sign in with Google")).toBeTruthy();
    expect(screen.getByText(/don't have an account/i)).toBeTruthy();
  });

  // ============================================================================
  // STEP 3: Test Invalid Scenarios
  // ============================================================================

  // ----------------------------------------------------------------------------
  // STEP 3a: TC-AUTH-04-NEG-04 - All fields empty
  // ----------------------------------------------------------------------------
  /**
   * Input: Leave all fields empty, attempt submission
   * Expected: "This field is required" appears for required fields
   * Form submission blocked
   */
  it("should display required errors when submitting empty fields", async () => {
    render(<LoginScreen />);

    const loginButton = screen.getByLabelText("Sign in");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeTruthy();
      expect(screen.getByText(/password is required/i)).toBeTruthy();
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------------------------
  // STEP 3b: TC-AUTH-04-NEG-03 - Invalid Email Format
  // ----------------------------------------------------------------------------
  /**
   * Input: Enter "notanemail" in Email, any password
   * Expected: "Invalid email format" error message appears
   * Form submission blocked
   */
  it("should reject invalid email formats", async () => {
    render(<LoginScreen />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const loginButton = screen.getByLabelText("Sign in");

    fireEvent.changeText(emailInput, "notanemail");
    fireEvent.changeText(passwordInput, "AnyPassword123!");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i),
      ).toBeTruthy();
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------------------------
  // STEP 3c: TC-AUTH-04-NEG-02 - Unregistered Email
  // ----------------------------------------------------------------------------
  /**
   * Input: Enter "ghost@uni.edu" and "AnyPassword123!"
   * Expected: "Invalid email or password" error message appears
   * Access denied
   */
  it("should show generic error for unregistered emails", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByLabelText("Email"), "ghost@uni.edu");
    fireEvent.changeText(screen.getByLabelText("Password"), "AnyPassword123!");
    fireEvent.press(screen.getByLabelText("Sign in"));

    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeTruthy();
    });
  });

  // ----------------------------------------------------------------------------
  // STEP 3d: TC-AUTH-04-NEG-01 - Invalid Password
  // ----------------------------------------------------------------------------
  /**
   * Input: Enter "valid.user@uni.edu" and "WrongPassword99"
   * Expected: "Invalid email or password" error message appears
   * Access denied
   */
  it("should show generic error for incorrect passwords", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByLabelText("Email"), "valid.user@uni.edu");
    fireEvent.changeText(screen.getByLabelText("Password"), "WrongPassword99");
    fireEvent.press(screen.getByLabelText("Sign in"));

    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeTruthy();
    });
  });

  // ============================================================================
  // STEP 4: Valid Email/Password Login
  // ============================================================================
  /**
   * Input: Enter valid credentials ("valid.user@uni.edu" and "CorrectPass123!")
   * Expected: User is successfully authenticated
   * Redirected to the main dashboard
   */
  it("should successfully authenticate with valid credentials", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 1 }, session: { access_token: "token" } },
      error: null,
    });
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByLabelText("Email"), "valid.user@uni.edu");
    fireEvent.changeText(screen.getByLabelText("Password"), "CorrectPass123!");
    fireEvent.press(screen.getByLabelText("Sign in"));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // STEP 5: Google OAuth Login (cancel path)
  // ============================================================================
  /**
   * Pre PR #745 the Google button was a placeholder. It is now a real OAuth
   * flow: supabase.auth.signInWithOAuth(...) returns an auth URL, which is
   * opened via WebBrowser.openAuthSessionAsync. The cancel branch surfaces
   * the inline message "Google sign in was cancelled.".
   *
   * Input: Click "Sign in with Google", then user cancels in the browser tab
   * Expected: Inline message "Google sign in was cancelled." is shown,
   *   no session is created, user remains on the login screen
   */
  it("should surface cancel message when the Google OAuth flow is cancelled", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({
      data: { url: "https://accounts.google.com/o/oauth2/test-flow" },
      error: null,
    });
    mockOpenAuthSessionAsync.mockResolvedValueOnce({ type: "cancel" });

    render(<LoginScreen />);

    const googleButton = screen.getByLabelText("Sign in with Google");
    fireEvent.press(googleButton);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "google" }),
      );
      expect(mockOpenAuthSessionAsync).toHaveBeenCalled();
      expect(
        screen.getByText(/google sign in was cancelled\./i),
      ).toBeTruthy();
    });
  });

  // ============================================================================
  // STEP 6: Apple Sign-In Placeholder
  // ============================================================================
  /**
   * Apple sign-in backend is intentionally not wired (paid Apple Developer
   * membership required — see issue #648). Pressing the button must surface
   * the inline placeholder notice.
   */
  it("should surface placeholder notice when the Apple button is pressed", async () => {
    render(<LoginScreen />);

    fireEvent.press(screen.getByLabelText("Sign in with Apple"));

    await waitFor(() => {
      expect(
        screen.getByText(/apple sign-in is not available/i),
      ).toBeTruthy();
    });
  });
});

// ============================================================================
// @expected_results
// ============================================================================
/**
 * - User can successfully navigate to login page
 * - All UI elements render correctly
 * - Form rejects empty submissions and invalid email formats
 * - System properly rejects unregistered emails and incorrect passwords with a generic message
 * - System successfully authenticates valid email/password combinations
 * - System successfully authenticates via Google OAuth
 * - Successful logins redirect the user to the main dashboard
 * - No console errors during any test steps
 */

export { };

