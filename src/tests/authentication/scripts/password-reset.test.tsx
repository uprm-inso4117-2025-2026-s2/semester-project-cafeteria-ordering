/**
 * ============================================================================
 * TEST CASE: TC-AUTH-05 - Password Reset and Recovery Flow Verification
 * ============================================================================
 * @id TC-AUTH-05
 * @author Januel E. Torres Marquez
 * @date 2026-03-15
 * ============================================================================
 * @description
 * Verify that users can securely and correctly request a password reset link
 * and successfully update their password when locked out of their accounts.
 * This test validates email submission, link reception, and new password
 * constraints.
 * ============================================================================
 * @preconditions
 * - "Forgot Password" UI and "Reset Password" UI are implemented and accessible.
 * - Form validation is implemented for both views.
 * - Test environment database contains a registered user account.
 * - Email delivery service is configured to capture reset links.
 * ============================================================================
 * @test_data
 * Valid Scenarios:
 * | Field            | Valid Value 1          |
 * |------------------|------------------------|
 * | Recovery Email   | valid.user@uni.edu     |
 * | New Password     | SecureReset2026!       |
 * | Confirm Password | SecureReset2026!       |
 *
 * Invalid Scenarios:
 * | ID               | Field Under Test     | Input Value         | Expected Error                      | Methodology         |
 * |------------------|---------------------|---------------------|-------------------------------------|---------------------|
 * | TC-AUTH-05-NEG-01| Recovery Email      | "notanemail"        | "Invalid email format"              | EP (invalid format) |
 * | TC-AUTH-05-NEG-02| Recovery Email      | [empty]             | "Email is required"                 | EP (empty required) |
 * | TC-AUTH-05-NEG-03| Recovery Email      | "ghost@uni.edu"     | (Generic success message)           | EP (unregistered)   |
 * | TC-AUTH-05-NEG-04| New Password        | "short"             | "Must be at least 8 characters"     | BVA (below minimum) |
 * | TC-AUTH-05-NEG-05| Confirm Password    | "DifferentPass1!"   | "Passwords must match"              | EP (mismatch)       |
 *
 * Methodology Used:
 * - Equivalence Partitioning (EP): Testing valid/invalid classes of inputs
 * - Boundary Value Analysis (BVA): Testing minimum password length boundary
 * ============================================================================
 * @test_steps
 */

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

import ForgotPassword from "../../../app/PasswordRecovery/index";
import ResetPassword from "../../../app/PasswordRecovery/resetPassword";
import {
  requestPasswordReset,
  updateRecoveredPassword,
} from "../../../lib/password-recovery";

// Get mocked functions
const mockRequestPasswordReset = requestPasswordReset as jest.MockedFunction<
  typeof requestPasswordReset
>;
const mockUpdateRecoveredPassword =
  updateRecoveredPassword as jest.MockedFunction<
    typeof updateRecoveredPassword
  >;

// Mock expo-router with a trackable replace function
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  Link: ({ children }: any) => children,
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe("TC-AUTH-05: Password Reset and Recovery Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // STEP 1: Navigate to "Forgot Password" page
  // ============================================================================
  // Expected: View displays with "Forgot Password" title, an email input field,
  // and a "Send recovery link" button.
  // ============================================================================
  describe("Step 1: Navigate to Forgot Password page", () => {
    it("should render the Forgot Password screen with title", () => {
      render(<ForgotPassword />);
      expect(screen.getByText(/forgot password/i)).toBeTruthy();
    });

    it("should display email field label and send recovery link button", () => {
      render(<ForgotPassword />);
      expect(screen.getByText("Email")).toBeTruthy();
      expect(screen.getByText(/send recovery link/i)).toBeTruthy();
    });
  });

  // ============================================================================
  // STEP 2: Test Invalid Email Submissions
  // ============================================================================
  // Input: Submit empty email field, then submit "notanemail"
  // Expected: Validation blocks submission and shows respective error messages.
  // ============================================================================
  describe("Step 2: Test Invalid Email Submissions", () => {
    // TC-AUTH-05-NEG-02: Empty email
    it("NEG-02: should show error when email is empty", async () => {
      render(<ForgotPassword />);

      fireEvent.press(screen.getByText(/send recovery link/i));

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeTruthy();
      });

      expect(mockRequestPasswordReset).not.toHaveBeenCalled();
    });

    // TC-AUTH-05-NEG-01: Invalid email format
    it("NEG-01: should show error for invalid email format", async () => {
      render(<ForgotPassword />);

      const emailInput = screen.getByLabelText("input"); // InputField uses nativeID={label}
      fireEvent.changeText(emailInput, "notanemail");
      fireEvent.press(screen.getByText(/send recovery link/i));

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeTruthy();
      });

      expect(mockRequestPasswordReset).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // STEP 3: Request Reset for Unregistered Email
  // ============================================================================
  // Input: Enter "ghost@uni.edu" and click "Send Reset Link"
  // Expected: Form submits, UI shows generic success message (popup).
  // For security, no distinction between registered and unregistered emails.
  // ============================================================================
  describe("Step 3: Request Reset for Unregistered Email", () => {
    it("NEG-03: should show generic success message for unregistered email", async () => {
      mockRequestPasswordReset.mockResolvedValueOnce({
        message:
          "If an account exists for that email, a password reset link has been sent.",
      });

      render(<ForgotPassword />);

      const emailInput = screen.getByLabelText("input");
      fireEvent.changeText(emailInput, "ghost@uni.edu");
      fireEvent.press(screen.getByText(/send recovery link/i));

      await waitFor(() => {
        expect(mockRequestPasswordReset).toHaveBeenCalledWith("ghost@uni.edu");
        expect(screen.getByText(/check your email/i)).toBeTruthy();
      });
    });
  });

  // ============================================================================
  // STEP 4: Request Reset for Valid Email
  // ============================================================================
  // Input: Enter "valid.user@uni.edu" and click "Send Reset Link"
  // Expected: UI shows generic success popup message.
  // ============================================================================
  describe("Step 4: Request Reset for Valid Email", () => {
    it("should show success popup when valid email is submitted", async () => {
      mockRequestPasswordReset.mockResolvedValueOnce({
        message:
          "If an account exists for that email, a password reset link has been sent.",
      });

      render(<ForgotPassword />);

      const emailInput = screen.getByLabelText("input");
      fireEvent.changeText(emailInput, "valid.user@uni.edu");
      fireEvent.press(screen.getByText(/send recovery link/i));

      await waitFor(() => {
        expect(mockRequestPasswordReset).toHaveBeenCalledWith(
          "valid.user@uni.edu"
        );
        // Popup should appear with success message
        expect(screen.getByText(/check your email/i)).toBeTruthy();
        expect(
          screen.getByText(/password reset link has been sent/i)
        ).toBeTruthy();
      });
    });

    it("should show Return to Login button in success popup", async () => {
      mockRequestPasswordReset.mockResolvedValueOnce({
        message:
          "If an account exists for that email, a password reset link has been sent.",
      });

      render(<ForgotPassword />);

      const emailInput = screen.getByLabelText("input");
      fireEvent.changeText(emailInput, "valid.user@uni.edu");
      fireEvent.press(screen.getByText(/send recovery link/i));

      await waitFor(() => {
        expect(screen.getByText(/return to login/i)).toBeTruthy();
      });
    });

    it("should navigate to login when Return to Login is pressed", async () => {
      mockRequestPasswordReset.mockResolvedValueOnce({
        message:
          "If an account exists for that email, a password reset link has been sent.",
      });

      render(<ForgotPassword />);

      const emailInput = screen.getByLabelText("input");
      fireEvent.changeText(emailInput, "valid.user@uni.edu");
      fireEvent.press(screen.getByText(/send recovery link/i));

      await waitFor(() => {
        expect(screen.getByText(/return to login/i)).toBeTruthy();
      });

      fireEvent.press(screen.getByText(/return to login/i));

      expect(mockReplace).toHaveBeenCalledWith("/login");
    });

    it("should show error message when reset request fails", async () => {
      mockRequestPasswordReset.mockRejectedValueOnce(
        new Error("Unable to send password reset email right now. Please try again.")
      );

      render(<ForgotPassword />);

      const emailInput = screen.getByLabelText("input");
      fireEvent.changeText(emailInput, "valid.user@uni.edu");
      fireEvent.press(screen.getByText(/send recovery link/i));

      await waitFor(() => {
        expect(
          screen.getByText(/unable to send password reset email/i)
        ).toBeTruthy();
      });
    });
  });

  // ============================================================================
  // STEP 5: Access Reset Link and Verify UI
  // ============================================================================
  // Input: Navigate to the tokenized URL received in Step 4.
  // Expected: "Reset Password" view displays with "New Password"
  // and "Confirm Password" fields.
  // ============================================================================
  describe("Step 5: Verify Reset Password UI", () => {
    it("should render the Reset Password screen with title", () => {
      render(<ResetPassword />);
      expect(screen.getByText("Reset Password")).toBeTruthy();
    });

    it("should display New Password and Confirm Password fields", () => {
      render(<ResetPassword />);
      expect(screen.getByText(/new password/i)).toBeTruthy();
      expect(screen.getByText(/confirm password/i)).toBeTruthy();
    });

    it("should display password checklist", () => {
      render(<ResetPassword />);
      expect(screen.getByText(/at least 8 characters/i)).toBeTruthy();
      expect(screen.getByText(/at least 1 uppercase/i)).toBeTruthy();
      expect(screen.getByText(/at least 1 lowercase/i)).toBeTruthy();
      expect(screen.getByText(/at least 1 number/i)).toBeTruthy();
    });

    it("should display Reset password button", () => {
      render(<ResetPassword />);
      expect(screen.getByLabelText("Reset password")).toBeTruthy();
    });
  });

  // ============================================================================
  // STEP 6: Test Password Validations (Length and Mismatch)
  // ============================================================================
  // Input: Enter "short" in New Password.
  // Expected: "Must be at least 8 characters" error appears.
  //
  // Input: Enter "SecureReset2026!" in New Password, "DifferentPass1!" in Confirm.
  // Expected: "Passwords must match" error appears. Submission blocked.
  // ============================================================================
  describe("Step 6: Test Password Validations", () => {
    // TC-AUTH-05-NEG-04: Password too short
    it("NEG-04: should show error for password shorter than 8 characters", async () => {
      render(<ResetPassword />);

      const passwordInput = screen.getByLabelText("password");
      fireEvent.changeText(passwordInput, "short");
      fireEvent.press(screen.getByLabelText(/reset password/i));

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 8 characters/i)
        ).toBeTruthy();
      });

      expect(mockUpdateRecoveredPassword).not.toHaveBeenCalled();
    });

    // TC-AUTH-05-NEG-05: Passwords don't match
    it("NEG-05: should show error when passwords don't match", async () => {
      render(<ResetPassword />);

      const passwordInput = screen.getByLabelText("password");
      const confirmInput = screen.getAllByLabelText("input")[0]; // Confirm field has no label
      fireEvent.changeText(passwordInput, "SecureReset2026!");
      fireEvent.changeText(confirmInput, "DifferentPass1!");
      fireEvent.press(screen.getByLabelText(/reset password/i));

      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).toBeTruthy();
      });

      expect(mockUpdateRecoveredPassword).not.toHaveBeenCalled();
    });

    it("should show error when new password is empty", async () => {
      render(<ResetPassword />);

      fireEvent.press(screen.getByLabelText(/reset password/i));

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeTruthy();
      });

      expect(mockUpdateRecoveredPassword).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // STEP 7: Submit Valid New Password
  // ============================================================================
  // Input: Enter "SecureReset2026!" in both fields and submit.
  // Expected: Password successfully updates. User sees success popup.
  // ============================================================================
  describe("Step 7: Submit Valid New Password", () => {
    it("should successfully reset password with valid matching passwords", async () => {
      mockUpdateRecoveredPassword.mockResolvedValueOnce({
        message: "Password updated successfully.",
      });

      render(<ResetPassword />);

      const passwordInput = screen.getByLabelText("password");
      const confirmInput = screen.getAllByLabelText("input")[0];
      fireEvent.changeText(passwordInput, "SecureReset2026!");
      fireEvent.changeText(confirmInput, "SecureReset2026!");
      fireEvent.press(screen.getByLabelText(/reset password/i));

      await waitFor(() => {
        expect(mockUpdateRecoveredPassword).toHaveBeenCalledWith(
          "SecureReset2026!"
        );
        // Success popup should appear
        expect(screen.getByText(/password reset complete/i)).toBeTruthy();
      });
    });

    it("should show error when password update fails", async () => {
      mockUpdateRecoveredPassword.mockRejectedValueOnce(
        new Error("Unable to update password right now. Please try again.")
      );

      render(<ResetPassword />);

      const passwordInput = screen.getByLabelText("password");
      const confirmInput = screen.getAllByLabelText("input")[0];
      fireEvent.changeText(passwordInput, "SecureReset2026!");
      fireEvent.changeText(confirmInput, "SecureReset2026!");
      fireEvent.press(screen.getByLabelText(/reset password/i));

      await waitFor(() => {
        expect(
          screen.getByText(/unable to update password/i)
        ).toBeTruthy();
      });
    });

    it("should navigate to signup when Back to sign up is pressed after reset", async () => {
      mockUpdateRecoveredPassword.mockResolvedValueOnce({
        message: "Password updated successfully.",
      });

      render(<ResetPassword />);

      const passwordInput = screen.getByLabelText("password");
      const confirmInput = screen.getAllByLabelText("input")[0];
      fireEvent.changeText(passwordInput, "SecureReset2026!");
      fireEvent.changeText(confirmInput, "SecureReset2026!");
      fireEvent.press(screen.getByLabelText(/reset password/i));

      await waitFor(() => {
        expect(screen.getByText(/back to sign up/i)).toBeTruthy();
      });

      fireEvent.press(screen.getByText(/back to sign up/i));

      expect(mockReplace).toHaveBeenCalledWith("/signup");
    });
  });
});

// ============================================================================
// @expected_results
// ============================================================================
/**
 * - Form validation prevents invalid or empty email submissions.
 * - System prevents email enumeration by showing identical success messages for
 *   both registered and unregistered emails.
 * - Reset link request is successfully triggered for valid users.
 * - Password update form enforces minimum length and matching validations.
 * - Password successfully updates and shows success confirmation.
 * - Navigation works correctly (Return to Login, Back to sign up).
 * - Error states are properly displayed when backend requests fail.
 * - No console errors occur during the flow.
 */

export {};
