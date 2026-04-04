import { Colors, Typography } from "@/constants/theme";
import { Link, usePathname, type Href } from "expo-router";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";

type DrawerItem = {
  label: string;
  href: Href;
};

type BaseDrawerProps = {
  children: React.ReactNode;
};

const DRAWER_ITEMS: readonly DrawerItem[] = [
  { label: "Dashboard", href: "/staff/Dashboard" },
  { label: "Orders", href: "/staff/ViewOrders" },
  { label: "Payments", href: "/staff/Payments" },
  { label: "Menu Management", href: "/staff/menu" },
  { label: "Special Status Request", href: "/staff/Special_Status_Request" },
  { label: "Settings", href: "/staff/Settings" },
];

const BaseDrawer = memo(function BaseDrawer({ children }: BaseDrawerProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const drawerWidth = screenWidth * 0.72;

  const drawerRight = useRef(new Animated.Value(-drawerWidth)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const items = useMemo(() => DRAWER_ITEMS, []);

  const openDrawer = useCallback(() => {
    setIsOpen(true);

    Animated.parallel([
      Animated.timing(drawerRight, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [drawerRight, backdropOpacity]);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(drawerRight, {
        toValue: -drawerWidth,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsOpen(false);
      }
    });
  }, [drawerRight, backdropOpacity, drawerWidth]);

  return (
    <View style={styles.root}>
      {children}

      <Pressable onPress={openDrawer} style={styles.menuButton}>
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>

      {isOpen && (
        <>
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <Animated.View
              style={StyleSheet.flatten([
                styles.backdrop,
                { opacity: backdropOpacity },
              ])}
            />
          </TouchableWithoutFeedback>

          <Animated.View
            style={StyleSheet.flatten([
              styles.drawer,
              {
                width: drawerWidth,
                right: drawerRight,
              },
            ])}
          >
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menu</Text>
            </View>

            <View style={styles.drawerContent}>
              {items.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <DrawerLinkItem
                    key={String(item.href)}
                    label={item.label}
                    href={item.href}
                    isActive={isActive}
                    onNavigate={closeDrawer}
                  />
                );
              })}
            </View>
          </Animated.View>
        </>
      )}
    </View>
  );
});

type DrawerLinkItemProps = {
  label: string;
  href: Href;
  isActive: boolean;
  onNavigate: () => void;
};

const DrawerLinkItem = memo(function DrawerLinkItem({
  label,
  href,
  isActive,
  onNavigate,
}: DrawerLinkItemProps) {
  return (
    <Link href={href} asChild>
      <Pressable
        onPress={onNavigate}
        style={StyleSheet.flatten([
          styles.drawerItem,
          isActive ? styles.drawerItemActive : null,
        ])}
      >
        <Text
          style={StyleSheet.flatten([
            styles.drawerItemText,
            isActive ? styles.drawerItemTextActive : null,
          ])}
        >
          {label}
        </Text>
      </Pressable>
    </Link>
  );
});

export default BaseDrawer;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  menuButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 58,
    height: 58,
    borderTopLeftRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.pastelSage,
    zIndex: 40,
  },

  menuIcon: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primaryGreen,
    fontFamily: Typography.button.fontFamily,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 20,
  },

  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: Colors.pastelSage,
    paddingTop: 72,
    paddingHorizontal: 16,
    zIndex: 30,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },

  drawerHeader: {
    marginBottom: 24,
  },

  drawerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.alternateText,
    fontFamily: Typography.heading.fontFamily,
  },

  drawerContent: {},

  drawerItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  drawerItemActive: {
    backgroundColor: "rgba(46, 125, 50, 0.14)",
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
  },

  drawerItemText: {
    fontSize: 16,
    color: Colors.light.alternateText,
    fontFamily: Typography.body.fontFamily,
  },

  drawerItemTextActive: {
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
});
