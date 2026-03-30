import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
    AccessibilityInfo,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

// ─── Design Tokens (from color-palette.adoc) ─────────────────────────────────
const Colors = {
  primary: '#2E7D32',
  primaryDisabled: '#A5D6A7',
  light: {
    background: '#FAFAFA',
    text: '#424242',
    subtext: '#BDBDBD',
    inputBackground: '#A5D6A7',
    inputText: '#424242',
    inputPlaceholder: '#BDBDBD',
    errorText: '#C62828',
    forgotText: '#424242',
    bottomText: '#BDBDBD',
    bottomLink: '#424242',
    buttonText: '#FAFAFA',
  },
  dark: {
    background: '#1C1C1C',
    text: '#FFFFFF',
    subtext: '#BDBDBD',
    inputBackground: '#A5D6A7',
    inputText: '#424242',
    inputPlaceholder: '#BDBDBD',
    errorText: '#FFCCBC',
    forgotText: '#BDBDBD',
    bottomText: '#BDBDBD',
    bottomLink: '#BDBDBD',
    buttonText: '#FAFAFA',
  },
};

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
  colors: typeof Colors.light;
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
  colors,
}: InputFieldProps) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry={hidden}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          accessibilityLabel={accessibilityLabel ?? label}
          style={[styles.input, { color: colors.inputText, flex: 1 }]}
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
              color={colors.inputPlaceholder}
            />
          </TouchableOpacity>
        )}
      </View>
      {errorText ? (
        <Text
          style={[styles.errorText, { color: colors.errorText }]}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {errorText}
        </Text>
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
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [fontsLoaded] = useFonts({
    Inter_400Regular:
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
    Inter_500Medium:
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2',
    Bitter_600SemiBold:
      'https://fonts.gstatic.com/s/bitter/v32/raxhHiqOu8IVPmnRc6SY1KXhnF_Y8fbeCL_-QYQi.woff2',
  });

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!fontsLoaded) {
    return (
      <View style={[styles.flex, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

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
      style={[styles.flex, { backgroundColor: colors.background }]}
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

        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          Welcome back!
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Please enter your credentials{'\n'}to log into your account.
        </Text>

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
            colors={colors}
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
            colors={colors}
          />

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={'/forgot-password' as any} asChild>
            <TouchableOpacity
              style={styles.forgotPasswordRow}
              accessibilityRole="link"
              accessibilityLabel="Forgot password?"
            >
              <Text style={[styles.forgotPasswordLink, { color: colors.forgotText }]}>
                Forgot password?
              </Text>
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
            { backgroundColor: isSubmitting ? Colors.primaryDisabled : Colors.primary },
          ]}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignInWithGoogle}
          accessibilityRole="button"
          accessibilityLabel="Sign in with Google"
          style={styles.googleButton}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>
            Sign in with Google
          </Text>
        </TouchableOpacity>

        <View style={styles.signUpLinkRow}>
          <Text style={[styles.signUpLinkText, { color: colors.bottomText }]}>
            Don't have an account?{' '}
          </Text>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={'/signup' as any} asChild>
            <TouchableOpacity accessibilityRole="link" accessibilityLabel="Sign up">
              <Text style={[styles.signUpLink, { color: colors.bottomLink }]}>Sign up</Text>
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
  centered: { alignItems: 'center', justifyContent: 'center' },
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
    fontFamily: 'Bitter_600SemiBold',
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
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
    fontFamily: 'Inter_500Medium',
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
    fontFamily: 'Inter_400Regular',
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
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 3,
    marginLeft: 4,
  },
  forgotPasswordRow: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  forgotPasswordLink: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textDecorationLine: 'underline',
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
  buttonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  signUpLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpLinkText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  signUpLink: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});