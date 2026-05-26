import type { User as SupabaseUser } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';


// User object
// Properties should be updated to match database after integration
type User = {
  fullName: string;
  email: string;
};

type AuthContextType = {
  user: User | null; // user=null if not logged in
  isInitialized: boolean;
  loggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Wraps the app and provides global authentication state
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const syncProfileFromMetadata = async (supabaseUser: SupabaseUser) => {
    const metadata = (supabaseUser.user_metadata ?? {}) as {
      full_name?: string;
      phone?: string;
    };

    const fallbackName = supabaseUser.email?.split('@')[0] || 'User';

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
			full_name: metadata.full_name?.trim() || fallbackName,
			phone: metadata.phone?.trim() || null,
		});

		if (error) {
			console.warn('Unable to sync profile from auth metadata:', error.message);
		}
	}
  };

  const mapSupabaseUserToAppUser = (supabaseUser: SupabaseUser): User => {
    const metadata = (supabaseUser.user_metadata ?? {}) as { full_name?: string };
    const fallbackName = supabaseUser.email?.split('@')[0] || 'User';

    return {
      fullName: metadata.full_name?.trim() || fallbackName,
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
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION')) {
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

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isInitialized,
        loggedIn: !!user, // true if user exists
        login,
        logout,
        signOut,
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