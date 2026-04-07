import { Colors, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
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


function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  icon,
  bgColor,
  confirmTextColor,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel: string;
  icon?: string;
  bgColor: string;
  confirmTextColor: string;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={[s.modalBox, { backgroundColor: theme.background }]}>
          {icon && <Text style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>{icon}</Text>}
          <Text style={[s.modalTitle, { color: theme.text, ...Typography.heading }]}>{title}</Text>
          <Text style={[s.modalSub, { color: Colors.mutedGray, ...Typography.body }]}>{body}</Text>
          <View style={s.modalButtons}>
            <TouchableOpacity onPress={onClose} style={[s.modalCancel, { borderColor: Colors.softGray }]}>
              <Text style={{ fontSize: 14, color: theme.text, ...Typography.button }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[s.modalAction, { backgroundColor: bgColor }]}>
              <Text style={{ fontSize: 14, color: confirmTextColor, ...Typography.button }}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}


export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  async function pickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission needed to access photos.");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      AsyncStorage.setItem("@profile_avatar", result.assets[0].uri);
    }
  }

  const [logoutModal, setLogoutModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [selectedReqs, setSelectedReqs] = useState<string[]>([]);
  const [reqNote, setReqNote] = useState("");

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    setLogoutModal(false);

    if (error) {
      Alert.alert("Logout failed", "Please try again.");
      return;
    }

    router.replace("/signup");
  }

  const REQUIREMENTS = ["Severe Allergy", "Time Restriction", "Medical Diet", "Religious / Cultural Diet", "Other"];

  function toggleReq(req: string) {
    setSelectedReqs((prev) => prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]);
  }
  useEffect(() => {
    AsyncStorage.getItem("@profile_info").then((v) => {
      if (!v) return;
      const p = JSON.parse(v);
      setName(p.name ?? "");
      setEmail(p.email ?? "");
      setPhone(p.phone ?? "");
    });
    AsyncStorage.getItem("@profile_avatar").then((v) => v && setAvatarUri(v));
  }, []);

  function handleSave() {
    setEditing(false);
    setSaved(true);
    AsyncStorage.setItem("@profile_info", JSON.stringify({ name, email, phone }));
    setTimeout(() => setSaved(false), 2500);
  }


  const borderColor = colorScheme === "dark" ? "#333333" : Colors.softGray;
  const txt = (extra?: object) => [{ color: theme.text }, Typography.body, extra];
  const muted = (extra?: object) => [{ color: Colors.mutedGray }, Typography.body, extra];

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>

      {/* Header */}
      <View style={[s.header, { backgroundColor: Colors.primaryGreen }]}>
        <TouchableOpacity onPress={() => router.replace("/")} style={s.backBtn}>
          <Ionicons name="arrow-back" size={26} color={theme.secondaryText} />
        </TouchableOpacity>
        <View pointerEvents="none" style={s.headerTitleWrapper}>
          <Text style={[s.headerTitle, { color: colorScheme === "dark" ? "#fff" : "#000", ...Typography.heading }]}>My Profile</Text>
        </View>
        <Image
          source={require("../../../documentation/branding/images/Dark-Mode-Logo.png")}
          style={s.headerLogo}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={s.avatarSection}>
          <TouchableOpacity onPress={pickAvatar} style={s.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={s.avatarCircle} />
            ) : (
              <View style={[s.avatarCircle, { backgroundColor: Colors.pastelSage, alignItems: "center", justifyContent: "center" }]}>
                <Text style={[s.avatarInitials, { color: Colors.primaryGreen }]}>
                  {name ? name.charAt(0).toUpperCase() : "?"}
                </Text>
              </View>
            )}
            <View style={s.avatarEditBadge}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[s.avatarName, { color: theme.text, ...Typography.heading }]}>{name || "Your Name"}</Text>
        </View>

        {/* Profile Fields */}
        <View style={[s.card, { backgroundColor: theme.background }]}>
          {[
            { label: "Name", value: name, setter: setName, keyboard: "default" },
            { label: "Email", value: email, setter: setEmail, keyboard: "email-address" },
            { label: "Phone", value: phone, setter: setPhone, keyboard: "phone-pad" },
          ].map(({ label, value, setter, keyboard }) => (
            <View key={label} style={s.fieldWrapper}>
              <Text style={muted({ fontSize: 12, marginBottom: 4 })}>{label}</Text>
              <TextInput
                value={value} onChangeText={setter} editable={editing}
                keyboardType={keyboard as any} autoCapitalize="none"
                autoCorrect={false} autoComplete="off"
                textContentType="none" importantForAutofill="no"
                placeholder={editing ? `Enter your ${label.toLowerCase()}` : "—"}
                placeholderTextColor={Colors.mutedGray}
                style={[s.fieldInput, { color: theme.text, ...Typography.body, borderBottomColor: editing ? theme.tint : borderColor }]}
              />
            </View>
          ))}
          <View style={s.editRow}>
            {saved ? (
              <Text style={[{ color: Colors.primaryGreen, fontSize: 15 }, Typography.button]}>Saved!</Text>
            ) : (
              <>
                <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)}>
                  <Text style={[s.editBtnText, { color: Colors.primaryGreen, ...Typography.button }]}>{editing ? "Save" : "Edit"}</Text>
                </TouchableOpacity>
                {editing && (
                  <TouchableOpacity onPress={() => setEditing(false)} style={{ marginLeft: 16 }}>
                    <Text style={muted({ fontSize: 14, ...Typography.button })}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        <View style={[s.divider, { backgroundColor: borderColor }]} />

        {/* Order History */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: theme.text, ...Typography.heading }]}>Order History</Text>
          <TouchableOpacity style={[s.outlineBtn, { borderColor: theme.tint }]}>
            <Text style={{ fontSize: 15, color: theme.tint, ...Typography.button }}>See Order History</Text>
          </TouchableOpacity>
        </View>

        <View style={[s.divider, { backgroundColor: borderColor }]} />

        {/* Actions */}
        <View style={s.section}>
          <TouchableOpacity onPress={() => setStatusModal(true)} style={[s.goldBtn, { borderColor: Colors.pastelPeach }]}>
            <Text style={{ fontSize: 15, color: theme.text, ...Typography.button }}>👑 Request Special Status</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLogoutModal(true)} style={[s.logoutBtn, { backgroundColor: Colors.pastelPeach }]}>
            <Text style={{ fontSize: 15, color: Colors.light.alternateText, ...Typography.button }}>Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <ConfirmModal
        visible={logoutModal} onClose={() => setLogoutModal(false)}
        onConfirm={handleLogout}
        title="Log out?" body="Are you sure you want to log out?"
        confirmLabel="Log out" bgColor={Colors.pastelPeach} confirmTextColor={Colors.light.alternateText}
      />
      
      <Modal visible={statusModal} transparent animationType="slide" onRequestClose={() => setStatusModal(false)}>
        <Pressable style={[s.overlay, { backgroundColor: "transparent" }]} onPress={() => setStatusModal(false)} />
        <View style={[s.bottomSheet, { backgroundColor: theme.background }]}>
          <View style={s.sheetHeader}>
            <Text style={[s.sectionTitle, { color: theme.text, ...Typography.heading }]}>Special Requirements</Text>
            <TouchableOpacity onPress={() => setStatusModal(false)}>
              <Text style={{ fontSize: 22, color: Colors.mutedGray }}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={muted({ fontSize: 13, marginBottom: 12 })}>Select everything that applies to your order needs.</Text>
          {REQUIREMENTS.map((req) => (
            <TouchableOpacity key={req} onPress={() => toggleReq(req)} style={s.reqRow}>
              <View style={[s.reqCheck, { borderColor: selectedReqs.includes(req) ? theme.tint : Colors.mutedGray, backgroundColor: selectedReqs.includes(req) ? theme.tint : "transparent" }]}>
                {selectedReqs.includes(req) && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={txt({ fontSize: 14 })}>{req}</Text>
            </TouchableOpacity>
          ))}
          <TextInput
            value={reqNote} onChangeText={setReqNote}
            placeholder="Add a note (optional)..."
            placeholderTextColor={Colors.mutedGray}
            multiline numberOfLines={3}
            style={[s.reqNoteInput, { color: theme.text, borderColor: borderColor, ...Typography.body }]}
          />
          <TouchableOpacity
            onPress={() => { setStatusModal(false); Alert.alert("Requirements submitted!"); }}
            style={[s.logoutBtn, { backgroundColor: theme.tint, marginTop: 8 }]}
          >
            <Text style={{ fontSize: 15, color: theme.secondaryText, ...Typography.button }}>Submit</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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
