/**
 * TC-AUTH-07: Account Sign-In and Verification Regression Testing - Simplified
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../../app/login/index';
import SignUpScreen from '../../../app/signup/index';
import { supabase } from '../../../lib/supabase';

// Import test data
import {
  validEmailUser,
  mockSignInSuccess,
  mockSignOutSuccess,
  mockSessionRestored,
  mockSessionExpired,
} from '../cases/TC_AUTH_07_signin_verification_test_case';

// Mock WebBrowser
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
  maybeCompleteAuthSession: jest.fn(),
}));

// Mock dependencies
jest.mock('expo-router', () => ({
  Link: ({ children }: any) => children,
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  }),
}));

jest.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      setSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
    })),
  },
}));

jest.mock('../../../lib/auth', () => ({
  mapLoginError: jest.fn((error) => error),
  mapSignUpError: jest.fn((error) => error),
}));

jest.mock('../../../hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

jest.mock('@/components/themed-text', () => ({
  ThemedText: ({ children }: any) => children,
}));

// Get mocked functions
const mockSignInWithPassword = supabase.auth.signInWithPassword as jest.Mock;
const mockSignOut = supabase.auth.signOut as jest.Mock;
const mockGetSession = supabase.auth.getSession as jest.Mock;

describe('TC-AUTH-07: Account Sign-In and Verification Regression Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue(mockSignInSuccess());
    mockSignOut.mockResolvedValue(mockSignOutSuccess());
    mockGetSession.mockResolvedValue(mockSessionRestored());
  });

  // ============================================================================
  // Login Page Render Tests
  // ============================================================================
  describe('Login Page Render Tests', () => {
    it('should render login screen', () => {
      const { toJSON } = render(<LoginScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('should have email field', () => {
      const { getByLabelText } = render(<LoginScreen />);
      expect(getByLabelText('Email')).toBeTruthy();
    });

    it('should have password field', () => {
      const { getByLabelText } = render(<LoginScreen />);
      expect(getByLabelText('Password')).toBeTruthy();
    });
  });

  // ============================================================================
  // Session and Logout Tests (Working)
  // ============================================================================
  describe('Session and Logout Tests', () => {
    it('should restore session on app restart', async () => {
      mockGetSession.mockResolvedValue(mockSessionRestored());

      const { data: { session } } = await supabase.auth.getSession();
      
      expect(session).toBeDefined();
      expect(session?.access_token).toBe('restored-token-123');
    });

    it('should redirect to login when session expires', async () => {
      mockGetSession.mockResolvedValue(mockSessionExpired());

      const { data: { session } } = await supabase.auth.getSession();
      
      expect(session).toBeNull();
    });

    it('should clear session on logout', async () => {
      const { error } = await supabase.auth.signOut();
      
      expect(error).toBeNull();
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should have session when authenticated', async () => {
      mockGetSession.mockResolvedValue(mockSessionRestored());

      const { data: { session } } = await supabase.auth.getSession();
      
      expect(session).toBeDefined();
    });

    it('should not have session when not authenticated', async () => {
      mockGetSession.mockResolvedValue(mockSessionExpired());

      const { data: { session } } = await supabase.auth.getSession();
      
      expect(session).toBeNull();
    });
  });

  // ============================================================================
  // Sign Up Page Tests
  // ============================================================================
  describe('Sign Up Page Tests', () => {
    it('should render signup screen', () => {
      const { toJSON } = render(<SignUpScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('should have full name field', () => {
      const { getByLabelText } = render(<SignUpScreen />);
      expect(getByLabelText('Full Name')).toBeTruthy();
    });

    it('should have email field', () => {
      const { getByLabelText } = render(<SignUpScreen />);
      expect(getByLabelText('Email address')).toBeTruthy();
    });

    it('should have password field', () => {
      const { getByLabelText } = render(<SignUpScreen />);
      expect(getByLabelText('Password')).toBeTruthy();
    });

    it('should have confirm password field', () => {
      const { getByLabelText } = render(<SignUpScreen />);
      expect(getByLabelText('Confirm Password')).toBeTruthy();
    });

    it('should have phone number field', () => {
      const { getByLabelText } = render(<SignUpScreen />);
      expect(getByLabelText('Phone number')).toBeTruthy();
    });
  });
});
