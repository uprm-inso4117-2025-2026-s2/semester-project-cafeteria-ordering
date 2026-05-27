// Command to run: `npx tsx src/tests/authentication/scripts/FT-AUTH-10_fuzz_test_inputs.ts`
import { strict as assert } from 'node:assert';

const STRING_LENGTHS = [0, 1, 4, 8, 16, 32, 64, 128, 256];
const FUZZ_ROUNDS = 12;

const BASE_LOGIN = {
  emailOrUsername: 'valid.user@uni.edu',
  password: 'ValidPass1',
};

const BASE_SIGNUP = {
  fullName: 'Test User',
  email: 'valid.user@uni.edu',
  password: 'ValidPass1',
  confirmPassword: 'ValidPass1',
  agreedToTerms: true,
};

let failureCount = 0;
let passCount = 0;

function printHeader(message: string): void {
  console.log('==============================');
  console.log(message);
  console.log('==============================');
}

function logPass(message: string): void {
  passCount += 1;
  console.log(`PASS: ${message}`);
}

function logFail(message: string, error: unknown): void {
  failureCount += 1;
  if (error instanceof Error) {
    console.error(`FAIL: ${message} - ${error.message}`);
    return;
  }
  console.error(`FAIL: ${message} - Unknown error`);
}

function repeatChar(char: string, length: number): string {
  return char.repeat(length);
}

function buildFuzzPayloads(): string[] {
  const payloads = new Set<string>();

  STRING_LENGTHS.forEach((length) => {
    payloads.add(repeatChar('a', length));
    payloads.add(repeatChar('1', length));
    payloads.add(repeatChar(' ', length));
  });

  [
    '',
    ' ',
    '   ',
    '\t',
    '\n',
    '\u0000',
    '!-_+={}',
    '!@#$%^&*()_+{}|:"<>?`~[]\\;\',./',
    "' OR '1'='1",
    '" OR "1"="1',
    "'; DROP TABLE users; --",
    'admin\'--',
    '<script>alert(1)</script>',
    'user@',
    'user@domain',
    'user@domain..com',
    'a@b',
    '-1',
    '0',
    '1234567890',
    'cafe',
    'café',
    'ユーザー',
  ].forEach((value) => payloads.add(value));

  return Array.from(payloads);
}

const FUZZ_PAYLOADS = buildFuzzPayloads();
const LOGIN_ERROR_KEYS = ['emailOrUsername', 'password'];
const SIGNUP_ERROR_KEYS = ['fullName', 'email', 'password', 'confirmPassword', 'terms'];

function assertErrorKeys(errors: Record<string, string>, allowedKeys: string[]): void {
  Object.keys(errors).forEach((key) => {
    assert.ok(allowedKeys.includes(key), `Unexpected error key: ${key}`);
  });
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateLogin(fields: { emailOrUsername: string; password: string }): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!fields.emailOrUsername.trim()) {
    errors.emailOrUsername = 'Email is required.';
  } else if (!isValidEmail(fields.emailOrUsername)) {
    errors.emailOrUsername = 'Please enter a valid email address.';
  }
  if (!fields.password) {
    errors.password = 'Password is required.';
  }
  return errors;
}

function validateSignup(fields: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!fields.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!fields.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(fields.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!fields.password) {
    errors.password = 'Password is required.';
  } else if (fields.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (!/[a-z]/.test(fields.password)) {
    errors.password = 'Password must contain at least 1 lowercase letter.';
  } else if (!/[A-Z]/.test(fields.password)) {
    errors.password = 'Password must contain at least 1 uppercase letter.';
  } else if (!/[0-9]/.test(fields.password)) {
    errors.password = 'Password must contain at least 1 number.';
  }
  if (fields.confirmPassword && fields.password !== fields.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  if (!fields.agreedToTerms) errors.terms = 'You must agree to the Terms and Privacy Policy.';
  return errors;
}

function testLoginBaseState(): void {
  const errors = validateLogin(BASE_LOGIN);
  assert.equal(Object.keys(errors).length, 0, 'Base login input should have no errors');
}

function fuzzLoginEmail(): void {
  FUZZ_PAYLOADS.forEach((payload) => {
    const errors = validateLogin({ emailOrUsername: payload, password: BASE_LOGIN.password });
    assertErrorKeys(errors, LOGIN_ERROR_KEYS);

    const isEmpty = !payload.trim();
    if (isEmpty || !isValidEmail(payload)) {
      assert.ok(errors.emailOrUsername, 'Invalid email input should produce an error');
    }
  });
}

function fuzzLoginPassword(): void {
  FUZZ_PAYLOADS.forEach((payload) => {
    const errors = validateLogin({ emailOrUsername: BASE_LOGIN.emailOrUsername, password: payload });
    assertErrorKeys(errors, LOGIN_ERROR_KEYS);

    if (!payload) {
      assert.ok(errors.password, 'Empty password should produce an error');
    }
  });
}

function fuzzLoginCombined(): void {
  for (let round = 0; round < FUZZ_ROUNDS; round += 1) {
    const payload = FUZZ_PAYLOADS[round % FUZZ_PAYLOADS.length];
    const errors = validateLogin({ emailOrUsername: payload, password: payload });
    assertErrorKeys(errors, LOGIN_ERROR_KEYS);

    if (!payload.trim() || !isValidEmail(payload)) {
      assert.ok(errors.emailOrUsername, 'Combined fuzz should keep email validation active');
    }
    if (!payload) {
      assert.ok(errors.password, 'Combined fuzz should keep password required check active');
    }
  }
}

function testSignupBaseState(): void {
  const errors = validateSignup(BASE_SIGNUP);
  assert.equal(Object.keys(errors).length, 0, 'Base signup input should have no errors');
}

function fuzzSignupFullName(): void {
  FUZZ_PAYLOADS.forEach((payload) => {
    const errors = validateSignup({
      ...BASE_SIGNUP,
      fullName: payload,
    });
    assertErrorKeys(errors, SIGNUP_ERROR_KEYS);

    if (!payload.trim()) {
      assert.ok(errors.fullName, 'Empty full name should produce an error');
    }
  });
}

function fuzzSignupEmail(): void {
  FUZZ_PAYLOADS.forEach((payload) => {
    const errors = validateSignup({
      ...BASE_SIGNUP,
      email: payload,
    });
    assertErrorKeys(errors, SIGNUP_ERROR_KEYS);

    if (!payload.trim() || !isValidEmail(payload)) {
      assert.ok(errors.email, 'Invalid email input should produce an error');
    }
  });
}

function fuzzSignupPassword(): void {
  FUZZ_PAYLOADS.forEach((payload) => {
    const errors = validateSignup({
      ...BASE_SIGNUP,
      password: payload,
      confirmPassword: payload,
    });
    assertErrorKeys(errors, SIGNUP_ERROR_KEYS);

    if (!payload) {
      assert.ok(errors.password, 'Empty password should produce an error');
      return;
    }

    if (payload.length < 8) {
      assert.ok(errors.password, 'Short password should produce an error');
      return;
    }

    if (!/[a-z]/.test(payload)) {
      assert.ok(errors.password, 'Password missing lowercase should produce an error');
      return;
    }

    if (!/[A-Z]/.test(payload)) {
      assert.ok(errors.password, 'Password missing uppercase should produce an error');
      return;
    }

    if (!/[0-9]/.test(payload)) {
      assert.ok(errors.password, 'Password missing number should produce an error');
    }
  });
}

function fuzzSignupConfirmPassword(): void {
  FUZZ_PAYLOADS.forEach((payload) => {
    const errors = validateSignup({
      ...BASE_SIGNUP,
      confirmPassword: payload,
    });
    assertErrorKeys(errors, SIGNUP_ERROR_KEYS);

    if (payload && payload !== BASE_SIGNUP.password) {
      assert.ok(errors.confirmPassword, 'Mismatched confirmation should produce an error');
    }
  });
}

function fuzzSignupTerms(): void {
  const errors = validateSignup({
    ...BASE_SIGNUP,
    agreedToTerms: false,
  });
  assertErrorKeys(errors, SIGNUP_ERROR_KEYS);
  assert.ok(errors.terms, 'Terms acceptance should be required');
}

function runStep(name: string, fn: () => void): void {
  try {
    fn();
    logPass(name);
  } catch (error) {
    logFail(name, error);
  }
}

function runFuzzSuite(): void {
  printHeader('FT-AUTH-10 Input Validation Fuzz Test');

  runStep('Login base validation', testLoginBaseState);
  runStep('Login email fuzz', fuzzLoginEmail);
  runStep('Login password fuzz', fuzzLoginPassword);
  runStep('Login combined fuzz', fuzzLoginCombined);

  runStep('Signup base validation', testSignupBaseState);
  runStep('Signup full name fuzz', fuzzSignupFullName);
  runStep('Signup email fuzz', fuzzSignupEmail);
  runStep('Signup password fuzz', fuzzSignupPassword);
  runStep('Signup confirm password fuzz', fuzzSignupConfirmPassword);
  runStep('Signup terms fuzz', fuzzSignupTerms);

  if (failureCount === 0) {
    console.log(`\nRESULT: PASS — ${passCount} validations succeeded, ${failureCount} failures.`);
    process.exit(0);
  }

  console.error(`\nRESULT: FAIL — ${passCount} validations succeeded, ${failureCount} failures.`);
  process.exit(1);
}

runFuzzSuite();
