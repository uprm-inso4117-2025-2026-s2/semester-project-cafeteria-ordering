import {
  PASSWORD_RESET_REQUEST_MESSAGE,
  getPasswordRecoveryRedirectTo,
  requestPasswordReset,
  updateRecoveredPassword,
  validatePasswordPolicy,
  type PasswordRecoveryAuthClient,
} from '../../../lib/password-recovery';
import { TC_AUTH_05_TEST_DATA } from '../cases/TC-AUTH-05_password_recovery_backend';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function createMockAuthClient(overrides: Partial<PasswordRecoveryAuthClient> = {}): PasswordRecoveryAuthClient {
  return {
    resetPasswordForEmail: async () => ({ error: null }),
    getSession: async () => ({ data: { session: { access_token: 'token' } }, error: null }),
    updateUser: async () => ({ error: null }),
    ...overrides,
  };
}

async function runTest(name: string, fn: () => Promise<void>): Promise<TestResult> {
  try {
    await fn();
    return { name, passed: true, details: 'Passed' };
  } catch (error: any) {
    return {
      name,
      passed: false,
      details: error?.message || 'Unknown failure',
    };
  }
}

async function testRequestPasswordResetSuccess(): Promise<void> {
  let calledEmail = '';
  let calledRedirectTo = '';

  const mockClient = createMockAuthClient({
    resetPasswordForEmail: async (email, options) => {
      calledEmail = email;
      calledRedirectTo = options?.redirectTo || '';
      return { error: null };
    },
  });

  const result = await requestPasswordReset(TC_AUTH_05_TEST_DATA.input.validEmail, {
    authClient: mockClient,
    redirectTo: TC_AUTH_05_TEST_DATA.input.redirectTo,
  });

  assert(result.message === PASSWORD_RESET_REQUEST_MESSAGE, 'Expected generic success response');
  assert(calledEmail === TC_AUTH_05_TEST_DATA.input.validEmail, 'Expected reset call with provided email');
  assert(
    calledRedirectTo === TC_AUTH_05_TEST_DATA.input.redirectTo,
    'Expected redirectTo to be forwarded to auth provider'
  );
}

async function testRequestPasswordResetRejectsInvalidEmail(): Promise<void> {
  const mockClient = createMockAuthClient({
    resetPasswordForEmail: async () => {
      throw new Error('Should not be called for invalid email');
    },
  });

  let failed = false;
  try {
    await requestPasswordReset(TC_AUTH_05_TEST_DATA.input.invalidEmail, {
      authClient: mockClient,
    });
  } catch (error: any) {
    failed = true;
    assert(error.message === 'Please enter a valid email address.', 'Expected invalid email error');
  }

  assert(failed, 'Expected requestPasswordReset to fail on invalid email');
}

async function testRequestPasswordResetMapsAuthError(): Promise<void> {
  const mockClient = createMockAuthClient({
    resetPasswordForEmail: async () => ({ error: { message: 'Internal auth detail' } }),
  });

  let failed = false;
  try {
    await requestPasswordReset(TC_AUTH_05_TEST_DATA.input.validEmail, {
      authClient: mockClient,
      redirectTo: TC_AUTH_05_TEST_DATA.input.redirectTo,
    });
  } catch (error: any) {
    failed = true;
    assert(
      error.message === 'Unable to process password reset request right now. Please try again.',
      'Expected generic request failure error'
    );
  }

  assert(failed, 'Expected requestPasswordReset to fail when provider returns error');
}

async function testUpdateRecoveredPasswordRejectsWeakPassword(): Promise<void> {
  const mockClient = createMockAuthClient();

  let failed = false;
  try {
    await updateRecoveredPassword(TC_AUTH_05_TEST_DATA.input.weakPassword, {
      authClient: mockClient,
    });
  } catch (error: any) {
    failed = true;
    assert(error.message === 'Password must be at least 8 characters.', 'Expected password policy error');
  }

  assert(failed, 'Expected updateRecoveredPassword to fail with weak password');
}

async function testUpdateRecoveredPasswordRequiresSession(): Promise<void> {
  const mockClient = createMockAuthClient({
    getSession: async () => ({ data: { session: null }, error: null }),
  });

  let failed = false;
  try {
    await updateRecoveredPassword(TC_AUTH_05_TEST_DATA.input.strongPassword, {
      authClient: mockClient,
    });
  } catch (error: any) {
    failed = true;
    assert(
      error.message === TC_AUTH_05_TEST_DATA.expectedMessages.invalidRecoverySession,
      'Expected invalid/expired recovery session message'
    );
  }

  assert(failed, 'Expected updateRecoveredPassword to fail without session');
}

async function testUpdateRecoveredPasswordSuccess(): Promise<void> {
  let updateCalledWith = '';

  const mockClient = createMockAuthClient({
    updateUser: async ({ password }) => {
      updateCalledWith = password;
      return { error: null };
    },
  });

  const result = await updateRecoveredPassword(TC_AUTH_05_TEST_DATA.input.strongPassword, {
    authClient: mockClient,
  });

  assert(result.message === TC_AUTH_05_TEST_DATA.expectedMessages.updateSuccess, 'Expected update success message');
  assert(
    updateCalledWith === TC_AUTH_05_TEST_DATA.input.strongPassword,
    'Expected updateUser to be called with provided password'
  );
}

async function testRedirectBuilderUsesDefaultOrOverride(): Promise<void> {
  const override = 'myapp://custom/recovery';
  const fromOverride = getPasswordRecoveryRedirectTo(override);
  const fromDefault = getPasswordRecoveryRedirectTo();

  assert(fromOverride === override, 'Expected override redirectTo to be used');
  assert(fromDefault.includes('://'), 'Expected default redirect URL format');
}

async function testPasswordPolicyAcceptsStrongPassword(): Promise<void> {
  const result = validatePasswordPolicy(TC_AUTH_05_TEST_DATA.input.strongPassword);
  assert(result.isValid, 'Expected strong password to pass policy validation');
}

async function runAuthPasswordRecoveryTests() {
  console.log(`\n[TEST] ${TC_AUTH_05_TEST_DATA.caseId} Password Recovery Backend Validation\n`);

  const tests: Array<() => Promise<TestResult>> = [
    () => runTest('Request reset succeeds with generic response', testRequestPasswordResetSuccess),
    () => runTest('Request reset rejects invalid email', testRequestPasswordResetRejectsInvalidEmail),
    () => runTest('Request reset maps provider errors to safe message', testRequestPasswordResetMapsAuthError),
    () => runTest('Update password rejects weak passwords', testUpdateRecoveredPasswordRejectsWeakPassword),
    () => runTest('Update password requires active recovery session', testUpdateRecoveredPasswordRequiresSession),
    () => runTest('Update password succeeds with valid recovery session', testUpdateRecoveredPasswordSuccess),
    () => runTest('Redirect helper supports override and defaults', testRedirectBuilderUsesDefaultOrOverride),
    () => runTest('Password policy validator accepts strong password', testPasswordPolicyAcceptsStrongPassword),
  ];

  const results: TestResult[] = [];

  for (const test of tests) {
    const result = await test();
    results.push(result);
    console.log(`${result.passed ? '[PASS]' : '[FAIL]'} ${result.name}`);
    if (!result.passed) {
      console.log(`   ${result.details}`);
    }
  }

  const passed = results.filter(r => r.passed).length;
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[SUMMARY] ${passed}/${results.length} tests passed`);

  if (passed !== results.length) {
    process.exit(1);
  }
}

if (require.main === module) {
  runAuthPasswordRecoveryTests().catch(error => {
    console.error('[ERROR] Failed to run password recovery backend tests:', error);
    process.exit(1);
  });
}

export { runAuthPasswordRecoveryTests };
