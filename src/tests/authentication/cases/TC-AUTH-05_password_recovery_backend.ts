/*
Password Recovery Backend Validation TC
Author: GitHub Copilot

Description
Validate backend password recovery routines for reset request and password update security checks.
Test type: Unit/Service

Preconditions
* Password recovery module exists at src/lib/password-recovery.ts.
* Script file src/tests/authentication/scripts/TC-AUTH-05_password_recovery_backend.test.ts is available.
* No live Supabase project is required because tests use mocked auth clients.
*/

export const TC_AUTH_05_INPUT_VALUES = {
  validEmail: 'valid.user@uni.edu',
  invalidEmail: 'notanemail',
  weakPassword: 'short',
  strongPassword: 'SecureReset2026A',
  redirectTo: 'semesterprojectcafeteriaordering://PasswordRecovery/resetPassword',
} as const;

export const TC_AUTH_05_TEST_DATA = {
  caseId: 'TC-AUTH-05',
  env: {
    redirectVarName: 'EXPO_PUBLIC_PASSWORD_RESET_REDIRECT_TO',
  },
  input: TC_AUTH_05_INPUT_VALUES,
  expectedMessages: {
    genericRequestSuccess:
      'If an account exists for that email, a password reset link has been sent.',
    updateSuccess: 'Password updated successfully.',
    invalidRecoverySession:
      'Recovery link is invalid or expired. Please request a new password reset link.',
  },
} as const;
