import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Tab = "unread" | "open" | "finished";

interface TabNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: "unread", label: "Unread" },
  { id: "open", label: "Open" },
  { id: "finished", label: "Finished" },
];

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.8}
            onPress={() => onTabChange(tab.id)}
            style={styles.tabButton}
          >
            <Text style={[styles.tabText, isActive ? styles.activeText : styles.inactiveText]}>
              {tab.label}
            </Text>

            {isActive && <View style={styles.activeUnderline} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: 32,
  },
  tabButton: {
    position: "relative",
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 20,
    color: "#000000",
  },
  activeText: {
    fontWeight: "700",
  },
  inactiveText: {
    fontWeight: "400",
  },
  activeUnderline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: "#000000",
    borderRadius: 999,
  },
});