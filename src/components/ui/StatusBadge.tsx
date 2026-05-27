/*
Reusable order status badge.

Usage:
  <StatusBadge status="Pending" />
  <StatusBadge status="Ready for Pickup" />
  <StatusBadge status="Completed" size="sm" />
  <StatusBadge status="Cancelled" showIcon={false} />

Accepts the canonical order statuses defined in src/lib/test-generators/types.ts
as well as the legacy aliases used elsewhere in the app ("Complete",
"Ready", "unread", "open", "finished").
*/

import { Typography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Ready for Pickup"
  | "Ready"
  | "Completed"
  | "Complete"
  | "Cancelled";

export type OrderStatusInput = OrderStatus | "unread" | "open" | "finished" | string;

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

type BadgeStyle = {
  label: string;
  background: string;
  border: string;
  text: string;
  icon: IoniconName;
};

const STATUS_STYLES: Record<OrderStatus, BadgeStyle> = {
  Pending: {
    label: "Pending",
    background: "#FFE4CE",
    border: "#F0A66E",
    text: "#B96527",
    icon: "time-outline",
  },
  Preparing: {
    label: "Preparing",
    background: "#FFF4C2",
    border: "#E5C047",
    text: "#8A6A14",
    icon: "restaurant-outline",
  },
  "Ready for Pickup": {
    label: "Ready",
    background: "#A5D6A7",
    border: "#2E7D32",
    text: "#1B5E20",
    icon: "checkmark-circle-outline",
  },
  Ready: {
    label: "Ready",
    background: "#A5D6A7",
    border: "#2E7D32",
    text: "#1B5E20",
    icon: "checkmark-circle-outline",
  },
  Completed: {
    label: "Completed",
    background: "#C9F7D1",
    border: "#5DE07B",
    text: "#3BA34E",
    icon: "checkmark-done-outline",
  },
  Complete: {
    label: "Complete",
    background: "#C9F7D1",
    border: "#5DE07B",
    text: "#3BA34E",
    icon: "checkmark-done-outline",
  },
  Cancelled: {
    label: "Cancelled",
    background: "#FFD7D7",
    border: "#FF7B7B",
    text: "#D73535",
    icon: "close-circle-outline",
  },
};

const TAB_ALIASES: Record<string, OrderStatus> = {
  unread: "Pending",
  open: "Preparing",
  finished: "Completed",
};

const FALLBACK_STYLE: BadgeStyle = {
  label: "Unknown",
  background: "#EEEEEE",
  border: "#BDBDBD",
  text: "#424242",
  icon: "help-circle-outline",
};

export function resolveStatusStyle(status: OrderStatusInput): BadgeStyle {
  if (status in STATUS_STYLES) {
    return STATUS_STYLES[status as OrderStatus];
  }
  const aliased = TAB_ALIASES[status as string];
  if (aliased) return STATUS_STYLES[aliased];
  return FALLBACK_STYLE;
}

export type StatusBadgeProps = {
  status: OrderStatusInput;
  size?: "sm" | "md";
  showIcon?: boolean;
  label?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
  label,
  style,
  textStyle,
}: StatusBadgeProps) {
  const cfg = resolveStatusStyle(status);
  const isSmall = size === "sm";

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Order status: ${cfg.label}`}
      style={[
        styles.badge,
        isSmall ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: cfg.background, borderColor: cfg.border },
        style,
      ]}
    >
      {showIcon && (
        <Ionicons
          name={cfg.icon}
          size={isSmall ? 12 : 14}
          color={cfg.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          isSmall ? styles.textSm : styles.textMd,
          { color: cfg.text },
          textStyle,
        ]}
      >
        {label ?? cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 16,
    borderWidth: 1.3,
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    columnGap: 4,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    columnGap: 3,
  },
  icon: {
    marginRight: 2,
  },
  text: {
    ...Typography.body,
    fontWeight: "800",
  },
  textMd: {
    fontSize: 13,
    lineHeight: 16,
  },
  textSm: {
    fontSize: 11,
    lineHeight: 14,
  },
});

export default StatusBadge;
