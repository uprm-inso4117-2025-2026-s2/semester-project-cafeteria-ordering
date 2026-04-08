import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


type BannerState = "offline" | "online" | "hidden";

export default function OfflineBanner() {
  const { top } = useSafeAreaInsets();
  const [bannerState, setBannerState] = useState<BannerState>("hidden");
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(() => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);

    if (bannerState === "hidden") {
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


    if (bannerState === "online") {
      dismissTimer.current = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setBannerState("hidden"));
      }, 3000);
    }
  }, [bannerState]);

  function dismiss() {
    Animated.timing(slideAnim, {
      toValue: -60,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setBannerState("hidden"));
  }

  if (bannerState === "hidden") return null;

  const isOffline = bannerState === "offline";

  return (
    <Animated.View
      style={[
        styles.banner,
        isOffline ? styles.offlineBanner : styles.onlineBanner,
        { top: 0, paddingTop: top, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.left}>
        <Ionicons
          name={isOffline ? "warning-outline" : "checkmark-circle-outline"}
          size={18}
          color="#fff"
          style={styles.icon}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {isOffline ? "You're offline" : "Back Online"}
          </Text>
          <Text style={styles.subtitle}>
            {isOffline
              ? "Showing cached data. Changes will sync when reconnected."
              : "You are reconnected, refreshing..."}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={dismiss} style={styles.closeBtn}>
        <Ionicons name="close" size={18} color="#fff" />
      </TouchableOpacity>
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
  offlineBanner: {
    backgroundColor: "#F4845F",
  },
  onlineBanner: {
    backgroundColor: "#2E7D32",
  },
  left: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 8,
  },
  icon: {
    marginTop: 1,
  },
  title: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  subtitle: {
    color: "#fff",
    fontSize: 11,
    opacity: 0.9,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});