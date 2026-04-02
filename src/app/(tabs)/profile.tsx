import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import PrimaryButton from '@/components/ui/primaryButton';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      setEmail(session?.user?.email ?? null);
      setIsLoading(false);
    }

    loadSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setAuthMessage('Session cleared.');
    } catch {
      setAuthMessage('Unable to clear session right now. Try again.');
    }
    router.replace('/login' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
      <Text
        style={[
          styles.subtitle,
          {
            color:
              colorScheme === 'dark'
                ? Colors.dark.secondaryText
                : Colors.light.text,
          },
        ]}
      >
        Manage your account details here.
      </Text>

      {isLoading ? (
        <ActivityIndicator size="small" color={theme.text} />
      ) : email ? (
        <>
        <ThemedText type='body'>Email: {email}</ThemedText>
        </>
      ) : (
        <ThemedText type='body'>Please log in</ThemedText>
      )}

      <PrimaryButton
        title={email ? 'Log out' : 'Reset session and go to login'}
        onPress={handleSignOut}
      ></PrimaryButton>

      {authMessage && <ThemedText type='body'>{authMessage}</ThemedText>}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 24, paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  backBtn: { padding: 4 },
  headerTitleWrapper: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center", paddingTop: 32 },
  headerTitle: { fontSize: 26, fontWeight: "700", textAlign: "center" },
  headerLogo: { width: 80, height: 80, marginVertical: -12 },
  scroll: { paddingBottom: 48 },
  avatarSection: { alignItems: "center", paddingVertical: 28, gap: 4 },
  avatarWrapper: { position: "relative", marginBottom: 8 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45 },
  avatarInitials: { fontSize: 32, fontWeight: "700" },
  avatarEditBadge: { position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primaryGreen, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  avatarName: { fontSize: 18, fontWeight: "600" },
  card: { marginHorizontal: 16, padding: 16 },
  fieldWrapper: { marginBottom: 18 },
  fieldInput: { fontSize: 15, borderBottomWidth: 1.5, paddingVertical: 6 },
  editRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 6 },
  editBtnText: { fontSize: 15, borderBottomWidth: 1, paddingBottom: 1, borderBottomColor: Colors.primaryGreen },
  divider: { height: 1, marginVertical: 20, marginHorizontal: 16 },
  section: { paddingHorizontal: 16, marginBottom: 4, gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
goldBtn: { borderWidth: 1.5, borderRadius: 50, padding: 14, alignItems: "center", backgroundColor: "transparent" },
  logoutBtn: { borderRadius: 50, padding: 14, alignItems: "center" },
  outlineBtn: { borderWidth: 1.5, borderRadius: 50, padding: 14, alignItems: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  bottomSheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24, paddingBottom: Platform.OS === "ios" ? 40 : 24 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  modalBox: { borderRadius: 16, padding: 28, width: 300, alignItems: "center" },
  modalTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8, textAlign: "center" },
  modalSub: { fontSize: 13, textAlign: "center", marginBottom: 24 },
  modalButtons: { flexDirection: "row", gap: 10, width: "100%" },
  modalCancel: { flex: 1, padding: 10, borderWidth: 1, borderRadius: 50, alignItems: "center" },
  modalAction: { flex: 1, padding: 10, borderRadius: 50, alignItems: "center" },
  reqRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  reqCheck: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  reqNoteInput: { borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 12, minHeight: 70, textAlignVertical: "top" },
});
