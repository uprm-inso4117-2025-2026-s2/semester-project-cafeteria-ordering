const DEFAULT_APP_SCHEME = 'semesterprojectcafeteriaordering';

export const PASSWORD_RESET_REQUEST_MESSAGE =
  'If an account exists for that email, a password reset link has been sent.';

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordRecoveryAuthClient {
  resetPasswordForEmail: (
    email: string,
    options?: { redirectTo?: string }
  ) => Promise<{ error: { message: string } | null }>;
  getSession: () => Promise<{
    data: { session: { access_token?: string } | null };
    error: { message: string } | null;
  }>;
  updateUser: (attributes: { password: string }) => Promise<{ error: { message: string } | null }>;
}

interface RequestPasswordResetOptions {
  redirectTo?: string;
  authClient?: PasswordRecoveryAuthClient;
}

interface UpdateRecoveredPasswordOptions {
  authClient?: PasswordRecoveryAuthClient;
}

export function validateEmailForPasswordRecovery(email: string): boolean {
  if (!email?.trim()) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePasswordPolicy(password: string): PasswordValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least 1 uppercase letter.' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least 1 lowercase letter.' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least 1 number.' };
  }

  return { isValid: true };
}

export function getPasswordRecoveryRedirectTo(redirectOverride?: string): string {
  if (redirectOverride?.trim()) {
    return redirectOverride.trim();
  }

  if (process.env.EXPO_PUBLIC_PASSWORD_RESET_REDIRECT_TO?.trim()) {
    return process.env.EXPO_PUBLIC_PASSWORD_RESET_REDIRECT_TO.trim();
  }

  const appScheme =
    process.env.EXPO_PUBLIC_APP_SCHEME?.trim() ||
    process.env.EXPO_PUBLIC_EXPO_SCHEME?.trim() ||
    DEFAULT_APP_SCHEME;

  return `${appScheme}://PasswordRecovery/resetPassword`;
}

async function getAuthClient(authClient?: PasswordRecoveryAuthClient): Promise<PasswordRecoveryAuthClient> {
  if (authClient) {
    return authClient;
  }

  // Lazy-load Supabase client so non-React-Native test environments can inject mocks.
  const { supabase } = (await import('./supabase')) as {
    supabase: { auth: PasswordRecoveryAuthClient };
  };

  return supabase.auth;
}

export async function requestPasswordReset(
  email: string,
  options: RequestPasswordResetOptions = {}
): Promise<{ message: string }> {
  if (!validateEmailForPasswordRecovery(email)) {
    throw new Error('Please enter a valid email address.');
  }

  const client = await getAuthClient(options.authClient);
  const redirectTo = getPasswordRecoveryRedirectTo(options.redirectTo);

  const { error } = await client.resetPasswordForEmail(email.trim(), { redirectTo });

  if (error) {
    throw new Error('Unable to process password reset request right now. Please try again.');
  }

  return { message: PASSWORD_RESET_REQUEST_MESSAGE };
}

export async function updateRecoveredPassword(
  newPassword: string,
  options: UpdateRecoveredPasswordOptions = {}
): Promise<{ message: string }> {
  const passwordCheck = validatePasswordPolicy(newPassword);
  if (!passwordCheck.isValid) {
    throw new Error(passwordCheck.error || 'Invalid password.');
  }

  const client = await getAuthClient(options.authClient);
  const { data, error: sessionError } = await client.getSession();

  if (sessionError || !data.session?.access_token) {
    throw new Error('Recovery link is invalid or expired. Please request a new password reset link.');
  }

  const { error } = await client.updateUser({ password: newPassword });

  if (error) {
    throw new Error('Unable to update password right now. Please request a new reset link and try again.');
  }

  return { message: 'Password updated successfully.' };
}