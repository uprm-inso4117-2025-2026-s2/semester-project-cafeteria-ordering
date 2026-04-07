import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfile() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={34} color="#111111" />
            </Pressable>

            <Text style={styles.headerTitle}>Edit Profile</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.greenLine} />

          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={112} color="#B9B9B9" />
              </View>

              <Pressable style={styles.editPhotoButton}>
                <Ionicons name="create-outline" size={28} color="#111111" />
              </Pressable>
            </View>

            <Text style={styles.profilePictureText}>Profile Picture</Text>
          </View>

          <Text style={styles.aboutText}>About you</Text>

          <View style={styles.formSection}>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Full Name<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
              />
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                style={styles.input}
              />
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Email<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                style={styles.input}
              />
            </View>

            {/* ✅ UPDATED PASSWORD ROW */}
            <View style={styles.passwordRow}>
              <View style={styles.passwordLeft}>
                <Text style={styles.label}>
                  Password<Text style={styles.required}>*</Text>
                </Text>
              </View>

              <View style={styles.passwordRight}>
                <Pressable>
                  <Text style={styles.changeText}>Change</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <Pressable style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>

            <Pressable style={styles.discardButton}>
              <Text style={styles.discardButtonText}>Discard Changes</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
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
    backgroundColor: '#F4F4F4',
  },
  backButton: {
    width: 42,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111111',
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
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPhotoButton: {
    position: 'absolute',
    top: 18,
    right: 22,
  },
  profilePictureText: {
    marginTop: 8,
    fontSize: 17,
    color: '#1B1B1B',
  },

  aboutText: {
    marginLeft: 20,
    marginBottom: 4,
    color: '#F3A58A',
    fontSize: 16,
  },

  formSection: {
    marginTop: 2,
  },
  inputBlock: {
    minHeight: 54,
    borderBottomWidth: 1,
    borderBottomColor: '#CFCFCF',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  label: {
    fontSize: 17,
    color: '#111111',
  },
  required: {
    color: '#F3A58A',
  },
  input: {
    marginTop: 2,
    fontSize: 16,
  },

  /* ✅ UPDATED STYLES ONLY HERE */
  passwordRow: {
    minHeight: 92,
    borderBottomWidth: 1,
    borderBottomColor: '#CFCFCF',
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
    marginTop: 78,
    paddingHorizontal: 36,
    gap: 18,
  },
  saveButton: {
    backgroundColor: '#A8D3A4',
    borderWidth: 2,
    borderColor: '#3E8E41',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 17,
  },
  discardButton: {
    backgroundColor: '#D7D7D7',
    borderWidth: 2,
    borderColor: '#F0B49F',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  discardButtonText: {
    fontSize: 17,
  },
});