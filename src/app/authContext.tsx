import type { User as SupabaseUser } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

// User object
type User = {
  fullName: string;
  email: string;
  userId?: string;
};

type AppleSignInResult = {
  user: User;
  supabaseUser: SupabaseUser;
};

type AuthContextType = {
  user: User | null;
  isInitialized: boolean;
  loggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
  signOut: () => Promise<void>;
  signInWithApple: () => Promise<AppleSignInResult>;
  sessionChecked: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getQueryParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getOAuthRedirectUrl() {
  return Linking.createURL('auth/callback');
}

function getOAuthCodeFromUrl(url: string) {
  const parsedUrl = Linking.parse(url);
  const queryParams = parsedUrl.queryParams ?? {};

  const error =
    getQueryParam(queryParams, 'error_description') ||
    getQueryParam(queryParams, 'error') ||
    getQueryParam(queryParams, 'error_code');

  if (error) {
    throw new Error(error);
  }

  return getQueryParam(queryParams, 'code');
}

// Helper for logging session events
function logSessionEvent(event: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(
    `[Session Persistence][${timestamp}] ${event}`,
    data ? JSON.stringify(data, null, 2) : ''
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  const syncProfileFromMetadata = async (supabaseUser: SupabaseUser) => {
    logSessionEvent('Syncing profile from metadata', { userId: supabaseUser.id });

    const metadata = (supabaseUser.user_metadata ?? {}) as {
      full_name?: string;
      name?: string;
      phone?: string;
    };

    const fallbackName = supabaseUser.email?.split('@')[0] || 'User';
    const fullName =
      metadata.full_name?.trim() ||
      metadata.name?.trim() ||
      fallbackName;

    const { data: existing, error: existingError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', supabaseUser.id)
      .maybeSingle();

    if (existingError) {
      console.warn('Unable to check existing profile:', existingError.message);
      return;
    }

    if (!existing) {
      logSessionEvent('Creating new profile for user', { userId: supabaseUser.id });

      const { error } = await supabase.from('profiles').insert({
        id: supabaseUser.id,
        user_id: supabaseUser.id,
        full_name: fullName,
        phone: metadata.phone?.trim() || null,
      });

      if (error) {
        console.warn('Unable to sync profile from auth metadata:', error.message);
      }
    }
  };

  const mapSupabaseUserToAppUser = (supabaseUser: SupabaseUser): User => {
    const metadata = (supabaseUser.user_metadata ?? {}) as {
      full_name?: string;
      name?: string;
    };

    const fallbackName = supabaseUser.email?.split('@')[0] || 'User';

    return {
      fullName:
        metadata.full_name?.trim() ||
        metadata.name?.trim() ||
        fallbackName,
      email: supabaseUser.email ?? '',
      userId: supabaseUser.id,
    };
  };

  useEffect(() => {
    let isMounted = true;
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    async function initializeUser() {
      logSessionEvent('Initializing user session on app startup');

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          logSessionEvent('Error getting session', { error: sessionError.message });
          console.error('Session retrieval error:', sessionError.message);
        }

        if (!isMounted) return;

        if (session?.user) {
          logSessionEvent('Session found on startup', {
            userId: session.user.id,
            email: session.user.email,
            sessionExpiresAt: session.expires_at,
          });

          await syncProfileFromMetadata(session.user);
          setUser(mapSupabaseUserToAppUser(session.user));
        } else {
          logSessionEvent('No session found on startup');
          setUser(null);
        }

        setSessionChecked(true);
        setIsInitialized(true);
        logSessionEvent('Session initialization complete', { hasSession: !!session });
      } catch (error) {
        logSessionEvent('Error during session initialization', { error });
        console.error('Session initialization error:', error);
        setUser(null);
        setSessionChecked(true);
        setIsInitialized(true);
      }
    }

    initializeUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      logSessionEvent('Auth state change', { event, hasSession: !!session });

      if (!isMounted) return;

      switch (event) {
        case 'SIGNED_IN':
          logSessionEvent('User signed in', { userId: session?.user?.id });
          if (session?.user) {
            await syncProfileFromMetadata(session.user);
            setUser(mapSupabaseUserToAppUser(session.user));
          }
          break;

        case 'SIGNED_OUT':
          logSessionEvent('User signed out');
          setUser(null);
          break;

        case 'TOKEN_REFRESHED':
          logSessionEvent('Session token refreshed', {
            expiresAt: session?.expires_at,
            newExpiry: session?.expires_at
              ? new Date(session.expires_at * 1000).toISOString()
              : null,
          });
          if (session?.user) {
            setUser(mapSupabaseUserToAppUser(session.user));
          }
          break;

        case 'USER_UPDATED':
          logSessionEvent('User updated', { userId: session?.user?.id });
          if (session?.user) {
            await syncProfileFromMetadata(session.user);
            setUser(mapSupabaseUserToAppUser(session.user));
          }
          break;

        case 'INITIAL_SESSION':
          logSessionEvent('Initial session loaded', { hasSession: !!session });
          if (session?.user) {
            await syncProfileFromMetadata(session.user);
            setUser(mapSupabaseUserToAppUser(session.user));
          } else {
            setUser(null);
          }
          break;
      }

      setSessionChecked(true);
      setIsInitialized(true);
    });

    authListener = subscription;

    return () => {
      isMounted = false;

      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Periodic session validation every 5 minutes on native platforms
  useEffect(() => {
    if (!user) return;

    let interval: ReturnType<typeof setInterval> | undefined;

    if (Platform.OS !== 'web') {
      interval = setInterval(async () => {
        logSessionEvent('Performing periodic session validation');

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          logSessionEvent('Session validation error', { error: error.message });
        } else if (!session) {
          logSessionEvent('Session validation failed - no session found');

          setUser(null);

          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log in again.',
            [{ text: 'OK' }]
          );
        } else if (session.user?.id !== user.userId) {
          logSessionEvent('Session user mismatch', {
            expected: user.userId,
            actual: session.user?.id,
          });
        } else {
          logSessionEvent('Session validation successful', {
            expiresAt: session.expires_at,
            timeUntilExpiry: session.expires_at
              ? Math.floor((session.expires_at * 1000 - Date.now()) / 1000)
              : 'unknown',
          });
        }
      }, 5 * 60 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  const login = (userData: User) => {
    logSessionEvent('Manual login', { userId: userData.userId });
    setUser(userData);
  };

  const logout = () => {
    logSessionEvent('Manual logout');
    setUser(null);
  };

  const signOut = async () => {
    logSessionEvent('Signing out');

    const { error } = await supabase.auth.signOut();

    if (error) {
      logSessionEvent('Sign out error', { error: error.message });
      throw error;
    }

    setUser(null);
    logSessionEvent('Sign out complete');
  };

  const signInWithApple = async (): Promise<AppleSignInResult> => {
    const redirectTo = getOAuthRedirectUrl();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      throw new Error(error.message || 'Apple sign-in could not be started.');
    }

    if (!data.url) {
      throw new Error('Apple sign-in could not be started. Missing OAuth URL.');
    }

    const authResult = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (authResult.type !== 'success') {
      throw new Error('APPLE_OAUTH_CANCELLED');
    }

    const code = getOAuthCodeFromUrl(authResult.url);

    if (!code) {
      throw new Error('Apple sign-in failed because no authorization code was returned.');
    }

    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      throw new Error(exchangeError.message || 'Apple sign-in failed during session exchange.');
    }

    if (!sessionData.session || !sessionData.user) {
      throw new Error('Apple sign-in did not return a valid session.');
    }

    await syncProfileFromMetadata(sessionData.user);

    const mappedUser = mapSupabaseUserToAppUser(sessionData.user);
    setUser(mappedUser);

    return {
      user: mappedUser,
      supabaseUser: sessionData.user,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isInitialized,
        loggedIn: !!user,
        login,
        logout,
        signOut,
        signInWithApple,
        sessionChecked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) throw new Error('useAuth must be used inside AuthProvider');

  return context;
}

// No-op component to prevent route warnings
export default function AuthContextRoutePlaceholder() {
  return null;
}