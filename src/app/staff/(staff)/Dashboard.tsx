import BaseDrawer from "@/components/StaffNavDrawer";
import { Colors, Typography } from "@/constants/theme";
import { Stack } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  LayoutChangeEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

type Period = "Day" | "Week" | "Month" | "Year";

type OrderRow = {
  status: string;
  amount: number;
};

const orderRows: OrderRow[] = [
  { status: "Unread", amount: 28 },
  { status: "Opened", amount: 11 },
  { status: "In process", amount: 4 },
  { status: "Cancelled", amount: 1 },
  { status: "Completed", amount: 25 },
];

const periods: Period[] = ["Day", "Week", "Month", "Year"];

const revenueByPeriod: Record<Period, { label: string; value: string }> = {
  Day: { label: "Day Sales", value: "$1,560" },
  Week: { label: "Week Sales", value: "$10,920" },
  Month: { label: "Month Sales", value: "$43,680" },
  Year: { label: "Year Sales", value: "$524,160" },
};

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("Day");
  const [tabsWidth, setTabsWidth] = useState(0);

  const underlineTranslateX = useRef(new Animated.Value(0)).current;
  const tabWidth = tabsWidth > 0 ? tabsWidth / periods.length : 0;
  const underlineWidth = tabWidth * 0.55;

  const isDayView = selectedPeriod === "Day";

  const revenueCard = useMemo(
    () => revenueByPeriod[selectedPeriod],
    [selectedPeriod]
  );

  useEffect(() => {
    if (!tabWidth) return;

    const index = periods.indexOf(selectedPeriod);
    const targetX = index * tabWidth + (tabWidth - underlineWidth) / 2;

    Animated.timing(underlineTranslateX, {
      toValue: targetX,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [selectedPeriod, tabWidth, underlineWidth, underlineTranslateX]);

  const handleTabsLayout = (event: LayoutChangeEvent) => {
    setTabsWidth(event.nativeEvent.layout.width);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <BaseDrawer>
        <SafeAreaView
          style={[styles.safeArea, { backgroundColor: theme.background }]}
        >
          <View style={[styles.header, { backgroundColor: Colors.pastelSage }]}>
            <Image
              source={require("../../../../documentation/branding/images/Light-Mode-Logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: theme.alternateText }]}>
                Dashboard
              </Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.tabsWrapper}>
              <View style={styles.tabsRow} onLayout={handleTabsLayout}>
                {periods.map((period) => {
                  const isActive = selectedPeriod === period;

                  return (
                    <Pressable
                      key={period}
                      onPress={() => setSelectedPeriod(period)}
                      style={styles.tabButton}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          {
                            color: theme.icon,
                            fontFamily: Typography.body.fontFamily,
                          },
                          isActive && {
                            color: theme.text,
                            fontWeight: "600",
                          },
                        ]}
                      >
                        {period}
                      </Text>
                    </Pressable>
                  );
                })}

                {tabWidth > 0 && (
                  <Animated.View
                    style={[
                      styles.activeUnderline,
                      {
                        width: underlineWidth,
                        backgroundColor: theme.text,
                        transform: [{ translateX: underlineTranslateX }],
                      },
                    ]}
                  />
                )}
              </View>

              <View
                style={[
                  styles.tabsBottomLine,
                  { backgroundColor: Colors.mutedGray },
                ]}
              />
            </View>

            <SectionTitle title="Revenue Overview" textColor={theme.text} />
            <InfoCard label={revenueCard.label} value={revenueCard.value} />

            {isDayView && (
              <>
                <SectionTitle title="Customer Traffic" textColor={theme.text} />
                <WarningCard message="Customer traffic is high." />

                <SectionTitle
                  title="Daily Orders Overview"
                  textColor={theme.text}
                />
                <OrdersTable rows={orderRows} total={43} />

                <InfoCard label="Total Orders Placed Today" value="350" />

                <WarningCard
                  title="Warning"
                  message="⚠ There are too many unread orders."
                />
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </BaseDrawer>
    </>
  );
}

function SectionTitle({
  title,
  textColor,
}: {
  title: string;
  textColor: string;
}) {
  return <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>;
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View
      style={[
        styles.infoCard,
        {
          backgroundColor: Colors.pastelSage,
          borderColor: Colors.mutedGray,
        },
      ]}
    >
      <View
        style={[
          styles.infoCardHeader,
          {
            backgroundColor: Colors.primaryGreen,
          },
        ]}
      >
        <Text
          style={[
            styles.infoCardHeaderText,
            { color: Colors.light.secondaryText },
          ]}
        >
          {label}
        </Text>
      </View>

      <View style={styles.infoCardBody}>
        <Text
          style={[
            styles.infoCardValue,
            { color: Colors.light.alternateText },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function WarningCard({
  title,
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <View
      style={[
        styles.warningCard,
        {
          backgroundColor: Colors.pastelPeach,
          borderColor: "#ff6f9d",
        },
      ]}
    >
      {title ? (
        <View style={styles.warningHeader}>
          <Text
            style={[
              styles.warningTitle,
              { color: Colors.light.alternateText },
            ]}
          >
            {title}
          </Text>
        </View>
      ) : null}

      <View style={styles.warningBody}>
        <Text
          style={[
            styles.warningMessage,
            { color: Colors.light.alternateText },
          ]}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}

function OrdersTable({
  rows,
  total,
}: {
  rows: OrderRow[];
  total: number;
}) {
  return (
    <View
      style={[
        styles.tableCard,
        {
          backgroundColor: Colors.primaryGreen,
          borderColor: Colors.mutedGray,
        },
      ]}
    >
      <View style={[styles.tableRow, styles.tableHeaderRow]}>
        <View style={styles.tableCell}>
          <Text
            style={[
              styles.tableText,
              styles.tableHeaderText,
              { color: Colors.light.secondaryText },
            ]}
          >
            Status
          </Text>
        </View>

        <View style={styles.tableCell}>
          <Text
            style={[
              styles.tableText,
              styles.tableHeaderText,
              { color: Colors.light.secondaryText },
            ]}
          >
            Amount
          </Text>
        </View>
      </View>

      {rows.map((row) => (
        <View key={row.status} style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text style={[styles.tableText, { color: Colors.light.secondaryText }]}>
              {row.status}
            </Text>
          </View>

          <View style={styles.tableCell}>
            <Text style={[styles.tableText, { color: Colors.light.secondaryText }]}>
              {row.amount}
            </Text>
          </View>
        </View>
      ))}

      <View
        style={[
          styles.tableFooter,
          {
            backgroundColor: Colors.pastelSage,
          },
        ]}
      >
        <View style={styles.tableCell}>
          <Text
            style={[
              styles.tableFooterText,
              { color: Colors.light.alternateText },
            ]}
          >
            Total Active Orders
          </Text>
        </View>

        <View style={styles.tableCell}>
          <Text
            style={[
              styles.tableFooterText,
              { color: Colors.light.alternateText },
            ]}
          >
            {total}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: Colors.mutedGray,
  },

  logo: {
    width: 44,
    height: 44,
    zIndex: 1,
  },

  headerTitleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: Typography.heading.fontFamily,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 90,
  },

  tabsWrapper: {
    marginBottom: 18,
  },

  tabsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    position: "relative",
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 8,
  },

  tabText: {
    fontSize: 16,
  },

  activeUnderline: {
    position: "absolute",
    bottom: 0,
    height: 2,
    borderRadius: 999,
  },

  tabsBottomLine: {
    marginTop: 2,
    height: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    fontFamily: Typography.subheading.fontFamily,
  },

  infoCard: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 14,
  },

  infoCardHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  infoCardHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Typography.subheading.fontFamily,
  },

  infoCardBody: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },

  infoCardValue: {
    fontSize: 18,
    fontWeight: "500",
    fontFamily: Typography.body.fontFamily,
  },

  warningCard: {
    borderRadius: 10,
    borderWidth: 2,
    overflow: "hidden",
    marginBottom: 14,
  },

  warningHeader: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },

  warningTitle: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: Typography.subheading.fontFamily,
  },

  warningBody: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },

  warningMessage: {
    fontSize: 16,
    fontFamily: Typography.body.fontFamily,
  },

  tableCard: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 14,
  },

  tableHeaderRow: {
    paddingTop: 10,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },

  tableCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  tableText: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: Typography.body.fontFamily,
  },

  tableHeaderText: {
    fontWeight: "600",
    fontFamily: Typography.subheading.fontFamily,
  },

  tableFooter: {
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  tableFooterText: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: Typography.body.fontFamily,
  },
});