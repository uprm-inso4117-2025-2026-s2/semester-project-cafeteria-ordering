import { Link } from 'expo-router';
import { useState } from 'react';
import {
    AccessibilityInfo,
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

// ─── Design Tokens ────────────────────────────────────────────────────────────
const Colors = {
  primary: '#2E7D32',
  primaryDisabled: '#A5D6A7',
  errorRed: '#C62828',
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#424242',
    textOnPrimary: '#FAFAFA',
    subtext: '#757575',
    inputBorder: '#BDBDBD',
    inputBorderFocus: '#2E7D32',
    inputBorderError: '#C62828',
    inputBackground: '#FFFFFF',
    helperText: '#757575',
    errorText: '#C62828',
    placeholder: '#BDBDBD',
  },
  dark: {
    background: '#1C1C1C',
    surface: '#242424',
    text: '#FFFFFF',
    textOnPrimary: '#FFFFFF',
    subtext: '#BDBDBD',
    inputBorder: '#424242',
    inputBorderFocus: '#2E7D32',
    inputBorderError: '#C62828',
    inputBackground: '#2A2A2A',
    helperText: '#BDBDBD',
    errorText: '#EF9A9A',
    placeholder: '#616161',
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  helperText?: string;
  errorText?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  accessibilityLabel?: string;
  colors: typeof Colors.light;
}

// ─── InputField Component ─────────────────────────────────────────────────────
function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  helperText,
  errorText,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  accessibilityLabel,
  colors,
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!errorText;

  const borderColor = hasError
    ? colors.inputBorderError
    : isFocused
    ? colors.inputBorderFocus
    : colors.inputBorder;

  return (
    <View style={styles.fieldContainer}>
      <Text
        style={[styles.label, { color: colors.text }]}
        accessibilityRole="text"
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={helperText}
        accessibilityInvalid={hasError}
        style={[
          styles.input,
          {
            borderColor,
            borderWidth: isFocused || hasError ? 2 : 1,
            backgroundColor: colors.inputBackground,
            color: colors.text,
          },
        ]}
      />
      {helperText && !hasError && (
        <Text
          style={[styles.helperText, { color: colors.helperText }]}
          accessibilityRole="text"
        >
          {helperText}
        </Text>
      )}
      {hasError && (
        <Text
          style={[styles.errorText, { color: colors.errorText }]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {errorText}
        </Text>
      )}
    </View>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(fields: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const errors: Record<string, string> = {};
  if (!fields.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!fields.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!fields.password) {
    errors.password = 'Password is required.';
  } else if (fields.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  if (!fields.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (fields.password !== fields.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}

// ─── SignUpScreen ─────────────────────────────────────────────────────────────
export default function SignUpScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAccount = async () => {
    const validationErrors = validate({ fullName, email, password, confirmPassword });
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
      // TODO: wire up Supabase auth — e.g.:
      // await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      console.log('Sign up:', { fullName, email });
    } finally {
      setIsSubmitting(false);
    }
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
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text
            style={[styles.title, { color: colors.text }]}
            accessibilityRole="header"
          >
            Sign Up
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Create your cafeteria ordering account
          </Text>
        </View>

        {/* ── Form Card ── */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              shadowColor: isDark ? '#000' : '#424242',
            },
          ]}
        >
          <InputField
            label="Full Name"
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              if (errors.fullName) setErrors((e) => ({ ...e, fullName: '' }));
            }}
            placeholder="Maria Rivera"
            autoCapitalize="words"
            errorText={errors.fullName}
            accessibilityLabel="Full Name"
            colors={colors}
          />

          <InputField
            label="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((e) => ({ ...e, email: '' }));
            }}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            errorText={errors.email}
            accessibilityLabel="Email address"
            colors={colors}
          />

          <InputField
            label="Password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((e) => ({ ...e, password: '' }));
            }}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            helperText="Must be at least 8 characters."
            errorText={errors.password}
            accessibilityLabel="Password"
            accessibilityHint="Must be at least 8 characters"
            colors={colors}
          />

          <InputField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (errors.confirmPassword)
                setErrors((e) => ({ ...e, confirmPassword: '' }));
            }}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            errorText={errors.confirmPassword}
            accessibilityLabel="Confirm password"
            colors={colors}
          />
        </View>

        {/* ── Primary Button ── */}
        <TouchableOpacity
          onPress={handleCreateAccount}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Create Account"
          accessibilityState={{ disabled: isSubmitting }}
          style={[
            styles.primaryButton,
            {
              backgroundColor: isSubmitting
                ? Colors.primaryDisabled
                : Colors.primary,
            },
          ]}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryButtonText, { color: Colors.light.textOnPrimary }]}>
            {isSubmitting ? 'Creating Account…' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        {/* ── Log In Link ── */}
        <View style={styles.loginLinkRow}>
          <Text style={[styles.loginLinkText, { color: colors.subtext }]}>
            Already have an account?{' '}
          </Text>
          <Link href="/login" asChild>
            <TouchableOpacity accessibilityRole="link" accessibilityLabel="Log in">
              <Text style={[styles.loginLink, { color: Colors.primary }]}>
                Log in
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
    maxWidth: 480,
  },
  title: {
    fontFamily: 'Bitter_600SemiBold',
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 12,
    padding: 24,
    gap: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  helperText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  primaryButton: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
  },
  loginLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginLinkText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  loginLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});