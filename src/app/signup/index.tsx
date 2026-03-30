import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
  primary: '#2E7D32',           // Primary Green — buttons, CTA
  primaryDisabled: '#A5D6A7',   // Pastel Sage — disabled state
  light: {
    background: '#FAFAFA',       // Off White — light bg
    text: '#424242',             // Charcoal — primary text
    subtext: '#BDBDBD',          // Muted Gray — secondary text
    inputBackground: '#A5D6A7',  // Pastel Sage — input fills
    inputText: '#424242',        // Charcoal — input text
    inputPlaceholder: '#BDBDBD', // Muted Gray — placeholder
    errorText: '#C62828',        // Error red (standard, not in palette)
    checkmark: '#2E7D32',        // Primary Green — met criteria
    checklistText: '#424242',    // Charcoal — checklist text
    border: '#BDBDBD',           // Muted Gray — borders
    avatarBorder: '#BDBDBD',     // Muted Gray — avatar ring
    termsText: '#424242',        // Charcoal — terms body
    termsLink: '#2E7D32',        // Primary Green — terms links
  },
  dark: {
    background: '#1C1C1C',       // Dark Charcoal — dark bg
    text: '#FFFFFF',             // White — primary text
    subtext: '#BDBDBD',          // Muted Gray — secondary text
    inputBackground: '#424242',  // Charcoal — input fills in dark
    inputText: '#FFFFFF',        // White — input text
    inputPlaceholder: '#BDBDBD', // Muted Gray — placeholder
    errorText: '#FFCCBC',        // Pastel Peach — error in dark mode
    checkmark: '#A5D6A7',        // Pastel Sage — met criteria
    checklistText: '#FFFFFF',    // White — checklist text
    border: '#BDBDBD',           // Muted Gray — borders
    avatarBorder: '#BDBDBD',     // Muted Gray — avatar ring
    termsText: '#BDBDBD',        // Muted Gray — terms body
    termsLink: '#A5D6A7',        // Pastel Sage — terms links
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  isPassword?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  accessibilityLabel?: string;
  errorText?: string;
  colors: typeof Colors.light;
}

// ─── InputField Component ─────────────────────────────────────────────────────
function InputField({
  label,
  required = false,
  value,
  onChangeText,
  placeholder,
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
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
        {required && <Text style={{ color: '#C62828' }}> *</Text>}
      </Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
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
              size={20}
              color={colors.inputPlaceholder}
            />
          </TouchableOpacity>
        )}
      </View>
      {errorText ? (
        <Text style={[styles.errorText, { color: colors.errorText }]}>{errorText}</Text>
      ) : null}
    </View>
  );
}

// ─── PasswordChecklist ────────────────────────────────────────────────────────
function PasswordChecklist({
  password,
  colors,
}: {
  password: string;
  colors: typeof Colors.light;
}) {
  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least 1 uppercase', met: /[A-Z]/.test(password) },
    { label: 'At least 1 number', met: /[0-9]/.test(password) },
  ];
  return (
    <View style={styles.checklistContainer}>
      {checks.map((c) => (
        <View key={c.label} style={styles.checklistRow}>
          <Text style={{ color: c.met ? colors.checkmark : colors.subtext, fontSize: 16 }}>
            ✔
          </Text>
          <Text style={[styles.checklistText, { color: c.met ? colors.checklistText : colors.subtext }]}>
            {' '}{c.label}
          </Text>
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
  agreedToTerms: boolean;
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
  } else if (!/[A-Z]/.test(fields.password)) {
    errors.password = 'Password must contain at least 1 uppercase letter.';
  } else if (!/[0-9]/.test(fields.password)) {
    errors.password = 'Password must contain at least 1 number.';
  }
  if (!fields.agreedToTerms) errors.terms = 'You must agree to the Terms and Privacy Policy.';
  return errors;
}

// ─── SignUpScreen ─────────────────────────────────────────────────────────────
export default function SignUpScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function guardAuthenticatedUsers() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (!error && session?.user) {
        router.replace('/menu');
      }
    }

    guardAuthenticatedUsers();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace('/menu');
      }
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [router]);

  function mapSignUpError(message: string) {
    const normalized = message.toLowerCase();

    if (normalized.includes('already registered') || normalized.includes('already exists')) {
      return 'This email is already registered. Try logging in instead.';
    }

    if (normalized.includes('password')) {
      return 'Your password does not meet the required security rules.';
    }

    if (normalized.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }

    return 'Unable to create your account right now. Please try again.';
  }

  const handleSignUp = async () => {
    const validationErrors = validate({ fullName, email, password, agreedToTerms });
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
        const message = mapSignUpError(error.message);
        setAuthMessage(message);
        AccessibilityInfo.announceForAccessibility(message);
        return;
      }

      const createdUser = data.user?.email ?? email.trim();
      if (data.session?.user) {
        const successMessage = `Account created for ${createdUser}.`;
        setAuthMessage(successMessage);
        AccessibilityInfo.announceForAccessibility(successMessage);
        router.replace('/menu');
        return;
      }

      const pendingMessage =
        'This email may already be registered or needs email confirmation. Try logging in or check your inbox.';
      setAuthMessage(pendingMessage);
      AccessibilityInfo.announceForAccessibility(pendingMessage);

      // Keep email so users can see which account was created.
      setFullName('');
      setPhone('');
      setPassword('');
      setAgreedToTerms(false);
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
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          Create Your Account
        </Text>

        {/* ── Avatar ── */}
        <View style={[styles.avatarContainer, { borderColor: colors.avatarBorder }]}>
          <Ionicons name="person-circle-outline" size={60} color={colors.avatarBorder} />
        </View>

        {/* ── Fields ── */}
        <View style={styles.form}>
          <InputField
            label="Full Name"
            required
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              if (errors.fullName) setErrors((e) => ({ ...e, fullName: '' }));
            }}
            autoCapitalize="words"
            errorText={errors.fullName}
            accessibilityLabel="Full Name"
            colors={colors}
          />

          <InputField
            label="Email"
            required
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((e) => ({ ...e, email: '' }));
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            errorText={errors.email}
            accessibilityLabel="Email address"
            colors={colors}
          />

          <InputField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            autoCapitalize="none"
            keyboardType="phone-pad"
            accessibilityLabel="Phone number"
            colors={colors}
          />

          <InputField
            label="Password"
            required
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

          <PasswordChecklist password={password} colors={colors} />

          {/* ── Terms Checkbox ── */}
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
                  borderColor: errors.terms ? '#C62828' : colors.border,
                  backgroundColor: agreedToTerms ? Colors.primary : 'transparent',
                },
              ]}
            >
              {agreedToTerms && (
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>✓</Text>
              )}
            </View>
            <Text style={[styles.termsText, { color: colors.termsText }]}>
              I agree on all{' '}
              <Text style={{ color: colors.termsLink, textDecorationLine: 'underline' }}>Terms</Text>
              {' '}and{' '}
              <Text style={{ color: colors.termsLink, textDecorationLine: 'underline' }}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms && (
            <Text style={[styles.errorText, { color: colors.errorText }]}>{errors.terms}</Text>
          )}
        </View>

        {/* ── Sign Up Button ── */}
        <TouchableOpacity
          onPress={handleSignUp}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Sign up"
          accessibilityState={{ disabled: isSubmitting }}
          style={[
            styles.primaryButton,
            { backgroundColor: isSubmitting ? Colors.primaryDisabled : Colors.primary },
          ]}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
            {isSubmitting ? 'Creating Account…' : 'Sign up'}
          </Text>
        </TouchableOpacity>

        {authMessage && (
          <Text
            style={[
              styles.authMessage,
              { color: authMessage.toLowerCase().includes('account created') ? Colors.primary : colors.errorText },
            ]}>
            {authMessage}
          </Text>
        )}
        {authMessage && __DEV__ && authMessage.toLowerCase().includes('unable to create') && (
          <Text style={[styles.authMessage, { color: colors.subtext }]}>Check Metro logs for the Supabase error message.</Text>
        )}

        {/* ── Log In Link ── */}
        <View style={styles.loginLinkRow}>
          <Text style={[styles.loginLinkText, { color: colors.subtext }]}>
            Already have an account?{' '}
          </Text>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={'/login' as any} asChild>
            <TouchableOpacity accessibilityRole="link" accessibilityLabel="Log in">
              <Text style={[styles.loginLink, { color: colors.text, textDecorationLine: 'underline' }]}>
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
  flex: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  title: {
    fontFamily: 'Inter_500Medium',
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
  form: { width: '100%', maxWidth: 480 },
  fieldContainer: { marginBottom: 16 },
  label: {
    fontFamily: 'Inter_500Medium',
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
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    padding: 0,
  },
  eyeButton: { paddingLeft: 8 },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  checklistContainer: { marginBottom: 20, marginLeft: 4 },
  checklistRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  checklistText: { fontFamily: 'Inter_400Regular', fontSize: 16 },
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
  termsText: { fontFamily: 'Inter_400Regular', fontSize: 16, flex: 1 },
  primaryButton: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
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
    marginTop: 8,
  },
  loginLinkText: { fontFamily: 'Inter_400Regular', fontSize: 16 },
  loginLink: { fontFamily: 'Inter_500Medium', fontSize: 16, fontWeight: '500' },
  authMessage: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 480,
  },
});