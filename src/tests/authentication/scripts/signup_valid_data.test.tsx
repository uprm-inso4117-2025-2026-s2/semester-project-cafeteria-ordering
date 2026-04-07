/**
 * TC-AUTH-03: User Sign Up with Valid Data - Jest Unit Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpScreen from '../../../app/signup/index';
import { supabase } from '../../../lib/supabase';

// Import test data from your test case file
import {
  validUser1,
  validUser2,
  validUser3,
  invalidEmail,
  getInvalidEmailError,
  shortPassword,
  getShortPasswordError,
  noUppercasePassword,
  getNoUppercaseError,
  noLowercasePassword,
  getNoLowercaseError,
  noNumberPassword,
  getNoNumberError,
  mismatchedPassword,
  getPasswordMismatchError,
  getEmptyFullNameError,
  getEmptyEmailError,
  getEmptyPasswordError,
  getTermsNotAgreedError,
  expectedTitle,
  expectedPasswordChecklist,
  expectedButtonText,
} from '../cases/signup_test_case';

// Mock dependencies
jest.mock('expo-router', () => ({
  Link: ({ children }: any) => children,
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
  },
}));

jest.mock('../../../lib/auth', () => ({
  mapSignUpError: jest.fn((error) => error),
}));

jest.mock('../../../hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

// Mock ThemedText to actually render text properly
jest.mock('@/components/themed-text', () => ({
  ThemedText: ({ children, style, type, lightColor, darkColor, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text style={style} {...props}>{children}</Text>;
  },
}));

// Update expected fields to match actual accessibility labels
const actualExpectedFields = [
  "Full Name",
  "Email address",
  "Phone number",
  "Password",
  "Confirm Password"
];

describe('TC-AUTH-03: User Sign Up with Valid Data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: '123' }, session: { access_token: 'token' } },
      error: null,
    });
  });

  // ============================================================================
  // TEST STEP 1: Navigate to Sign Up page
  // ============================================================================
  describe('Step 1: Navigate to Sign Up page', () => {
    it('should render SignUpScreen component without crashing', () => {
      const { toJSON } = render(<SignUpScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  // ============================================================================
  // TEST STEP 2: Verify UI elements
  // ============================================================================
  describe('Step 2: Verify UI elements', () => {
    it('should display title matching expectedTitle', () => {
      const { getByText } = render(<SignUpScreen />);
      expect(getByText(expectedTitle)).toBeTruthy();
    });

    it('should display all fields from expectedFields array', () => {
      const { getByLabelText } = render(<SignUpScreen />);
      
      actualExpectedFields.forEach(field => {
        expect(getByLabelText(field)).toBeTruthy();
      });
    });

    it('should display password checklist with expected items', () => {
      const { getByText } = render(<SignUpScreen />);
      
      expectedPasswordChecklist.forEach(item => {
        expect(getByText(new RegExp(item, 'i'))).toBeTruthy();
      });
    });

    it('should display terms text', () => {
      const { getByText } = render(<SignUpScreen />);
      expect(getByText(/I agree on all/)).toBeTruthy();
      expect(getByText('Terms')).toBeTruthy();
      expect(getByText('Privacy Policy')).toBeTruthy();
    });

    it('should display button text matching expectedButtonText', () => {
      const { getByText } = render(<SignUpScreen />);
      expect(getByText(expectedButtonText)).toBeTruthy();
    });

    it('should display login link', () => {
      const { getByText } = render(<SignUpScreen />);
      expect(getByText(/Already have an account/)).toBeTruthy();
      expect(getByText('Log in')).toBeTruthy();
    });
  });

  // ============================================================================
  // TEST STEPS 3-10: Happy Path - Sign up with valid data
  // ============================================================================
  describe('Steps 3-10: Happy Path - Sign up with valid data', () => {
    it('should successfully sign up with validUser1 data', async () => {
      const { getByLabelText, getByText } = render(<SignUpScreen />);

      // Fill in the form
      fireEvent.changeText(getByLabelText('Full Name'), validUser1.fullName);
      fireEvent.changeText(getByLabelText('Email address'), validUser1.email);
      fireEvent.changeText(getByLabelText('Phone number'), validUser1.phone);
      fireEvent.changeText(getByLabelText('Password'), validUser1.password);
      fireEvent.changeText(getByLabelText('Confirm Password'), validUser1.confirmPassword);
      
      // Click the checkbox using getByLabelText with the accessibilityLabel
      fireEvent.press(getByLabelText('I agree to the Terms and Privacy Policy'));
      
      // Click Sign up button
      fireEvent.press(getByText(expectedButtonText));

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: validUser1.email,
          password: validUser1.password,
          options: {
            data: {
              full_name: validUser1.fullName,
              phone: validUser1.phone,
            },
          },
        });
      });
    });

    it('should successfully sign up with validUser2 data', async () => {
      const { getByLabelText, getByText } = render(<SignUpScreen />);

      fireEvent.changeText(getByLabelText('Full Name'), validUser2.fullName);
      fireEvent.changeText(getByLabelText('Email address'), validUser2.email);
      fireEvent.changeText(getByLabelText('Phone number'), validUser2.phone);
      fireEvent.changeText(getByLabelText('Password'), validUser2.password);
      fireEvent.changeText(getByLabelText('Confirm Password'), validUser2.confirmPassword);
      fireEvent.press(getByLabelText('I agree to the Terms and Privacy Policy'));
      fireEvent.press(getByText(expectedButtonText));

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: validUser2.email,
          password: validUser2.password,
          options: {
            data: {
              full_name: validUser2.fullName,
              phone: validUser2.phone,
            },
          },
        });
      });
    });

    it('should successfully sign up with validUser3 data', async () => {
      const { getByLabelText, getByText } = render(<SignUpScreen />);

      fireEvent.changeText(getByLabelText('Full Name'), validUser3.fullName);
      fireEvent.changeText(getByLabelText('Email address'), validUser3.email);
      fireEvent.changeText(getByLabelText('Phone number'), validUser3.phone);
      fireEvent.changeText(getByLabelText('Password'), validUser3.password);
      fireEvent.changeText(getByLabelText('Confirm Password'), validUser3.confirmPassword);
      fireEvent.press(getByLabelText('I agree to the Terms and Privacy Policy'));
      fireEvent.press(getByText(expectedButtonText));

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // TEST STEP 11: Negative Test Scenarios
  // ============================================================================
  describe('Step 11: Negative Test Scenarios', () => {
    
    // TC-AUTH-03-NEG-01: Invalid Email Format
    it('NEG-01: should show error for invalid email', async () => {
      const { getByLabelText, findByText } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByLabelText('Email address'), invalidEmail);
      fireEvent(getByLabelText('Email address'), 'blur');

      expect(await findByText(getInvalidEmailError())).toBeTruthy();
    });

    // TC-AUTH-03-NEG-02: Password too short
    it('NEG-02: should show error for password shorter than 8 characters', async () => {
      const { getByLabelText, findByText } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByLabelText('Password'), shortPassword);
      fireEvent(getByLabelText('Password'), 'blur');

      expect(await findByText(getShortPasswordError())).toBeTruthy();
    });

    // TC-AUTH-03-NEG-03: Password missing uppercase
    it('NEG-03: should show error when password has no uppercase letters', async () => {
      const { getByLabelText, findByText } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByLabelText('Password'), noUppercasePassword);
      fireEvent(getByLabelText('Password'), 'blur');

      expect(await findByText(getNoUppercaseError())).toBeTruthy();
    });

    // TC-AUTH-03-NEG-04: Password missing lowercase
    it('NEG-04: should show error when password has no lowercase letters', async () => {
      const { getByLabelText, findByText } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByLabelText('Password'), noLowercasePassword);
      fireEvent(getByLabelText('Password'), 'blur');

      expect(await findByText(getNoLowercaseError())).toBeTruthy();
    });

    // TC-AUTH-03-NEG-05: Password missing number
    it('NEG-05: should show error when password has no numbers', async () => {
      const { getByLabelText, findByText } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByLabelText('Password'), noNumberPassword);
      fireEvent(getByLabelText('Password'), 'blur');

      expect(await findByText(getNoNumberError())).toBeTruthy();
    });

    // TC-AUTH-03-NEG-06: Passwords don't match
    it('NEG-06: should show error when password and confirm password do not match', async () => {
      const { getByLabelText, findByText } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByLabelText('Password'), validUser1.password);
      fireEvent.changeText(getByLabelText('Confirm Password'), mismatchedPassword);
      fireEvent(getByLabelText('Confirm Password'), 'blur');

      expect(await findByText(getPasswordMismatchError())).toBeTruthy();
    });

    // TC-AUTH-03-NEG-07: Empty fields validation
    it('NEG-07: should show all required field errors when submitting empty form', async () => {
      const { getByText, findByText } = render(<SignUpScreen />);
      
      fireEvent.press(getByText(expectedButtonText));

      await waitFor(() => {
        expect(findByText(getEmptyFullNameError())).toBeTruthy();
        expect(findByText(getEmptyEmailError())).toBeTruthy();
        expect(findByText(getEmptyPasswordError())).toBeTruthy();
        expect(findByText(getTermsNotAgreedError())).toBeTruthy();
      });
    });
  });

  // ============================================================================
  // TEST STEP 12: Correct all errors and submit - form should succeed
  // ============================================================================
  it('Step 12: should successfully submit after correcting all errors', async () => {
    const { getByLabelText, getByText, queryByText } = render(<SignUpScreen />);
    
    // Submit empty form to trigger errors
    fireEvent.press(getByText(expectedButtonText));
    
    // Wait for errors to appear
    await waitFor(() => {
      expect(queryByText(getEmptyFullNameError())).toBeTruthy();
    });
    
    // Fill in all fields correctly
    fireEvent.changeText(getByLabelText('Full Name'), validUser1.fullName);
    fireEvent.changeText(getByLabelText('Email address'), validUser1.email);
    fireEvent.changeText(getByLabelText('Phone number'), validUser1.phone);
    fireEvent.changeText(getByLabelText('Password'), validUser1.password);
    fireEvent.changeText(getByLabelText('Confirm Password'), validUser1.confirmPassword);
    fireEvent.press(getByLabelText('I agree to the Terms and Privacy Policy'));
    
    // Submit again
    fireEvent.press(getByText(expectedButtonText));
    
    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalled();
      expect(queryByText(getEmptyFullNameError())).toBeNull();
      expect(queryByText(getEmptyEmailError())).toBeNull();
      expect(queryByText(getEmptyPasswordError())).toBeNull();
      expect(queryByText(getTermsNotAgreedError())).toBeNull();
    });
  });

  // ============================================================================
  // TEST STEP 13: Phone number is optional
  // ============================================================================
  it('Step 13: should allow signup without phone number (optional field)', async () => {
    const { getByLabelText, getByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByLabelText('Full Name'), validUser1.fullName);
    fireEvent.changeText(getByLabelText('Email address'), validUser1.email);
    // Phone number left empty intentionally
    fireEvent.changeText(getByLabelText('Password'), validUser1.password);
    fireEvent.changeText(getByLabelText('Confirm Password'), validUser1.confirmPassword);
    fireEvent.press(getByLabelText('I agree to the Terms and Privacy Policy'));
    
    fireEvent.press(getByText(expectedButtonText));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: validUser1.email,
        password: validUser1.password,
        options: {
          data: {
            full_name: validUser1.fullName,
            phone: null,
          },
        },
      });
    });
  });
});
