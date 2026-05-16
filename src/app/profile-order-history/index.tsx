import { Colors, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Status = "Pending" | "Complete" | "Cancelled";
type Filter = "All Orders" | "In Progress" | "Completed" | "Cancelled";

const orders = [
  {
    id: "100",
    total: "$21.40",
    placed: "03/13/26 @ 2:00pm",
    items: "2x Rice Bowl, 1x Latte, 3x Espresso shots",
    notes: "“Pour espresso shots on latte”",
    status: "Pending" as Status,
  },
  {
    id: "115",
    total: "$12.00",
    placed: "03/01/26 @ 3:20pm",
    items: "2x Rice Bowl",
    notes: "None",
    status: "Complete" as Status,
  },
  {
    id: "122",
    total: "$21.40",
    placed: "02/28/26 1:27pm",
    items: "2x Rice Bowl, 1x Latte, 3x Espresso shots",
    notes: "“None”",
    status: "Pending" as Status,
  },
  {
    id: "130",
    total: "$21.40",
    placed: "01/1/26 @ 11:04am",
    items: "1x Dinner Combo",
    notes: "“Without onions please”",
    status: "Cancelled" as Status,
  },
];

export default function ProfileOrderHistoryScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";

  const [selectedTab, setSelectedTab] = useState<Filter>("All Orders");

  const tabs: Filter[] = ["All Orders", "In Progress", "Completed", "Cancelled"];

  const filteredOrders = orders.filter((order) => {
    if (selectedTab === "All Orders") return true;
    if (selectedTab === "Completed") return order.status === "Complete";
    if (selectedTab === "Cancelled") return order.status === "Cancelled";
    return false;
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: Colors.primaryGreen }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={30} color="#FFFFFF" />
          </Pressable>

          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? "#fff" : "#2D2D2D", ...Typography.heading },
            ]}
          >
            Order history
          </Text>

          <Image
            source={require("../../../documentation/branding/images/Dark-Mode-Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            {tabs.map((tab) => (
              <Pressable key={tab} onPress={() => setSelectedTab(tab)}>
                <Text
                  style={[
                    styles.tabText,
                    { color: theme.text, ...Typography.body },
                    selectedTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View
            style={[
              styles.tabLine,
              { backgroundColor: isDark ? "#444444" : "#777777" },
            ]}
          />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
        >
          {filteredOrders.map((order) => (
            <View
              key={order.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.background,
                  borderColor: isDark ? "#333333" : "#D0D0D0",
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text
                  style={[
                    styles.orderTitle,
                    { color: theme.text, ...Typography.heading },
                  ]}
                >
                  Order #{order.id}
                </Text>

                <StatusBadge status={order.status} />
              </View>

              <Text style={[styles.infoText, { ...Typography.body }]}>
                <Text style={styles.grayLabel}>Total: </Text>
                <Text style={[styles.boldText, { color: theme.text }]}>
                  {order.total}
                </Text>
              </Text>

              <Text style={[styles.infoText, { ...Typography.body }]}>
                <Text style={styles.grayLabel}>Placed: </Text>
                <Text style={[styles.boldText, { color: theme.text }]}>
                  {order.placed}
                </Text>
              </Text>

              <Text
                style={[
                  styles.itemsText,
                  { color: theme.text, ...Typography.body },
                ]}
              >
                {order.items}
              </Text>

              <Text style={[styles.notesText, { color: theme.text, ...Typography.body }]}>
                <Text style={[styles.boldText, { color: theme.text }]}>Notes: </Text>
                <Text
                  style={[
                    styles.boldText,
                    { color: theme.text },
                    order.notes !== "None" && styles.italicText,
                  ]}
                >
                  {order.notes}
                </Text>
              </Text>

              <View
                style={[
                  styles.divider,
                  { backgroundColor: isDark ? "#333333" : "#E0E0E0" },
                ]}
              />

              <View style={styles.detailsRow}>
                <Pressable
                  style={[
                    styles.detailsButton,
                    { borderColor: theme.tint },
                  ]}
                >
                  <Text
                    style={[
                      styles.detailsText,
                      { color: theme.tint, ...Typography.button },
                    ]}
                  >
                    See Details
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const badgeStyle =
    status === "Pending"
      ? styles.pendingBadge
      : status === "Complete"
        ? styles.completeBadge
        : styles.cancelledBadge;

  const textStyle =
    status === "Pending"
      ? styles.pendingText
      : status === "Complete"
        ? styles.completeText
        : styles.cancelledText;

  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={[styles.badgeText, textStyle]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: Platform.OS === "ios" ? 116 : 96,
    paddingTop: Platform.OS === "ios" ? 42 : 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#7DAF77",
  },
  backButton: {
    width: 46,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "700",
    textAlign: "center",
  },
  logo: {
    width: 72,
    height: 72,
  },
  tabsWrapper: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 18,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingHorizontal: 12,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
  },
  activeTabText: {
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  tabLine: {
    height: 1,
    width: "58%",
    marginTop: 5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 36,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    marginBottom: 22,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  orderTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  infoText: {
    fontSize: 14,
    marginTop: 2,
  },
  grayLabel: {
    color: "#A5A5AF",
    fontWeight: "800",
  },
  boldText: {
    fontWeight: "800",
  },
  itemsText: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
  },
  notesText: {
    marginTop: 3,
    fontSize: 14,
  },
  italicText: {
    fontStyle: "italic",
  },
  divider: {
    height: 1.3,
    marginTop: 13,
  },
  detailsRow: {
    alignItems: "flex-end",
    marginTop: 9,
  },
  detailsButton: {
    borderWidth: 1.2,
    borderRadius: 7,
    paddingVertical: 8,
    paddingHorizontal: 26,
  },
  detailsText: {
    fontSize: 14,
    fontWeight: "800",
  },
  badge: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1.3,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "800",
  },
  pendingBadge: {
    backgroundColor: "#FFE4CE",
    borderColor: "#F0A66E",
  },
  pendingText: {
    color: "#B96527",
  },
  completeBadge: {
    backgroundColor: "#C9F7D1",
    borderColor: "#5DE07B",
  },
  completeText: {
    color: "#3BA34E",
  },
  cancelledBadge: {
    backgroundColor: "#FFD7D7",
    borderColor: "#FF7B7B",
  },
  cancelledText: {
    color: "#D73535",
  },
});