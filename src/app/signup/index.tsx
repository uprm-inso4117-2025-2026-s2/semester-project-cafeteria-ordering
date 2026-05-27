import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
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
import { mapSignUpError } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { isValidEmail } from '@/lib/validation';

// ─── Types ────────────────────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  isPassword?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  accessibilityLabel?: string;
  errorText?: string;
}

// ─── InputField Component ─────────────────────────────────────────────────────
function InputField({
  label,
  required = false,
  value,
  onChangeText,
  onBlur,
  placeholder,
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
        {required && <ThemedText style={{ color: '#C62828' }}> *</ThemedText>}
      </ThemedText>
      <View style={[styles.inputWrapper, { backgroundColor: Colors.pastelSage }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
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
              size={20}
              color={Colors.light.text}
            />
          </TouchableOpacity>
        )}
      </View>
      {errorText ? (
        <ThemedText type="body" style={styles.errorText}>
          {errorText}
        </ThemedText>
      ) : null}
    </View>
  );
}

// ─── PasswordChecklist ────────────────────────────────────────────────────────
function PasswordChecklist({ password }: { password: string }) {
  const textColor = useThemeColor({}, 'text');
  const defaultColor = useThemeColor({ light: Colors.light.text, dark: Colors.dark.text }, 'text');

  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least 1 lowercase', met: /[a-z]/.test(password) },
    { label: 'At least 1 uppercase', met: /[A-Z]/.test(password) },
    { label: 'At least 1 number', met: /[0-9]/.test(password) },
  ];

  return (
    <View style={styles.checklistContainer}>
      {checks.map((c) => (
        <View key={c.label} style={styles.checklistRow}>
          <ThemedText
            type="body"
            style={{
              fontSize: 14,
              color: c.met ? Colors.primaryGreen : defaultColor,
            }}
          >
            ✓
          </ThemedText>
          <ThemedText type="body" style={[styles.checklistText, { color: textColor }]}>
            {' '}
            {c.label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(fields: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}) {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function mapAppleSignUpError(message?: string) {
  const normalized = message?.toLowerCase() ?? '';

  if (normalized.includes('apple_oauth_cancelled')) {
    return 'Apple sign-up was cancelled. Please try again or create an account with email and password.';
  }

  if (normalized.includes('provider') || normalized.includes('not enabled')) {
    return 'Apple sign-up is not enabled yet. Please contact support or create an account with email and password.';
  }

  if (normalized.includes('authorization code') || normalized.includes('code')) {
    return 'Apple sign-up failed after redirect. Please try again.';
  }

  if (normalized.includes('access_denied')) {
    return 'Apple sign-up was denied. Please try again or create an account with email and password.';
  }

  return 'Apple sign-up failed. Please try again or create an account with email and password.';
}

// ─── SignUpScreen ─────────────────────────────────────────────────────────────
export default function SignUpScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const router = useRouter();

  const params = useLocalSearchParams<{
    error?: string;
    error_code?: string;
    error_description?: string;
    upgrade?: string;
    returnTo?: string;
  }>();

  const {
    signInWithApple,
    guestUpgradeState,
    beginGuestUpgrade,
    cancelGuestUpgrade,
    completeGuestUpgrade,
  } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAppleSubmitting, setIsAppleSubmitting] = useState(false);

  useEffect(() => {
    const redirectError =
      getSearchParam(params.error_description) ||
      getSearchParam(params.error) ||
      getSearchParam(params.error_code);

    if (redirectError) {
      setAuthMessage(mapAppleSignUpError(redirectError));
    }
  }, [params.error, params.error_code, params.error_description]);

  useEffect(() => {
    if (params.upgrade === 'guest') {
      beginGuestUpgrade(params.returnTo || '/(tabs)');
    }
  }, [beginGuestUpgrade, params.returnTo, params.upgrade]);

  const handleSignUp = async () => {
    const validationErrors = validate({ fullName, email, password, confirmPassword, agreedToTerms });

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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim() || null,
          },
        },
      });

      if (error) {
        setAuthMessage(mapSignUpError(error.message));
        return;
      }

      if (!data.user) {
        setAuthMessage('Unable to create account right now. Please try again.');
        return;
      }

      if (data.session) {
        const preservedRoute = guestUpgradeState.preservedRoute || '/(tabs)';

        if (guestUpgradeState.isUpgradingGuest) {
          completeGuestUpgrade();
          setAuthMessage('Account created successfully. Your guest progress was preserved.');
          router.replace(preservedRoute as any);
        } else {
          setAuthMessage('Account created successfully.');
          router.replace('/(tabs)');
        }
      } else {
        setAuthMessage(
          guestUpgradeState.isUpgradingGuest
            ? 'Account created. Please check your email to confirm your account. Your guest progress is still available.'
            : 'Account created. Please check your email to confirm your account before logging in.'
        );

        router.replace('/login' as any);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpWithApple = async () => {
    setAuthMessage(null);
    setIsAppleSubmitting(true);

    try {
      const preservedRoute = guestUpgradeState.preservedRoute || '/(tabs)';

      await signInWithApple();

      if (guestUpgradeState.isUpgradingGuest) {
        completeGuestUpgrade();
      }

      router.replace(preservedRoute as any);
    } catch (error) {
      const message = error instanceof Error ? error.message : undefined;
      setAuthMessage(mapAppleSignUpError(message));
    } finally {
      setIsAppleSubmitting(false);
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
        <ThemedText type="heading" style={styles.title} accessibilityRole="header">
          Create Your Account
        </ThemedText>

        <View style={[styles.avatarContainer, { borderColor: Colors.mutedGray }]}>
          <Ionicons name="person-circle-outline" size={60} color={Colors.mutedGray} />
        </View>

        {guestUpgradeState.isUpgradingGuest && (
          <View style={styles.guestUpgradeBanner}>
            <Ionicons name="information-circle-outline" size={22} color={Colors.primaryGreen} />
            <View style={styles.guestUpgradeTextWrapper}>
              <ThemedText type="body" style={styles.guestUpgradeTitle}>
                Upgrade your guest account
              </ThemedText>
              <ThemedText type="body" style={styles.guestUpgradeMessage}>
                Create an account to keep your current cafeteria progress and continue without starting over.
              </ThemedText>
            </View>
          </View>
        )}

        <View style={styles.form}>
          <InputField
            label="Full Name"
            required
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              if (errors.fullName) setErrors((e) => ({ ...e, fullName: '' }));
            }}
            onBlur={() => {
              const err = validate({ fullName, email, password, confirmPassword, agreedToTerms });
              setErrors((prev) => ({ ...prev, fullName: err.fullName || '' }));
            }}
            autoCapitalize="words"
            errorText={errors.fullName}
            accessibilityLabel="Full Name"
          />

          <InputField
            label="Email"
            required
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((e) => ({ ...e, email: '' }));
            }}
            onBlur={() => {
              const err = validate({ fullName, email, password, confirmPassword, agreedToTerms });
              setErrors((prev) => ({ ...prev, email: err.email || '' }));
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            errorText={errors.email}
            accessibilityLabel="Email address"
          />

          <InputField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            autoCapitalize="none"
            keyboardType="phone-pad"
            accessibilityLabel="Phone number"
          />

          <InputField
            label="Password"
            required
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((e) => ({ ...e, password: '' }));
            }}
            onBlur={() => {
              const err = validate({ fullName, email, password, confirmPassword, agreedToTerms });
              setErrors((prev) => ({ ...prev, password: err.password || '' }));
            }}
            secureTextEntry
            isPassword
            autoCapitalize="none"
            errorText={errors.password}
            accessibilityLabel="Password"
          />

          <PasswordChecklist password={password} />

          <InputField
            label="Confirm Password"
            required
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: '' }));
            }}
            onBlur={() => {
              const err = validate({ fullName, email, password, confirmPassword, agreedToTerms });
              setErrors((prev) => ({ ...prev, confirmPassword: err.confirmPassword || '' }));
            }}
            secureTextEntry
            isPassword
            autoCapitalize="none"
            errorText={errors.confirmPassword}
            accessibilityLabel="Confirm Password"
          />

          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => {
              setAgreedToTerms((v) => !v);
              if (errors.terms) setErrors((e) => ({ ...e, terms: '' }));
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreedToTerms }}
            accessibilityLabel="I agree to the Terms and Privacy Policy"
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: errors.terms ? '#C62828' : Colors.mutedGray,
                  backgroundColor: agreedToTerms ? Colors.primaryGreen : 'transparent',
                },
              ]}
            >
              {agreedToTerms && (
                <ThemedText style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
                  ✓
                </ThemedText>
              )}
            </View>
            <ThemedText type="body" style={styles.termsText}>
              {'I agree on all '}
              <ThemedText type="link" lightColor={Colors.primaryGreen} darkColor={Colors.pastelSage}>
                Terms
              </ThemedText>
              {' and '}
              <ThemedText type="link" lightColor={Colors.primaryGreen} darkColor={Colors.pastelSage}>
                Privacy Policy
              </ThemedText>
            </ThemedText>
          </TouchableOpacity>
          {errors.terms && (
            <ThemedText type="body" style={styles.errorText}>
              {errors.terms}
            </ThemedText>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSignUp}
          disabled={isSubmitting || isAppleSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Sign up"
          accessibilityState={{ disabled: isSubmitting || isAppleSubmitting }}
          style={[
            styles.primaryButton,
            { backgroundColor: isSubmitting ? Colors.pastelSage : Colors.primaryGreen },
          ]}
          activeOpacity={0.85}
        >
          <ThemedText
            type="button"
            lightColor={Colors.light.secondaryText}
            darkColor={Colors.light.secondaryText}
          >
            {isSubmitting ? 'Creating Account…' : 'Sign up'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignUpWithApple}
          disabled={isSubmitting || isAppleSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Sign up with Apple"
          accessibilityState={{ disabled: isSubmitting || isAppleSubmitting }}
          style={[
            styles.appleButton,
            { opacity: isSubmitting || isAppleSubmitting ? 0.7 : 1 },
          ]}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
          <ThemedText
            type="button"
            lightColor="#FFFFFF"
            darkColor="#FFFFFF"
            style={styles.socialButtonText}
          >
            {isAppleSubmitting ? 'Connecting…' : 'Sign up with Apple'}
          </ThemedText>
        </TouchableOpacity>

        {guestUpgradeState.isUpgradingGuest && (
          <TouchableOpacity
            onPress={() => {
              cancelGuestUpgrade();
              router.replace((guestUpgradeState.preservedRoute || '/(tabs)') as any);
            }}
            accessibilityRole="button"
            accessibilityLabel="Continue as guest"
            style={styles.cancelGuestUpgradeButton}
          >
            <ThemedText type="link" style={styles.cancelGuestUpgradeText}>
              Continue as guest
            </ThemedText>
          </TouchableOpacity>
        )}

        {authMessage && (
          <ThemedText
            type="body"
            style={[
              styles.authMessage,
              {
                color: authMessage.toLowerCase().includes('account created')
                  ? Colors.primaryGreen
                  : '#C62828',
              },
            ]}
          >
            {authMessage}
          </ThemedText>
        )}

        <View style={styles.loginLinkRow}>
          <ThemedText type="body" style={styles.loginLinkText} lightColor={Colors.mutedGray}>
            Already have an account?{' '}
          </ThemedText>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={'/login' as any} asChild>
            <TouchableOpacity accessibilityRole="link" accessibilityLabel="Log in">
              <ThemedText type="link" style={styles.loginLink}>
                Log in
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    overflow: 'hidden',
    backgroundColor: '#EEEEEE',
  },
  guestUpgradeBanner: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: 14,
    backgroundColor: Colors.pastelSage,
    marginBottom: 20,
  },
  guestUpgradeTextWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  guestUpgradeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  guestUpgradeMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: { width: '100%', maxWidth: 480 },
  fieldContainer: { marginBottom: 16 },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  input: {
    fontSize: 16,
    padding: 0,
  },
  eyeButton: { paddingLeft: 8 },
  errorText: {
    fontSize: 12,
    color: '#C62828',
    marginTop: 4,
    marginLeft: 4,
  },
  checklistContainer: { marginBottom: 20, marginLeft: 4 },
  checklistRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  checklistText: { fontSize: 16 },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 3,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: { fontSize: 16, flex: 1 },
  primaryButton: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  appleButton: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#000000',
    marginBottom: 16,
  },
  socialButtonText: {
    marginLeft: 8,
  },
  cancelGuestUpgradeButton: {
    marginBottom: 12,
  },
  cancelGuestUpgradeText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loginLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginLinkText: { fontSize: 16 },
  loginLink: { fontSize: 16, fontWeight: '500' },
  authMessage: {
    width: '100%',
    maxWidth: 480,
    textAlign: 'center',
    marginBottom: 12,
  },
});