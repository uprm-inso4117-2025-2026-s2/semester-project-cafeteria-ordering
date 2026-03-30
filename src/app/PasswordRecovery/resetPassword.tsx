import { AccessibilityInfo, Dimensions, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import InputField from '@/components/ui/inputField';
import PopupCard from '@/components/ui/popupCard';
import PrimaryButton from '@/components/ui/primaryButton';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useState } from 'react';


export default function ResetPassword() {

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const errorColor = useThemeColor({ light: '#FF746C', dark: Colors.pastelPeach }, 'text');
  
  // Checks for errors in form and carries out backend logic for resetting password
  const handlePasswordReset = async () => {
    const validationErrors = CheckNewPassword({ newPassword });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      AccessibilityInfo.announceForAccessibility(
        'There are errors in the form. Please review and correct them.'
      );
      return;
    } else if (newPassword != confirmPassword) {
      setErrors({'confirm': 'Passwords don\'t match'});
      AccessibilityInfo.announceForAccessibility(
        'There are errors in the form. Please review and correct them.'
      );
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setShowPopup(true);

    try {
        // TODO: reset password in supabase
      console.log('New password:', { newPassword });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="heading" style={styles.heading}>Reset Password</ThemedText>

      {/* Password requirement checklist */}
      <ThemedText type='body' style={styles.body}>Password must have:</ThemedText>
      <PasswordChecklist newPassword={newPassword}></PasswordChecklist>

      {/* New Password input field */}
      <ThemedText type='body' style={styles.fieldLabel}>New Password</ThemedText>
      <InputField label='password' onChangeText={(text) => {
        setNewPassword(text);
        if (errors.newPassword) { 
          setErrors((prev) => ({ ...prev, newPassword: '' }));
        }}}
        width={Dimensions.get('window').width - 100} height={50} inputStyle={styles.inputField}></InputField>
      
      {/* New Password error message */}
      {errors.newPassword && (
        <ThemedText type='body' style={{ color: errorColor, alignSelf: 'flex-start' }}>{errors.newPassword}</ThemedText>
      )}

      {/* Confirm Password input field */}
      <ThemedText type='body' style={styles.fieldLabel}>Confirm Password</ThemedText>
      <InputField onChangeText={(text) => {
        setConfirmPassword(text);
        if (errors.confirm) { 
          setErrors((prev) => ({ ...prev, confirm: '' }));
        }}}
        width={Dimensions.get('window').width - 100} height={50} inputStyle={styles.inputField}></InputField>
      
      {/* Confirm Password error message */}
      {errors.confirm && (
        <ThemedText type='body' style={{ color: errorColor, alignSelf: 'flex-start' }}>{errors.confirm}</ThemedText>
      )}

      <PrimaryButton title='Reset password' width={170} height={50} style={styles.submitButton} onPress={handlePasswordReset}></PrimaryButton>

      {/* Popup card */}
      <PopupCard visible={showPopup} width={Dimensions.get('window').width - 70} height={250} style={{alignContent: 'center', justifyContent: 'center'}}>
        <ThemedText type='heading' style={[styles.heading, {textAlign: 'center'}]}>Password reset complete</ThemedText>
        <ThemedText type='body' style={[styles.body, {textAlign: 'center'}]}>Return to app and log in</ThemedText>
      </PopupCard>
    </ThemedView>
  );
}


// Display criteria new password meets as user types it
function PasswordChecklist({ newPassword, }: { newPassword: string;}) {
  const checks = [
    { value: 'At least 8 characters', met: newPassword.length >= 8 },
    { value: 'At least 1 uppercase', met: /[A-Z]/.test(newPassword) },
    { value: 'At least 1 lowercase', met: /[a-z]/.test(newPassword) },
    { value: 'At least 1 number', met: /[0-9]/.test(newPassword) },
  ];
  const defaultColor = useThemeColor({ light: Colors.light.text, dark: Colors.dark.text }, 'text');

  return (
    <ThemedView style={styles.checklistContainer}>
      {checks.map((c) => (
        <ThemedView key={c.value} style={styles.checklistRow}>

          {/* Checkmarks change from default text color to green to indicate password met particular criteria */}
          <ThemedText type='body' style={{fontSize: 14, color: c.met ? Colors.primaryGreen : defaultColor }}>✓</ThemedText> 
          <ThemedText type='body'>{' '}{c.value}</ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  );
}


// Validate new password meets minimum criteria
function CheckNewPassword({ newPassword } : {newPassword: string}) {
    const errors: Record<string, string> = {};

    if (!newPassword) {
        errors.newPassword = 'Password is required.';
    } else if (!(newPassword.length >= 8)) {
        errors.newPassword = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(newPassword)) {
        errors.newPassword = 'Password must contain at least 1 uppercase letter.';
    } else if (!/[a-z]/.test(newPassword)) {
        errors.newPassword = 'Password must contain at least 1 lowercase letter.';
    } else if (!/[0-9]/.test(newPassword)) {
        errors.newPassword = 'Password must contain at least 1 number.';
    }

    return errors
}


// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 40,
    paddingHorizontal: 50
  },
  heading: {
    margin: 10,
    paddingVertical: 15,
  },
  body: {
    textAlign: 'center',
    paddingVertical: 20,
  },
  fieldLabel: {
    textAlign: 'left',
    alignSelf: 'flex-start',
    paddingTop: 30,
  },
  inputField: {
    marginBottom: 5,
  },
  submitButton: {
    margin: 40,
  },
  checklistContainer: { 
    marginBottom: 10, 
    marginLeft: 4 
  },
  checklistRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 4 
  },
  termsRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 3,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
