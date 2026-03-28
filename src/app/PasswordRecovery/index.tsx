import { AccessibilityInfo, Dimensions, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import InputField from '@/components/ui/inputField';
import PopupCard from '@/components/ui/popupCard';
import PrimaryButton from '@/components/ui/primaryButton';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useState } from 'react';


export default function ForgotPassword() {

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const errorColor = useThemeColor({ light: '#FF746C', dark: Colors.pastelPeach }, 'text');

  // Checks for errors in form and carries out backend logic for sending recovery email
  const handleRecoveryLinkSend = async () => {
    const validationErrors = CheckEmail({ email });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      AccessibilityInfo.announceForAccessibility(
        'There are errors in the form. Please review and correct them.'
      );
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setShowPopup(true);

    try {
      // TODO: send recovery link to email
      console.log('Password recovery:', { email });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="heading" style={styles.heading}>Forgot Password</ThemedText>

      <ThemedText type='body' style={styles.body}>Please enter the email linked to your account to receive password reset link</ThemedText>
      
      {/* Email input field */}
      <ThemedText type='body' style={styles.fieldLabel}>Email</ThemedText>
      <InputField value={email} onChangeText={setEmail} width={Dimensions.get('window').width - 100} inputStyle={styles.inputField}></InputField>

      {/* Error message */}
      {errors.email && (
        <ThemedText style={{ color: errorColor, alignSelf: 'flex-start' }}>{errors.email}</ThemedText>
      )}

      <PrimaryButton title='Send recovery link' width={170} height={40} onPress={handleRecoveryLinkSend} style={{marginTop: 60}}></PrimaryButton>

      {/* Popup card */}
      <PopupCard visible={showPopup} width={Dimensions.get('window').width - 70} height={300} style={{alignContent: 'center', justifyContent: 'center'}}>
        <PrimaryButton title='x' onPress={() => setShowPopup(!showPopup)} backgroundColor='#00000000' textColor={errorColor} style={styles.popupX} textStyle={{fontSize: 20}} height={15} width={15}></PrimaryButton>
        <ThemedText type='heading' style={[styles.heading, {textAlign: 'center'}]}>Check your email</ThemedText>
        <ThemedText type='body' style={[styles.body, {textAlign: 'center', paddingTop: 5}]}>Password reset link has been sent to your email</ThemedText>
        <PrimaryButton title='Return to Login' width={170} height={40} style={{marginVertical: 20}}></PrimaryButton>
      </PopupCard>
    </ThemedView>
  );
}


// Validates email format
function CheckEmail({ email } : {email: string}) {
  const errors: Record<string, string> = {};

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  return errors
}


// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingHorizontal: 50
  },
  heading: {
    margin: 10,
    paddingVertical: 20,
  },
  body: {
    textAlign: 'center',
    paddingVertical: 20,
  },
  fieldLabel: {
    textAlign: 'left',
    alignSelf: 'flex-start',
    paddingTop: 80,
  },
  inputField: {
    marginBottom: 10,
  },
  popupX: {
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 0,
    margin: 0,
  }
});
