import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Expo Router static rendering (web export) runs in Node.js where there is no
// native WebSocket (Node < 22). Supabase initializes its realtime client eagerly
// and expects a WebSocket constructor to exist.
//
// We provide a minimal stub so the client can be constructed during export.
// This should never be used for actual realtime subscriptions in SSR.
if (typeof window === 'undefined' && typeof (globalThis as any).WebSocket === 'undefined') {
  class WebSocketStub {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    CONNECTING = 0;
    OPEN = 1;
    CLOSING = 2;
    CLOSED = 3;

    readyState = WebSocketStub.CLOSED;
    url = '';
    protocol = '';

    onopen = null;
    onmessage = null;
    onclose = null;
    onerror = null;

    constructor(address: string | URL) {
      this.url = String(address);
    }

    close() {}
    send() {}
    addEventListener() {}
    removeEventListener() {}
  }

  (globalThis as any).WebSocket = WebSocketStub;
}

// AsyncStorage v2 accesses `window` internally, which doesn't exist in
// Node.js (Expo Router static rendering). This adapter guards against that.
const ssrSafeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    return AsyncStorage.removeItem(key);
  },
};

// Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure ' +
    'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

/**
 * Supabase client for React Native
 * 
 * Features:
 * - AsyncStorage for session persistence
 * - Auto-refresh tokens for seamless authentication
 * - Persistent sessions across app restarts
 * - Optimized for Expo/React Native environment
 * 
 * Usage:
 * ```typescript
 * import { supabase } from '@/lib/supabase';
 * 
 * // Authentication
 * const { data, error } = await supabase.auth.signUp({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 * 
 * // Database queries
 * const { data: orders } = await supabase
 *   .from('orders')
 *   .select('*')
 *   .eq('user_id', userId);
 * 
 * // Real-time subscriptions
 * supabase
 *   .channel('orders')
 *   .on('postgres_changes', { 
 *     event: 'UPDATE', 
 *     schema: 'public', 
 *     table: 'orders' 
 *   }, payload => {
 *     console.log('Order updated:', payload);
 *   })
 *   .subscribe();
 * ```
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage for session persistence (required for React Native)
    storage: ssrSafeStorage,
    
    // Automatically refresh tokens when they expire
    autoRefreshToken: true,
    
    // Persist session across app restarts
    persistSession: true,
    
    // Disable URL detection (not applicable in React Native)
    detectSessionInUrl: false,
  },
});

/**
 * Helper function to check if user is authenticated
 * 
 * @returns Promise with user session or null
 * 
 * @example
 * const session = await getCurrentSession();
 * if (session) {
 *   console.log('User logged in:', session.user.email);
 * }
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }
  
  return session;
}

/**
 * Helper function to get current user
 * 
 * @returns Promise with user or null
 * 
 * @example
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log('User ID:', user.id);
 * }
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error.message);
    return null;
  }
  
  return user;
}

/**
 * Helper function to sign out
 * 
 * @example
 * await signOut();
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
}
