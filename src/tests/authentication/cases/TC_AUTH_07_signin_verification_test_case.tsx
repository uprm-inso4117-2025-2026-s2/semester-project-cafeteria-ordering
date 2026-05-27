/**
 * ============================================================================
 * TEST CASE: TC-AUTH-07 - Account Sign-In and Verification Regression Testing
 * ============================================================================
 * 
 * @id TC-AUTH-07
 * @author Devlin Hahn
 * @date 2026-05-27
 * 
 * ============================================================================
 * @description
 * Perform comprehensive regression testing on account sign-in and verification
 * functionality. Verify that all existing and newly implemented authentication
 * features work correctly including email/password, Google/Apple OAuth, session
 * persistence, logout, and protected routes.
 * 
 * ============================================================================
 * @test_data
 */

// ============================================================================
// IMPORTS
// ============================================================================
import { supabase } from '../../../lib/supabase';

// ============================================================================
// TEST DATA - Email/Password Users
// ============================================================================

export const validEmailUser = {
  email: "regression.test@university.edu",
  password: "Regression@2026",
  fullName: "Regression Test User"
};

export const alternateEmailUser = {
  email: "alternate.test@student.edu",
  password: "Alternate@1234",
  fullName: "Alternate Test User"
};

// ============================================================================
// TEST DATA - Invalid Credentials
// ============================================================================

export const invalidCredentials = {
  wrongPassword: {
    email: "regression.test@university.edu",
    password: "WrongPassword123!"
  },
  nonExistentEmail: {
    email: "nonexistent@test.com",
    password: "AnyPassword123!"
  },
  emptyEmail: {
    email: "",
    password: "Test@1234"
  },
  emptyPassword: {
    email: "regression.test@university.edu",
    password: ""
  },
  malformedEmail: {
    email: "not-an-email",
    password: "Test@1234"
  }
};

// ============================================================================
// TEST DATA - OAuth Users
// ============================================================================

export const googleTestUser = {
  email: "google.test@gmail.com",
  provider: "google",
  fullName: "Google Test User"
};

export const appleTestUser = {
  email: "apple.test@privaterelay.appleid.com",
  provider: "apple",
  appleId: "001812.59d9f8e9f1e2c3b4a5d6f7e8c9b0a1d2.1911",
  fullName: "Apple Test User"
};

// ============================================================================
// MOCK API RESPONSES
// ============================================================================

export const mockSignInSuccess = () => ({
  data: {
    user: {
      id: "test-user-123",
      email: validEmailUser.email,
      user_metadata: { full_name: validEmailUser.fullName },
      role: 'customer'
    },
    session: {
      access_token: "mock-access-token-123",
      refresh_token: "mock-refresh-token-456",
      expires_at: Math.floor(Date.now() / 1000) + 3600
    }
  },
  error: null
});

export const mockSignInInvalidPassword = () => ({
  data: null,
  error: { message: "Invalid login credentials" }
});

export const mockSignInUserNotFound = () => ({
  data: null,
  error: { message: "User not found" }
});

export const mockGoogleSignInSuccess = () => ({
  data: {
    user: {
      id: "google-user-456",
      email: googleTestUser.email,
      user_metadata: { full_name: googleTestUser.fullName, provider: "google" },
      role: 'customer'
    },
    session: {
      access_token: "google-access-token-789",
      refresh_token: "google-refresh-token-101",
      expires_at: Math.floor(Date.now() / 1000) + 3600
    }
  },
  error: null,
  url: "https://accounts.google.com/o/oauth2/auth?..."
});

export const mockGoogleSignInCancelled = () => ({
  data: null,
  error: null,
  cancelled: true
});

export const mockAppleSignInSuccess = () => ({
  data: {
    user: {
      id: "apple-user-789",
      email: appleTestUser.email,
      user_metadata: {
        full_name: appleTestUser.fullName,
        provider: "apple",
        apple_id: appleTestUser.appleId
      },
      role: 'customer'
    },
    session: {
      access_token: "apple-access-token-111",
      refresh_token: "apple-refresh-token-222",
      expires_at: Math.floor(Date.now() / 1000) + 3600
    }
  },
  error: null
});

export const mockStaffUserSignIn = () => ({
  data: {
    user: {
      id: "staff-user-999",
      email: "staff@cafeteria.edu",
      user_metadata: { full_name: "Staff User" },
      role: 'staff'
    },
    session: {
      access_token: "staff-access-token",
      refresh_token: "staff-refresh-token",
      expires_at: Math.floor(Date.now() / 1000) + 3600
    }
  },
  error: null
});

export const mockSignOutSuccess = () => ({
  error: null
});

export const mockSessionRestored = () => ({
  data: {
    session: {
      access_token: "restored-token-123",
      refresh_token: "restored-refresh-456",
      expires_at: Math.floor(Date.now() / 1000) + 3600
    },
    user: {
      id: "test-user-123",
      email: validEmailUser.email,
      user_metadata: { full_name: validEmailUser.fullName }
    }
  },
  error: null
});

export const mockSessionExpired = () => ({
  data: { session: null, user: null },
  error: null
});

// ============================================================================
// PROFILE MOCKS
// ============================================================================

export const mockProfileSuccess = () => ({
  data: {
    id: "test-user-123",
    user_id: "test-user-123",
    full_name: validEmailUser.fullName,
    phone: "7875550123",
    role: 'customer'
  },
  error: null
});

export const mockStaffProfile = () => ({
  data: {
    id: "staff-user-999",
    user_id: "staff-user-999",
    full_name: "Staff User",
    phone: "7875559999",
    role: 'staff'
  },
  error: null
});

// ============================================================================
// ERROR MESSAGE GETTERS
// ============================================================================

export const getInvalidCredentialsError = () => "Invalid email or password";
export const getEmailRequiredError = () => "Email is required";
export const getPasswordRequiredError = () => "Password is required";
export const getValidEmailError = () => "Please enter a valid email address";
export const getGoogleAuthError = () => "Unable to sign in with Google";
export const getGoogleAuthCancelledError = () => "Google sign in was cancelled";
export const getAppleAuthError = () => "Apple sign-in is not available";
export const getAppleAuthCancelledError = () => "Apple sign in was cancelled";
export const getSignOutSuccessMessage = () => "Signed out successfully";
export const getSessionRestoredMessage = () => "Session restored successfully";
export const getSessionExpiredMessage = () => "Your session has expired. Please sign in again.";

// ============================================================================
// UI ELEMENT TEXT
// ============================================================================

export const expectedSignInTitle = "Welcome back!";
export const expectedEmailField = "Email";
export const expectedPasswordField = "Password";
export const expectedSignInButton = "Sign in";
export const expectedGoogleButton = "Sign in with Google";
export const expectedAppleButton = "Sign in with Apple";
export const expectedForgotPasswordLink = "Forgot password?";
export const expectedSignUpLink = "Don't have an account? Sign up";
export const expectedSignUpTitle = "Create Your Account";

// ============================================================================
// PROTECTED ROUTES
// ============================================================================

export const protectedRoutes = [
  "/(tabs)",
  "/(tabs)/profile",
  "/(tabs)/orders",
  "/staff/ViewOrders"
];

export const publicRoutes = [
  "/login",
  "/signup",
  "/PasswordRecovery"
];

// ============================================================================
// TEST STEPS
// ============================================================================

/*
 * STEP 1: Valid Email/Password Login
 * STEP 2: Invalid Password
 * STEP 3: Non-existent Email
 * STEP 4: Empty Email Field Validation
 * STEP 5: Empty Password Field Validation
 * STEP 6: Malformed Email Validation
 * STEP 7: Google OAuth - Successful Flow
 * STEP 8: Google OAuth - Cancelled by User
 * STEP 9: Apple OAuth - Successful Flow
 * STEP 10: Apple OAuth - Cancelled by User
 * STEP 11: Session Persistence - App Restart with Active Session
 * STEP 12: Session Expiry Handling
 * STEP 13: Successful Logout
 * STEP 14: Staff User Role-Based Routing
 * STEP 15: Protected Route Access - Authenticated User
 * STEP 16: Protected Route Access - Unauthenticated User
 */

export {};
