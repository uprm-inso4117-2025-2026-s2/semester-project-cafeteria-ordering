import type { SupabaseClient } from '@supabase/supabase-js';

export interface LoginResult {
  userId: string;
  email: string | null;
  accessToken: string;
}

export interface SignupResult {
  userId: string;
  email: string | null;
  hasSession: boolean;
}

export function mapSignUpError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('already registered') || normalized.includes('already exists')) {
    return 'This email is already registered.';
  }

  if (normalized.includes('password')) {
    return 'Password does not meet required security rules.';
  }

  if (normalized.includes('invalid email')) {
    return 'Please provide a valid email address.';
  }

  if (normalized.includes('rate limit') || normalized.includes('too many requests')) {
    return 'Too many signup attempts. Please wait and try again.';
  }

  return 'Unable to create account right now. Please try again.';
}

export function mapLoginError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Please confirm your email before logging in.';
  }

  if (normalized.includes('too many requests')) {
    return 'Too many login attempts. Please wait a moment and try again.';
  }

  return 'Unable to log in right now. Please try again.';
}

export async function loginWithEmailPassword(
  client: SupabaseClient,
  email: string,
  password: string
): Promise<LoginResult> {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    throw new Error('Email is required.');
  }

  if (!password) {
    throw new Error('Password is required.');
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    throw new Error(mapLoginError(error.message));
  }

  if (!data.session || !data.user) {
    throw new Error('Login did not return a valid session.');
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? null,
    accessToken: data.session.access_token,
  };
}

export async function signupWithEmailPassword(
  client: SupabaseClient,
  email: string,
  password: string,
  metadata?: { full_name?: string; phone?: string }
): Promise<SignupResult> {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    throw new Error('Email is required.');
  }

  if (!password) {
    throw new Error('Password is required.');
  }

  const { data, error } = await client.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name: metadata?.full_name?.trim() || 'Signup Test User',
        phone: metadata?.phone?.trim() || null,
      },
    },
  });

  if (error) {
    throw new Error(mapSignUpError(error.message));
  }

  if (!data.user) {
    throw new Error('Signup did not return a user.');
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? null,
    hasSession: Boolean(data.session),
  };
}

export async function logout(client: SupabaseClient): Promise<void> {
  const { error } = await client.auth.signOut();

  if (error) {
    throw new Error(`Unable to sign out: ${error.message}`);
  }
}
