import { supabase } from '@/lib/supabase';
import { getProfileByUserId, updateProfileName, updateProfilePhone } from '@/lib/profiles';
import { useEffect } from 'react';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EditProfile() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const profile = await getProfileByUserId(user.id);
    if (!profile) return;
    setFullName(profile.full_name ?? '');
    setPhoneNumber(profile.phone ?? '');
    setEmail(user.email ?? '');
  }
  loadProfile();
}, []);

  /*function handleSave() {
    Alert.alert(
      'Profile Updated',
      'Changes are not saved yet.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }*/

  async function handleSave() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await updateProfileName(user.id, fullName);
    await updateProfilePhone(user.id, phoneNumber);
    Alert.alert('Profile Updated', 'Your changes have been saved.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  } catch (err: any) {
    Alert.alert('Error', err.message);
  }
}

  function handleDiscardChanges() {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  }

  function handlePasswordChange() {
    Alert.alert('Change Password', 'Password change is not available yet.');
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScrollView
          style={[styles.container, { backgroundColor: theme.background }]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { backgroundColor: theme.background }]}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={34} color={theme.text} />
            </Pressable>

            <Text style={[styles.headerTitle, { color: theme.text, ...Typography.heading }]}>
              Edit Profile
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.greenLine} />

          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: colorScheme === 'dark' ? '#3A3A3A' : '#D9D9D9' },
                ]}
              >
                <Ionicons name="person" size={112} color="#B9B9B9" />
              </View>
            </View>

            <Text style={[styles.profilePictureText, { color: theme.text, ...Typography.body }]}>
              Profile Picture
            </Text>
          </View>

          <Text style={[styles.aboutText, { color: Colors.pastelPeach, ...Typography.body }]}>
            About you
          </Text>

          <View style={styles.formSection}>
            <View
              style={[
                styles.inputBlock,
                { borderBottomColor: colorScheme === 'dark' ? '#333333' : '#CFCFCF' },
              ]}
            >
              <Text style={[styles.label, { color: theme.text, ...Typography.body }]}>
                Full Name<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                style={[styles.input, { color: theme.text, ...Typography.body }]}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.mutedGray}
              />
            </View>

            <View
              style={[
                styles.inputBlock,
                { borderBottomColor: colorScheme === 'dark' ? '#333333' : '#CFCFCF' },
              ]}
            >
              <Text style={[styles.label, { color: theme.text, ...Typography.body }]}>
                Username
              </Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                style={[styles.input, { color: theme.text, ...Typography.body }]}
                placeholder="Enter your username"
                placeholderTextColor={Colors.mutedGray}
              />
            </View>

            <View
              style={[
                styles.inputBlock,
                { borderBottomColor: colorScheme === 'dark' ? '#333333' : '#CFCFCF' },
              ]}
            >
              <Text style={[styles.label, { color: theme.text, ...Typography.body }]}>
                Email<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { color: theme.text, ...Typography.body }]}
                placeholder="Enter your email"
                placeholderTextColor={Colors.mutedGray}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View
              style={[
                styles.inputBlock,
                { borderBottomColor: colorScheme === 'dark' ? '#333333' : '#CFCFCF' },
              ]}
            >
              <Text style={[styles.label, { color: theme.text, ...Typography.body }]}>
                Phone Number
              </Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                style={[styles.input, { color: theme.text, ...Typography.body }]}
                placeholder="Enter your phone number"
                placeholderTextColor={Colors.mutedGray}
                keyboardType="phone-pad"
              />
            </View>

            <View
              style={[
                styles.passwordRow,
                { borderBottomColor: colorScheme === 'dark' ? '#333333' : '#CFCFCF' },
              ]}
            >
              <View style={styles.passwordLeft}>
                <Text style={[styles.label, { color: theme.text, ...Typography.body }]}>
                  Password<Text style={styles.required}>*</Text>
                </Text>
              </View>

              <View style={styles.passwordRight}>
                <Pressable onPress={handlePasswordChange}>
                  <Text style={[styles.changeText, { ...Typography.button }]}>Change</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.buttonSection}>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, { opacity: 0.8 }]}
            activeOpacity={0.6}
          >
            <Text style={[styles.saveButtonText, { ...Typography.button }]}>
              Save
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDiscardChanges}
            style={[styles.discardButton, { opacity: 0.8 }]}
            activeOpacity={0.6}
          >
            <Text
              style={[
                styles.discardButtonText,
                { color: theme.text, ...Typography.button },
              ]}
            >
              Discard Changes
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },

  header: {
    height: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  backButton: {
    width: 42,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'serif',
  },
  headerSpacer: {
    width: 42,
  },
  greenLine: {
    height: 1,
    backgroundColor: '#4D9A51',
  },

  profileSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePictureText: {
    marginTop: 8,
    fontSize: 17,
  },

  aboutText: {
    marginLeft: 20,
    marginBottom: 4,
    fontSize: 16,
  },

  formSection: {
    marginTop: 2,
  },
  inputBlock: {
    minHeight: 54,
    borderBottomWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  label: {
    fontSize: 17,
  },
  required: {
    color: '#F3A58A',
  },
  input: {
    marginTop: 2,
    fontSize: 16,
  },

  passwordRow: {
    minHeight: 92,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },
  passwordLeft: {
    justifyContent: 'flex-start',
    marginTop: -2,
  },
  passwordRight: {
    justifyContent: 'flex-end',
    marginTop: 18,
  },

  changeText: {
    color: '#429142',
    fontSize: 17,
    fontWeight: '500',
  },

  buttonSection: {
    marginTop: 24,
    paddingHorizontal: 36,
    gap: 18,
  },
  saveButton: {
    borderWidth: 2,
    borderColor: '#3E8E41',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  saveButtonText: {
    color: '#327534',
    fontSize: 17,
  },
  discardButton: {
    borderWidth: 2,
    borderColor: '#F0B49F',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  discardButtonText: {
    fontSize: 17,
  },
});