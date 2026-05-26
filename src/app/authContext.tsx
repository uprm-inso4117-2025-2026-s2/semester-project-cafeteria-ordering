import type { User as SupabaseUser } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

// User object
// Properties should be updated to match database after integration
type User = {
  fullName: string;
  email: string;
};

type AppleSignInResult = {
  user: User;
  supabaseUser: SupabaseUser;
};

type GuestUpgradeState = {
  isGuest: boolean;
  isUpgradingGuest: boolean;
  preservedRoute?: string;
  message?: string;
};

type AuthContextType = {
  user: User | null; // user=null if not logged in
  isInitialized: boolean;
  loggedIn: boolean;
  guestUpgradeState: GuestUpgradeState;
  login: (user: User) => void;
  logout: () => void;
  signOut: () => Promise<void>;
  signInWithApple: () => Promise<AppleSignInResult>;
  beginGuestUpgrade: (preservedRoute?: string) => void;
  cancelGuestUpgrade: () => void;
  completeGuestUpgrade: () => void;
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

// Wraps the app and provides global authentication state
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [guestUpgradeState, setGuestUpgradeState] = useState<GuestUpgradeState>({
    isGuest: false,
    isUpgradingGuest: false,
  });

  const syncProfileFromMetadata = async (supabaseUser: SupabaseUser) => {
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
    };
  };

  useEffect(() => {
    let isMounted = true;

    async function initializeUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (session?.user) {
        await syncProfileFromMetadata(session.user);
      }

      setUser(session?.user ? mapSupabaseUserToAppUser(session.user) : null);
      setIsInitialized(true);
    }

    initializeUser();

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session?.user &&
        (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION')
      ) {
        void syncProfileFromMetadata(session.user);
      }

      setUser(session?.user ? mapSupabaseUserToAppUser(session.user) : null);
      setIsInitialized(true);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const beginGuestUpgrade = useCallback((preservedRoute?: string) => {
    setGuestUpgradeState((current) => {
      const nextRoute = preservedRoute || current.preservedRoute || '/(tabs)';

      if (
        current.isGuest &&
        current.isUpgradingGuest &&
        current.preservedRoute === nextRoute
      ) {
        return current;
      }

      return {
        isGuest: true,
        isUpgradingGuest: true,
        preservedRoute: nextRoute,
        message: 'Create an account to keep your current guest progress.',
      };
    });
  }, []);

  const cancelGuestUpgrade = useCallback(() => {
    setGuestUpgradeState((current) => ({
      ...current,
      isGuest: true,
      isUpgradingGuest: false,
      message: 'Guest upgrade was cancelled. Your temporary progress is still available.',
    }));
  }, []);

  const completeGuestUpgrade = useCallback(() => {
    setGuestUpgradeState({
      isGuest: false,
      isUpgradingGuest: false,
      message: 'Your guest session was upgraded successfully.',
    });
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setUser(null);
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
        loggedIn: !!user, // true if user exists
        guestUpgradeState,
        login,
        logout,
        signOut,
        signInWithApple,
        beginGuestUpgrade,
        cancelGuestUpgrade,
        completeGuestUpgrade,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for accessing authentication context
export function useAuth() {
  const context = useContext(AuthContext);

  // Ensures hook is used within provider
  if (!context) throw new Error('useAuth must be used inside AuthProvider');

  return context;
}

// This file lives under app/ and is discovered as a route by Expo Router.
// Export a no-op component to prevent route warnings while keeping context exports.
export default function AuthContextRoutePlaceholder() {
  return null;
}