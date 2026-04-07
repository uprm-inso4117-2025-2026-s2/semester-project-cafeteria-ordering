import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SyncState = "syncing" | "success" | "error" | "hidden";

export default function SyncBanner() {
  const { top } = useSafeAreaInsets();
  const [syncState, setSyncState] = useState<SyncState>("hidden");
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);

    if (syncState === "hidden") {
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (syncState === "success") {
      dismissTimer.current = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setSyncState("hidden"));
      }, 3000);
    }
  }, [syncState]);

  function dismiss() {
    Animated.timing(slideAnim, {
      toValue: -60,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSyncState("hidden"));
  }

  function handleRetry() {
    // Replace with real sync call when backend is ready
    setSyncState("syncing");
  }

  if (syncState === "hidden") return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        syncState === "syncing" && styles.syncingBanner,
        syncState === "success" && styles.successBanner,
        syncState === "error" && styles.errorBanner,
        { top: 0, paddingTop: top, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.left}>
        {syncState === "syncing" && (
          <ActivityIndicator size="small" color="#185FA5" style={styles.icon} />
        )}
        {syncState === "success" && (
          <Ionicons name="checkmark-circle" size={20} color="#0F6E56" style={styles.icon} />
        )}
        {syncState === "error" && (
          <Ionicons name="close-circle" size={20} color="#A32D2D" style={styles.icon} />
        )}
        <Text
          style={[
            styles.title,
            syncState === "syncing" && { color: "#0C447C" },
            syncState === "success" && { color: "#085041" },
            syncState === "error" && { color: "#791F1F" },
          ]}
        >
          {syncState === "syncing" && "Syncing your data..."}
          {syncState === "success" && "All data synced"}
          {syncState === "error" && "Sync failed"}
        </Text>
      </View>

      {syncState === "error" && (
        <TouchableOpacity onPress={handleRetry} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
      {syncState === "success" && (
        <TouchableOpacity onPress={dismiss}>
          <Ionicons name="close" size={16} color="#085041" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 999,
  },
  syncingBanner: {
    backgroundColor: "#E6F1FB",
    borderBottomWidth: 0.5,
    borderBottomColor: "#378ADD",
  },
  successBanner: {
    backgroundColor: "#E1F5EE",
    borderBottomWidth: 0.5,
    borderBottomColor: "#1D9E75",
  },
  errorBanner: {
    backgroundColor: "#FCEBEB",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E24B4A",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  icon: {
    flexShrink: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
  },
  retryBtn: {
    backgroundColor: "#E24B4A",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginLeft: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
