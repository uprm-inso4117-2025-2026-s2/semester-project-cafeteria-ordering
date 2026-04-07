/**
 * ============================================================================
 * TEST CASE: TC-AUTH-03 - User Sign Up with Valid Data
 * Author: Devlin Hahn
 * ============================================================================
 * 
 * Description
 * Verify that a new user can successfully register with valid personal information,
 * creating an account that allows subsequent login. This test validates both the UI
 * layout and validation logic work together correctly.
 * 
 * Type of tests: Unit/Integration tests for SignUpScreen component
 * 
 * Preconditions
 * - Sign Up page UI is implemented (SignUpScreen component)
 * - Form validation is implemented per validate() function
 * - Test environment is accessible
 * - No existing account with test email exists
 */

// ============================================================================
// IMPORTS - Get actual values from the component
// ============================================================================
import SignUpScreen from '../../../app/signup/index.tsx';
import { validate } from '../../../app/signup/index.tsx';

// ============================================================================
// TEST DATA - Actual values from the SignUpScreen component
// ============================================================================

// Valid user credentials for happy path testing
export const validUser1 = {
  fullName: "John Doe",
  email: "john.doe@university.edu",
  phone: "787-555-0123",
  password: "Test@1234",
  confirmPassword: "Test@1234"  // ✅ FIX: Added confirmPassword
};

export const validUser2 = {
  fullName: "María Sánchez",
  email: "m.sanchez@student.edu",
  phone: "939-555-6789",
  password: "Secure#2026",
  confirmPassword: "Secure#2026"  // ✅ FIX: Added confirmPassword
};

export const validUser3 = {
  fullName: "Lee Chen",
  email: "lee.chen@campus.edu",
  phone: "787-555-4321",
  password: "Pass@word1",
  confirmPassword: "Pass@word1"  // ✅ FIX: Added confirmPassword
};

// NEG-01: Invalid Email Format
export const invalidEmail = "notanemail";
export const getInvalidEmailError = () => {
  const result = validate({ 
    fullName: "Test", 
    email: invalidEmail, 
    password: "Test@1234",
    confirmPassword: "Test@1234",  // ✅ FIX: Added confirmPassword
    agreedToTerms: true 
  });
  return result.email; // Returns "Please enter a valid email address."
};

// NEG-02: Password too short (Boundary Value Analysis)
export const shortPassword = "short";
export const getShortPasswordError = () => {
  const result = validate({ 
    fullName: "Test", 
    email: "test@test.com", 
    password: shortPassword,
    confirmPassword: shortPassword,  // ✅ FIX: Added confirmPassword
    agreedToTerms: true 
  });
  return result.password; // Returns "Password must be at least 8 characters."
};

// NEG-03: Password missing uppercase
export const noUppercasePassword = "lowercaseonly123!";
export const getNoUppercaseError = () => {
  const result = validate({ 
    fullName: "Test", 
    email: "test@test.com", 
    password: noUppercasePassword,
    confirmPassword: noUppercasePassword,  // ✅ FIX: Added confirmPassword
    agreedToTerms: true 
  });
  return result.password; // Returns "Password must contain at least 1 uppercase letter."
};

// NEG-04: Password missing lowercase
export const noLowercasePassword = "UPPERCASE123!";
export const getNoLowercaseError = () => {
  const result = validate({ 
    fullName: "Test", 
    email: "test@test.com", 
    password: noLowercasePassword,
    confirmPassword: noLowercasePassword,  // ✅ FIX: Added confirmPassword
    agreedToTerms: true 
  });
  return result.password; // Returns "Password must contain at least 1 lowercase letter."
};

// NEG-05: Password missing number
export const noNumberPassword = "NoNumbers!";
export const getNoNumberError = () => {
  const result = validate({ 
    fullName: "Test", 
    email: "test@test.com", 
    password: noNumberPassword,
    confirmPassword: noNumberPassword,  // ✅ FIX: Added confirmPassword
    agreedToTerms: true 
  });
  return result.password; // Returns "Password must contain at least 1 number."
};

// NEG-06: Passwords don't match (✅ FIX: Now testable - removed the incorrect note)
export const password = "Test@1234";
export const mismatchedPassword = "Different123!";
export const getPasswordMismatchError = () => {
  const result = validate({ 
    fullName: "Test", 
    email: "test@test.com", 
    password: password,
    confirmPassword: mismatchedPassword,
    agreedToTerms: true 
  });
  return result.confirmPassword; // Returns "Passwords do not match."
};

// NEG-07: Empty fields validation
export const getEmptyFullNameError = () => {
  const result = validate({ 
    fullName: "", 
    email: "test@test.com", 
    password: "Test@1234",
    confirmPassword: "Test@1234",  // ✅ FIX: Added confirmPassword
    agreedToTerms: true 
  });
  return result.fullName; // Returns "Full name is required."
};

export const getEmptyEmailError = () => {
  const result = validate({ 
    fullName: "Test", 
    email: "", 
    password: "Test@1234",
    confirmPassword: "Test@1234",  // ✅ FIX: Added confirmPassword
    agreedToTerms: true 
  });
  return result.email; // Returns "Email is required."
};

export const getEmptyPasswordError = () => {
  const result = validate({ 
    fullName: "Test", 
    email: "test@test.com", 
    password: "",
    confirmPassword: "",  // ✅ FIX: Added confirmPassword
    agreedToTerms: true 
  });
  return result.password; // Returns "Password is required."
};

export const getTermsNotAgreedError = () => {
  const result = validate({ 
    fullName: "Test", 
    email: "test@test.com", 
    password: "Test@1234",
    confirmPassword: "Test@1234",  // ✅ FIX: Added confirmPassword
    agreedToTerms: false 
  });
  return result.terms; // Returns "You must agree to the Terms and Privacy Policy."
};

// UI Element Text (✅ FIX: Updated to match actual component)
export const expectedTitle = "Create Your Account";
export const expectedFields = ["Full Name", "Email", "Phone Number", "Password", "Confirm Password"];  // ✅ FIX: Added Confirm Password
export const expectedPasswordChecklist = [  // ✅ FIX: Now has 4 items including lowercase
  "At least 8 characters",
  "At least 1 lowercase",  // ✅ FIX: Added missing lowercase item
  "At least 1 uppercase", 
  "At least 1 number"
];
export const expectedButtonText = "Sign up";
export const expectedLoginLink = "Already have an account? Log in";
export const expectedTermsText = "I agree on all Terms and Privacy Policy";

// ============================================================================
// TEST STEPS
// ============================================================================
/*
 * 1. Navigate to Sign Up page at src/app/signup
 * 
 * 2. Verify UI elements:
 *    - Title matches expectedTitle
 *    - All fields in expectedFields array are present (✅ Now includes Confirm Password)
 *    - Password checklist shows expectedPasswordChecklist items (✅ Now has 4 items)
 *    - Terms text matches expectedTermsText
 *    - Button text matches expectedButtonText
 *    - Login link matches expectedLoginLink
 * 
 * 3. Enter valid Full Name using validUser1.fullName
 * 
 * 4. Enter valid Email using validUser1.email
 * 
 * 5. Enter valid Phone Number using validUser1.phone
 * 
 * 6. Enter valid Password using validUser1.password
 * 
 * 7. Enter matching Confirm Password using validUser1.confirmPassword  // ✅ FIX: Added this step
 * 
 * 8. Check the Terms checkbox
 * 
 * 9. Click the "Sign up" button
 * 
 * 10. Verify successful submission (supabase.auth.signUp called with user data)
 * 
 * 11. Negative Test Scenarios:
 *     a. TC-AUTH-03-NEG-01: Enter invalidEmail, verify error matches getInvalidEmailError()
 *     b. TC-AUTH-03-NEG-02: Enter shortPassword, verify error matches getShortPasswordError()
 *     c. TC-AUTH-03-NEG-03: Enter noUppercasePassword, verify error matches getNoUppercaseError()
 *     d. TC-AUTH-03-NEG-04: Enter noLowercasePassword, verify error matches getNoLowercaseError()
 *     e. TC-AUTH-03-NEG-05: Enter noNumberPassword, verify error matches getNoNumberError()
 *     f. TC-AUTH-03-NEG-06: Enter mismatched passwords, verify error matches getPasswordMismatchError()  // ✅ FIX: Now testable
 *     g. TC-AUTH-03-NEG-07: Submit empty form, verify errors match:
 *        - getEmptyFullNameError()
 *        - getEmptyEmailError() 
 *        - getEmptyPasswordError()
 *        - getTermsNotAgreedError()
 * 
 * 12. Correct all errors using validUser1 data and submit - form should succeed
 * 
 * 13. Test responsive design on mobile view - all elements remain visible and usable
 */

// ============================================================================
// EXPECTED RESULTS
// ============================================================================
/*
 * - User can successfully navigate to sign-up page
 * - All UI elements render correctly per component
 * - Form accepts valid input in all fields
 * - Validation errors appear correctly for invalid inputs with exact messages
 *   from validate() function
 * - Form submission is blocked until all validations pass
 * - Phone number is optional (no errors when empty)
 * - Confirm password validation works correctly  // ✅ FIX: Added this expectation
 * - Responsive design works on mobile viewports
 * - No console errors during any test steps
 */

// ============================================================================
// NOTES
// ============================================================================
/*
 * - Confirm Password field IS present in current SignUpScreen implementation  // ✅ FIX: Updated note
 * - Phone number is optional - no validation rules in validate() function
 * - Error messages are dynamically imported from validate() function to ensure
 *   tests always use the correct text even if the component changes
 * - Password checklist shows checkmarks (✓) when requirements are met (4 items total)
 * - The validate() function checks: fullName, email, password, confirmPassword, agreedToTerms  // ✅ FIX: Updated
 * 
 * Reviewed By: [To be filled by reviewer]
 */

// Export the component itself for developers to use
export { SignUpScreen };
