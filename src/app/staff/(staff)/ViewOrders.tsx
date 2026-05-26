import { Image } from "expo-image";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import ConfirmationMode from "@/components/confirmation_mode";
import BaseDrawer from "@/components/StaffNavDrawer";
import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { FilterBar } from "../../../components/FilterBar";
import { OrderCard } from "../../../components/OrderCard";
import { TabNav } from "../../../components/TabNav";

type Tab = "unread" | "open" | "finished";
type SortField = "customer" | "date" | "orderNumber";
type SortDirection = "asc" | "desc";
type PickupStatus = "awaiting_pickup" | "picked_up" | "cancelled" | undefined;

type Order = {
  id: string;
  orderNumber: number;
  customerName: string;
  createdAt: string;
  items: { name: string; quantity?: number }[];
  status: Tab;
  rawStatus: string;
  pickupCode?: string;
};

function mapStatus(status: string): Tab {
  if (status === "completed" || status === "cancelled" || status === "ready") return "finished";
  if (status === "preparing") return "open";
  return "unread";
}

function getPickupStatusFromRaw(raw: string): PickupStatus {
  if (raw === "ready") return "awaiting_pickup";
  if (raw === "completed") return "picked_up";
  if (raw === "cancelled") return "cancelled";
  return undefined;
}

function getDetailStatusLabel(rawStatus: string): string {
  if (rawStatus === "cancelled") return "CANCELLED";
  if (rawStatus === "completed") return "PICKED UP";
  if (rawStatus === "ready") return "AWAITING PICKUP";
  return rawStatus.toUpperCase();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `created: ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export default function ViewOrders() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 600;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("unread");
  const [sortField, setSortField] = useState<SortField>("orderNumber");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[ViewOrders] Fetch error:", error.message);
      return;
    }

    const mapped: Order[] = (data ?? []).map((row, index) => ({
      id: row.order_id != null ? String(row.order_id) : `row-${index}`,
      orderNumber: index + 1,
      customerName: row.user_name ?? "Customer",
      createdAt: formatDate(row.created_at),
      items: Array.isArray(row.items) ? row.items : [],
      status: mapStatus(row.status ?? ""),
      rawStatus: row.status ?? "",
      pickupCode: row.pickup_code ?? undefined,
    }));

    setOrders(mapped);
    setLoading(false);
    setSelectedOrder((cur) =>
      cur ? (mapped.find((o) => o.id === cur.id) ?? null) : null
    );
  }

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("view-orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function updateOrderStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("order_id", orderId);
    if (error) console.error("[ViewOrders] Update error:", error.message);
  }

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = orders
      .filter((order) => order.status === activeTab)
      .slice();

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "customer":
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case "date":
          comparison = a.createdAt.localeCompare(b.createdAt);
          break;
        case "orderNumber":
          comparison = a.orderNumber - b.orderNumber;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [orders, activeTab, sortField, sortDirection]);

  if (loading) {
    return (
      <BaseDrawer>
        <View
          style={[
            styles.screen,
            { alignItems: "center", justifyContent: "center" },
          ]}
        >
          <ActivityIndicator size="large" color={Colors.primaryGreen} />
        </View>
      </BaseDrawer>
    );
  }

  if (selectedOrder) {
    return (
      <FullScreenOrderDetails
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        onCloseOrder={async (closeType) => {
          const newStatus = closeType === "completed" ? "ready" : "cancelled";
          setSelectedOrder((cur) =>
            cur ? { ...cur, rawStatus: newStatus, status: mapStatus(newStatus) } : null
          );
          await updateOrderStatus(selectedOrder.id, newStatus);
        }}
        onPickupConfirm={async () => {
          setSelectedOrder((cur) =>
            cur ? { ...cur, rawStatus: "completed", status: mapStatus("completed") } : null
          );
          await updateOrderStatus(selectedOrder.id, "completed");
        }}
        onOpenOrder={async () => {
          await updateOrderStatus(selectedOrder.id, "preparing");
          setSelectedOrder(null);
        }}
      />
    );
  }

  return (
    <BaseDrawer>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.headerInner}>
              <Image
                source={require("../../../../documentation/branding/images/Light-Mode-Logo.png")}
                style={styles.logo}
              />
              <View style={styles.filterContainer}>
                <FilterBar
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSortChange={handleSortChange}
                />
              </View>
            </View>
          </View>

          <View style={styles.tabSection}>
            <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
          </View>

          <View style={styles.ordersSection}>
            <View style={[styles.ordersList, isSmallScreen && styles.ordersListSingle]}>
              {filteredAndSortedOrders.map((order) => (
                <Pressable
                  key={order.id}
                  style={({ pressed }) => [
                    styles.orderCardWrapper,
                    isSmallScreen && styles.orderCardWrapperFull,
                    pressed && styles.orderCardPressed,
                  ]}
                  onPress={() => setSelectedOrder(order)}
                >
                  <OrderCard
                    orderNumber={order.orderNumber}
                    customerName={order.customerName}
                    createdAt={order.createdAt}
                    items={order.items}
                    status={order.status}
                    pickupStatus={getPickupStatusFromRaw(order.rawStatus)}
                  />
                </Pressable>
              ))}
            </View>

            {filteredAndSortedOrders.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No {activeTab} orders at the moment
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </BaseDrawer>
  );
}

function FullScreenOrderDetails({
  order,
  onBack,
  onCloseOrder,
  onPickupConfirm,
  onOpenOrder,
}: {
  order: Order;
  onBack: () => void;
  onCloseOrder: (closeType: "completed" | "cancelled") => void;
  onPickupConfirm: () => void;
  onOpenOrder: () => void;
}) {
  const [closeModalVisible, setCloseModalVisible] = useState(false);

  const statusSymbol =
    order.status === "unread" ? "!" : order.status === "open" ? "..." : "✓";
  const isCancelled = order.rawStatus === "cancelled";
  const isPickedUp = order.rawStatus === "completed";
  const isFinished = order.status === "finished";

  const handleConfirmClose = (closeType: "completed" | "cancelled") => {
    setCloseModalVisible(false);
    onCloseOrder(closeType);
    onBack();
  };

  return (
    <View style={styles.detailScreen}>
      <View style={styles.detailHeader}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </Pressable>

        <Image
          source={require("../../../../documentation/branding/images/Light-Mode-Logo.png")}
          style={styles.logo}
        />

        <View style={styles.backButtonSpacer} />
      </View>

      <ScrollView
        style={styles.detailScroll}
        contentContainerStyle={styles.detailScrollContent}
      >
        <View style={styles.fullOrderCard}>
          <View style={styles.fullOrderTop}>
            <View style={styles.fullOrderHeaderContent}>
              <View
                style={[
                  styles.statusBadge,
                  order.status === "unread" && styles.unreadStatusBadge,
                  order.status === "open" && styles.openStatusBadge,
                  order.status === "finished" && styles.finishedStatusBadge,
                ]}
              >
                <Text style={styles.statusBadgeText}>{statusSymbol}</Text>
              </View>

              <View style={styles.fullOrderInfo}>
                <Text style={styles.fullOrderTitle}>
                  Order #{order.orderNumber}
                </Text>
                <Text style={styles.fullCustomerName}>{order.customerName}</Text>
                <Text style={styles.fullCreatedDate}>{order.createdAt}</Text>
              </View>
            </View>

            <View style={styles.statusPill}>
              <Text
                style={[
                  styles.statusPillText,
                  isCancelled && { color: "#dc2626" },
                ]}
              >
                {getDetailStatusLabel(order.rawStatus)}
              </Text>
            </View>
          </View>

          <View style={styles.fullOrderItems}>
            {order.items.map((item, idx) => (
              <View key={`${item.name}-${idx}`} style={styles.fullOrderItem}>
                <Text style={styles.fullItemText}>
                  {item.quantity != null ? `${item.quantity} ` : ""}{item.name}
                </Text>
              </View>
            ))}
          </View>

          {isFinished && !isCancelled && (
            <View style={styles.pickupSection}>
              <Text style={styles.pickupCodeLabel}>Pickup Code</Text>
              <Text style={styles.pickupCodeValue}>{order.pickupCode ?? "—"}</Text>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmPickupButton,
                  isPickedUp && styles.confirmPickupButtonDone,
                  pressed && !isPickedUp && { opacity: 0.75 },
                ]}
                disabled={isPickedUp}
                onPress={onPickupConfirm}
              >
                <Text
                  style={[
                    styles.confirmPickupButtonText,
                    isPickedUp && { color: "#16a34a" },
                  ]}
                >
                  {isPickedUp ? "Picked Up ✓" : "Confirm Pickup"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.detailActions}>
        <Pressable
          style={({ pressed }) => [
            styles.detailActionButton,
            order.status === "open" && styles.disabledButton,
            pressed && order.status !== "open" && { opacity: 0.7 },
          ]}
          disabled={order.status === "open"}
          onPress={onOpenOrder}
        >
          <Text
            style={[
              styles.detailActionButtonText,
              order.status === "open" && styles.disabledButtonText,
            ]}
          >
            Open order
          </Text>
        </Pressable>

        <View style={styles.actionDivider} />

        <Pressable
          style={({ pressed }) => [
            styles.detailActionButton,
            isFinished && styles.disabledButton,
            pressed && !isFinished && { opacity: 0.7 },
          ]}
          disabled={isFinished}
          onPress={() => setCloseModalVisible(true)}
        >
          <Text
            style={[
              styles.detailActionButtonTextClose,
              isFinished && styles.disabledButtonText,
            ]}
          >
            Close order
          </Text>
        </Pressable>
      </View>

      <ConfirmationMode
        visible={closeModalVisible}
        orderNumber={order.orderNumber}
        onConfirm={handleConfirmClose}
        onGoBack={() => setCloseModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: "#d9d9d9",
    borderColor: "#a8a8a8",
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 3,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingBottom: 0,
    paddingTop: 35,
    gap: 0,
  },
  logo: {
    width: 64,
    height: 64,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 3,
  },
  filterContainer: {
    flex: 1,
  },
  tabSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  ordersSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  ordersList: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderCardWrapper: {
    width: "48%",
    marginBottom: 24,
  },
  orderCardWrapperFull: {
    width: "100%",
  },
  ordersListSingle: {
    flexDirection: "column",
  },
  orderCardPressed: {
    opacity: 0.8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 24,
    color: Colors.light.text,
    textAlign: "center",
  },
  detailScreen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  detailHeader: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#d9d9d9",
    borderBottomWidth: 1,
    borderBottomColor: "#a8a8a8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    minWidth: 80,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  backButtonSpacer: {
    width: 80,
  },
  detailScroll: {
    flex: 1,
  },
  detailScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  fullOrderCard: {
    backgroundColor: Colors.softGray,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  fullOrderTop: {
    backgroundColor: Colors.pastelPeach,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  fullOrderHeaderContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  statusBadgeText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  fullOrderInfo: {
    flex: 1,
  },
  fullOrderTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },
  fullCustomerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 6,
  },
  fullCreatedDate: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 4,
  },
  statusPill: {
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
    textTransform: "uppercase",
  },
  fullOrderItems: {
    padding: 20,
  },
  fullOrderItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  fullItemText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  pickupSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
    alignItems: "center",
    gap: 10,
  },
  pickupCodeLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#15803d",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pickupCodeValue: {
    fontSize: 48,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: 8,
  },
  confirmPickupButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: "#16a34a",
    alignItems: "center",
    alignSelf: "stretch",
  },
  confirmPickupButtonDone: {
    backgroundColor: "#d1fae5",
  },
  confirmPickupButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
  detailActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#d4d4d4",
    backgroundColor: "#ffffff",
  },
  detailActionButton: {
    flex: 1,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  detailActionButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#039700",
  },
  detailActionButtonTextClose: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ff0000",
  },
  actionDivider: {
    width: 1,
    backgroundColor: "#d4d4d4",
  },
  disabledButton: {
    backgroundColor: "#f3f4f6",
  },
  disabledButtonText: {
    color: "#9ca3af",
  },
  unreadStatusBadge: {
    backgroundColor: "#969696",
  },
  openStatusBadge: {
    backgroundColor: "#8cda8c",
  },
  finishedStatusBadge: {
    backgroundColor: "#b1b1b1",
  },
});
