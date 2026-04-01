import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
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

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

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
      <ThemedText type="body" style={styles.label}>{label}</ThemedText>
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
    errors.emailOrUsername = 'Email or username is required.';
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

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try {
      // TODO: wire up Supabase auth
      console.log('Sign in:', { emailOrUsername });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    // TODO: wire up Google OAuth
    console.log('Sign in with Google');
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
            label="Email or username"
            value={emailOrUsername}
            onChangeText={(t) => {
              setEmailOrUsername(t);
              if (errors.emailOrUsername) setErrors((e) => ({ ...e, emailOrUsername: '' }));
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            errorText={errors.emailOrUsername}
            accessibilityLabel="Email or username"
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
          <Link href={'/forgot-password' as any} asChild>
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
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
          accessibilityState={{ disabled: isSubmitting }}
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
          accessibilityRole="button"
          accessibilityLabel="Sign in with Google"
          style={styles.googleButton}
          activeOpacity={0.85}
        >
          <ThemedText
            type="button"
            lightColor={Colors.light.secondaryText}
            darkColor={Colors.light.secondaryText}
          >
            Sign in with Google
          </ThemedText>
        </TouchableOpacity>

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
});