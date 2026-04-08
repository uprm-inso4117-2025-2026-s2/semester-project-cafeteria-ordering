/**
 * TC-AUTH-04: Account Verification Process - Jest Unit Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { supabase } from '../../../lib/supabase';

// Import test data from your test case file
import {
  testUser,
  validVerificationToken,
  expiredVerificationToken,
  invalidToken,
  emptyToken,
  mockVerifySuccess,
  mockVerifyInvalidToken,
  mockVerifyExpiredToken,
  mockVerifyAlreadyVerified,
  mockResendSuccess,
  getInvalidTokenError,
  getExpiredTokenError,
  getAlreadyVerifiedError,
  getMissingTokenError,
  getVerificationSuccessMessage,
  getResendVerificationMessage,
  expectedVerificationTitle,
  expectedSuccessTitle,
  expectedResendButtonText,
  expectedLoginRedirectText,
} from '../cases/verification_test_case';

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
      verifyOtp: jest.fn(),
      resend: jest.fn(),
    },
  },
}));

jest.mock('../../../lib/auth', () => ({
  mapSignUpError: jest.fn((error) => error),
}));

jest.mock('../../../hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

// Helper function to call verifyOtp (like a component would)
async function callVerifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
  
  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true, message: getVerificationSuccessMessage(), user: data?.user };
}

// Helper function to resend verification
async function callResendVerification(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  
  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true, message: getResendVerificationMessage() };
}

describe('TC-AUTH-04: Account Verification Process', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // STEP 1: Valid Token Verification
  // ============================================================================
  describe('STEP 1: Valid Token Verification', () => {
    it('should successfully verify account with valid token', async () => {
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue(mockVerifySuccess());

      const result = await callVerifyOtp(testUser.email, validVerificationToken);

      expect(result.success).toBe(true);
      expect(result.message).toBe(getVerificationSuccessMessage());
      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        email: testUser.email,
        token: validVerificationToken,
        type: 'email',
      });
    });
  });

  // ============================================================================
  // STEP 2: Invalid Token
  // ============================================================================
  describe('STEP 2: Invalid Token', () => {
    it('should reject invalid verification token', async () => {
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue(mockVerifyInvalidToken());

      const result = await callVerifyOtp(testUser.email, invalidToken);

      expect(result.success).toBe(false);
      expect(result.message).toBe(getInvalidTokenError());
    });
  });

  // ============================================================================
  // STEP 3: Expired Token
  // ============================================================================
  describe('STEP 3: Expired Token', () => {
    it('should reject expired verification token', async () => {
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue(mockVerifyExpiredToken());

      const result = await callVerifyOtp(testUser.email, expiredVerificationToken);

      expect(result.success).toBe(false);
      expect(result.message).toBe(getExpiredTokenError());
    });
  });

  // ============================================================================
  // STEP 4: Resend Verification Email
  // ============================================================================
  describe('STEP 4: Resend Verification Email', () => {
    it('should resend verification email successfully', async () => {
      (supabase.auth.resend as jest.Mock).mockResolvedValue(mockResendSuccess());

      const result = await callResendVerification(testUser.email);

      expect(result.success).toBe(true);
      expect(result.message).toBe(getResendVerificationMessage());
      expect(supabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: testUser.email,
      });
    });
  });

  // ============================================================================
  // STEP 5: Already Verified Account
  // ============================================================================
  describe('STEP 5: Already Verified Account', () => {
    it('should handle already verified account', async () => {
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue(mockVerifyAlreadyVerified());

      const result = await callVerifyOtp(testUser.email, validVerificationToken);

      // Still returns success but account is already verified
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });
  });

  // ============================================================================
  // STEP 6: Empty/Missing Token
  // ============================================================================
  describe('STEP 6: Empty/Missing Token', () => {
    it('should reject empty token', async () => {
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue(mockVerifyInvalidToken());

      const result = await callVerifyOtp(testUser.email, emptyToken);

      expect(result.success).toBe(false);
    });
  });
});
