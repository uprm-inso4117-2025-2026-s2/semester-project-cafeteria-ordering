import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/app/authContext';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { mapLoginError } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { isValidEmail } from '@/lib/validation';

WebBrowser.maybeCompleteAuthSession();

// ─── Logo Assets ──────────────────────────────────────────────────────────────
const LightModeLogo = require('../../../documentation/branding/images/Light-Mode-Logo.png');
const DarkModeLogo = require('../../../documentation/branding/images/Dark-Mode-Logo.png');

// ─── Content max width (matches mockup proportions at 360px viewport) ─────────
const CONTENT_MAX_WIDTH = 250;

// ─── Types ────────────────────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  isPassword?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  accessibilityLabel?: string;
  errorText?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function mapAppleLoginError(message?: string) {
  const normalized = message?.toLowerCase() ?? '';

  if (normalized.includes('apple_oauth_cancelled')) {
    return 'Apple sign-in was cancelled. Please try again or use email and password.';
  }

  if (normalized.includes('provider') || normalized.includes('not enabled')) {
    return 'Apple sign-in is not enabled yet. Please contact support or use email and password.';
  }

  if (normalized.includes('authorization code') || normalized.includes('code')) {
    return 'Apple sign-in failed after redirect. Please try again.';
  }

  if (normalized.includes('access_denied')) {
    return 'Apple sign-in was denied. Please try again or use email and password.';
  }

  return 'Apple sign-in failed. Please try again or use email and password.';
}

// ─── InputField Component ─────────────────────────────────────────────────────
function InputField({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  isPassword = false,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  accessibilityLabel,
  errorText,
}: InputFieldProps) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.fieldContainer}>
      <ThemedText type="body" style={styles.label}>
        {label}
      </ThemedText>
      <View style={[styles.inputWrapper, { backgroundColor: Colors.pastelSage }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={Colors.mutedGray}
          secureTextEntry={hidden}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          accessibilityLabel={accessibilityLabel ?? label}
          style={[styles.input, { color: textColor, flex: 1 }]}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            style={styles.eyeButton}
          >
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={16}
              color={Colors.light.text}
            />
          </TouchableOpacity>
        )}
      </View>
      {errorText ? (
        <ThemedText
          type="body"
          style={styles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {errorText}
        </ThemedText>
      ) : null}
    </View>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(fields: { emailOrUsername: string; password: string }) {
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

// ─── LoginScreen ──────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const isDark = backgroundColor === Colors.dark.background;
  const router = useRouter();

  const params = useLocalSearchParams<{
    error?: string;
    error_code?: string;
    error_description?: string;
  }>();

  const { signInWithApple } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAppleSubmitting, setIsAppleSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    const redirectError =
      getSearchParam(params.error_description) ||
      getSearchParam(params.error) ||
      getSearchParam(params.error_code);

    if (redirectError) {
      setAuthMessage(mapAppleLoginError(redirectError));
    }
  }, [params.error, params.error_code, params.error_description]);

  const routeAuthenticatedUser = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    router.replace(profile?.role === 'staff' ? '/staff/ViewOrders' : '/(tabs)');
  };

  // Log session state when login screen mounts
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[Login Screen] Existing session check:', {
        hasSession: !!session,
        user: session?.user?.email,
        expiresAt: session?.expires_at,
      });
    };
    
    checkExistingSession();
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);

      if (session?.user) {
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 2000);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    const validationErrors = validate({ emailOrUsername, password });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      AccessibilityInfo.announceForAccessibility(
        'There are errors in the form. Please review and correct them.'
      );
      return;
    }

    setErrors({});
    setAuthMessage(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername.trim(),
        password,
      });

      if (error) {
        setAuthMessage(mapLoginError(error.message));
        return;
      }

      if (!data.session || !data.user) {
        setAuthMessage('Unable to log in right now. Please try again.');
        return;
      }

      await routeAuthenticatedUser(data.user.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignInWithApple = async () => {
    setAuthMessage(null);
    setIsAppleSubmitting(true);

    try {
      const { supabaseUser } = await signInWithApple();
      await routeAuthenticatedUser(supabaseUser.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : undefined;
      setAuthMessage(mapAppleLoginError(message));
    } finally {
      setIsAppleSubmitting(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      setAuthMessage(null);
      setIsGoogleSubmitting(true);

      const redirectTo = 'exp://localhost:19000/**';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        setAuthMessage(error.message);
        return;
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );

        if (result.type === 'success') {
          const url = result.url;

          const access_token = url.match(/access_token=([^&]+)/)?.[1];
          const refresh_token = url.match(/refresh_token=([^&]+)/)?.[1];

          if (access_token && refresh_token) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (sessionError) {
              setAuthMessage(sessionError.message);
              return;
            }
          }
        } else if (result.type === 'cancel') {
          setAuthMessage('Google sign in was cancelled.');
        }
      }
    } catch (err) {
      console.error('Google OAuth error:', err);
      setAuthMessage('Unable to sign in with Google.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={isDark ? DarkModeLogo : LightModeLogo}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Cafeteria ordering system logo"
        />

        <ThemedText type="heading" style={styles.title} accessibilityRole="header">
          Welcome back!
        </ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          {"Please enter your credentials\nto log into your account."}
        </ThemedText>

        <View style={styles.form}>
          <InputField
            label="Email"
            value={emailOrUsername}
            onChangeText={(t) => {
              setEmailOrUsername(t);
              if (errors.emailOrUsername) setErrors((e) => ({ ...e, emailOrUsername: '' }));
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            errorText={errors.emailOrUsername}
            accessibilityLabel="Email"
          />

          <InputField
            label="Password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((e) => ({ ...e, password: '' }));
            }}
            secureTextEntry
            isPassword
            autoCapitalize="none"
            errorText={errors.password}
            accessibilityLabel="Password"
          />

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={'/PasswordRecovery' as any} asChild>
            <TouchableOpacity
              style={styles.forgotPasswordRow}
              accessibilityRole="link"
              accessibilityLabel="Forgot password?"
            >
              <ThemedText type="link" style={styles.forgotPasswordLink}>
                Forgot password?
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </View>

        <TouchableOpacity
          onPress={handleSignIn}
          disabled={isSubmitting || isAppleSubmitting || isGoogleSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
          accessibilityState={{ disabled: isSubmitting || isAppleSubmitting || isGoogleSubmitting }}
          style={[
            styles.signInButton,
            { backgroundColor: isSubmitting ? Colors.pastelSage : Colors.primaryGreen },
          ]}
          activeOpacity={0.85}
        >
          <ThemedText
            type="button"
            lightColor={Colors.light.secondaryText}
            darkColor={Colors.light.secondaryText}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignInWithGoogle}
          disabled={isSubmitting || isAppleSubmitting || isGoogleSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Sign in with Google"
          accessibilityState={{ disabled: isSubmitting || isAppleSubmitting || isGoogleSubmitting }}
          style={styles.googleButton}
          activeOpacity={0.85}
        >
          <ThemedText
            type="button"
            lightColor={Colors.light.secondaryText}
            darkColor={Colors.light.secondaryText}
          >
            {isGoogleSubmitting ? 'Connecting…' : 'Sign in with Google'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignInWithApple}
          disabled={isSubmitting || isAppleSubmitting || isGoogleSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Sign in with Apple"
          accessibilityState={{ disabled: isSubmitting || isAppleSubmitting || isGoogleSubmitting }}
          style={[
            styles.appleButton,
            { opacity: isSubmitting || isAppleSubmitting || isGoogleSubmitting ? 0.7 : 1 },
          ]}
          activeOpacity={0.85}
        >
          <View style={styles.appleButtonContent}>
            <Ionicons name="logo-apple" size={18} color="#FFFFFF" />
            <ThemedText
              type="button"
              lightColor="#FFFFFF"
              darkColor="#FFFFFF"
              style={styles.socialButtonText}
              numberOfLines={1}
            >
              {isAppleSubmitting ? 'Connecting…' : 'Sign in with Apple'}
            </ThemedText>
          </View>
        </TouchableOpacity>

        {authMessage && (
          <ThemedText
            type="body"
            style={[
              styles.authMessage,
              {
                color: authMessage.toLowerCase().includes('enabled yet')
                  ? Colors.mutedGray
                  : '#C62828',
              },
            ]}
          >
            {authMessage}
          </ThemedText>
        )}

        <View style={styles.signUpLinkRow}>
          <ThemedText type="body" style={styles.signUpLinkText}>
            {"Don't have an account? "}
          </ThemedText>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={'/signup' as any} asChild>
            <TouchableOpacity accessibilityRole="link" accessibilityLabel="Sign up">
              <ThemedText type="link" style={styles.signUpLink}>
                Sign up
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: -8,
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  form: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
  },
  fieldContainer: { marginBottom: 8 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingLeft: 16,
    paddingVertical: 10,
  },
  input: {
    fontSize: 14,
    padding: 0,
  },
  eyeButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 11,
    color: '#C62828',
    marginTop: 3,
    marginLeft: 4,
  },
  forgotPasswordRow: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  forgotPasswordLink: {
    fontSize: 12,
    lineHeight: 16,
  },
  signInButton: {
    width: 190,
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginBottom: 10,
  },

  appleButton: {
    width: 250,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    marginBottom: 10,
  },
  appleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    marginLeft: 8,
    textAlign: 'center',
  },

  googleButton: {
    width: 190,
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    marginBottom: 24,
  },
  signUpLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpLinkText: {
    fontSize: 12,
  },
  signUpLink: {
    fontSize: 12,
    lineHeight: 16,
  },
  authMessage: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: CONTENT_MAX_WIDTH,
  },
});
