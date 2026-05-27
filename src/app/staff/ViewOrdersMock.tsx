import ConfirmationMode from "@/components/confirmation_mode";
import { mockOrders, type Order } from "@/dummyData/orderData";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { FilterBar } from "../../components/FilterBar";
import { OrderCard } from "../../components/OrderCard";
import { TabNav } from "../../components/TabNav";

type Tab = "unread" | "open" | "finished";
type SortField = "customer" | "date" | "orderNumber";
type SortDirection = "asc" | "desc";

function getPickupStatus(order: Order) {
  if (order.status !== "finished") return undefined;
  if (order.closeType === "cancelled") return "cancelled" as const;
  if (order.pickedUp) return "picked_up" as const;
  if (order.closeType === "completed") return "awaiting_pickup" as const;
  return undefined;
}

function getDetailStatusLabel(order: Order): string {
  if (order.status === "finished") {
    if (order.closeType === "cancelled") return "CANCELLED";
    if (order.pickedUp) return "PICKED UP";
    return "AWAITING PICKUP";
  }
  return order.status.toUpperCase();
}

export default function ViewOrdersMock() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 600;

  const [activeTab, setActiveTab] = useState<Tab>("unread");
  const [sortField, setSortField] = useState<SortField>("orderNumber");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

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

  const handleStatusChange = (
    orderId: number,
    newStatus: Order["status"],
    closeType?: "completed" | "cancelled",
    closeReason?: string
  ) => {
    const pickupCode =
      closeType === "completed"
        ? String(Math.floor(Math.random() * 9000) + 1000)
        : undefined;

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              closeType: closeType ?? order.closeType,
              closeReason: newStatus === "open" ? undefined : closeReason ?? order.closeReason,
              pickupCode: pickupCode ?? order.pickupCode,
              pickedUp: newStatus === "open" ? undefined : order.pickedUp,
            }
          : order
      )
    );

    setSelectedOrder((currentOrder) =>
      currentOrder && currentOrder.id === orderId
        ? {
            ...currentOrder,
            status: newStatus,
            closeType: closeType ?? currentOrder.closeType,
            closeReason: closeReason ?? currentOrder.closeReason,
            pickupCode: pickupCode ?? currentOrder.pickupCode,
          }
        : currentOrder
    );
  };

  const handlePickupConfirm = (orderId: number) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, pickedUp: true } : order
      )
    );
    setSelectedOrder((current) =>
      current && current.id === orderId ? { ...current, pickedUp: true } : current
    );
  };

  if (selectedOrder) {
    return (
      <FullScreenOrderDetails
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
        onPickupConfirm={handlePickupConfirm}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <Image
              source={require("../../../documentation/branding/images/Light-Mode-Logo.png")}
              style={styles.logo}
              contentFit="contain"
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
                  pickupStatus={getPickupStatus(order)}
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
  );
}

function FullScreenOrderDetails({
  order,
  onBack,
  onStatusChange,
  onPickupConfirm,
}: {
  order: Order;
  onBack: () => void;
  onStatusChange: (
    orderId: number,
    newStatus: Order["status"],
    closeType?: "completed" | "cancelled",
    closeReason?: string
  ) => void;
  onPickupConfirm: (orderId: number) => void;
}) {
  const statusSymbol =
    order.status === "unread" ? "!" : order.status === "open" ? "..." : "✓";
  const [closeModalVisible, setCloseModalVisible] = useState(false);

  const handleConfirmClose = (closeType: "completed" | "cancelled", reason?: string) => {
    setCloseModalVisible(false);
    onStatusChange(order.id, "finished", closeType, reason);
    onBack();
  };

  const isCancelled = order.closeType === "cancelled";
  const isFinished = order.status === "finished";

  return (
    <View style={styles.detailScreen}>
      <View style={styles.detailHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>

        <Image
          source={require("../../../documentation/branding/images/Light-Mode-Logo.png")}
          style={styles.logo}
          contentFit="contain"
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
                <Text style={styles.fullOrderTitle}>Order #{order.orderNumber}</Text>
                <Text style={styles.fullCustomerName}>{order.customerName}</Text>
                <Text style={styles.fullCreatedDate}>created: {order.createdAt}</Text>
              </View>
            </View>

            <View style={styles.statusPill}>
              <Text
                style={[
                  styles.statusPillText,
                  isCancelled && { color: "#dc2626" },
                ]}
              >
                {getDetailStatusLabel(order)}
              </Text>
            </View>
          </View>

          <View style={styles.fullOrderItems}>
            {order.items.map((item, idx) => (
              <View key={`${item.name}-${idx}`} style={styles.fullOrderItem}>
                <Text style={styles.fullItemText}>
                  {item.quantity} {item.name}
                </Text>
                {item.modifications && item.modifications.length > 0 && (
                  <View style={styles.modificationsContainer}>
                    {item.modifications.map((mod, modIdx) => (
                      <View key={`${mod}-${modIdx}`} style={styles.modificationItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.modificationText}>{mod}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          {isFinished && !isCancelled && (
            <View style={styles.pickupSection}>
              <Text style={styles.pickupCodeLabel}>Pickup Code</Text>
              <Text style={styles.pickupCodeValue}>{order.pickupCode ?? "—"}</Text>

              <TouchableOpacity
                style={[
                  styles.confirmPickupButton,
                  order.pickedUp && styles.confirmPickupButtonDone,
                ]}
                disabled={!!order.pickedUp}
                onPress={() => onPickupConfirm(order.id)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.confirmPickupButtonText,
                    order.pickedUp && { color: "#16a34a" },
                  ]}
                >
                  {order.pickedUp ? "Picked Up ✓" : "Confirm Pickup"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {order.closeReason && (
            <View style={styles.closeReasonBox}>
              <Text style={styles.closeReasonTitle}>Close Reason</Text>
              <Text style={styles.closeReasonText}>{order.closeReason}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.detailActions}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.detailActionButton,
            order.status === "open" && styles.disabledButton,
          ]}
          disabled={order.status === "open"}
          onPress={() => {
            onStatusChange(order.id, "open");
            setCloseModalVisible(false);
            onBack();
          }}
        >
          <Text
            style={[
              styles.detailActionButtonText,
              order.status === "open" && styles.disabledButtonText,
            ]}
          >
            Open order
          </Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.detailActionButton,
            isFinished && styles.disabledButton,
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
        </TouchableOpacity>
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
  screen: { flex: 1, backgroundColor: "#fafafa" },
  scrollContent: { paddingBottom: 32 },
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
    paddingTop: 35,
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
  filterContainer: { flex: 1 },
  tabSection: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16 },
  ordersSection: { paddingHorizontal: 24, paddingVertical: 32 },
  ordersList: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  ordersListSingle: { flexDirection: "column" },
  orderCardWrapper: { width: "48%", marginBottom: 24 },
  orderCardWrapperFull: { width: "100%" },
  orderCardPressed: { opacity: 0.8 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 48 },
  emptyStateText: { fontSize: 24, color: "#424242", textAlign: "center" },
  detailScreen: { flex: 1, backgroundColor: "#fafafa" },
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
  backButton: { minWidth: 80, paddingVertical: 8 },
  backButtonText: { fontSize: 18, fontWeight: "700", color: "#111827" },
  backButtonSpacer: { width: 80 },
  detailScroll: { flex: 1 },
  detailScrollContent: { padding: 20, paddingBottom: 40 },
  fullOrderCard: {
    backgroundColor: "#EEEEEE",
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
    backgroundColor: "#FFCCBC",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  fullOrderHeaderContent: { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  statusBadgeText: { color: "#ffffff", fontSize: 18, fontWeight: "800" },
  fullOrderInfo: { flex: 1 },
  fullOrderTitle: { fontSize: 26, fontWeight: "800", color: "#111827" },
  fullCustomerName: { fontSize: 18, fontWeight: "600", color: "#374151", marginTop: 6 },
  fullCreatedDate: { fontSize: 15, color: "#6b7280", marginTop: 4 },
  statusPill: {
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusPillText: { fontSize: 13, fontWeight: "800", color: "#374151", textTransform: "uppercase" },
  fullOrderItems: { padding: 20 },
  fullOrderItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  fullItemText: { fontSize: 20, fontWeight: "800", color: "#111827" },
  modificationsContainer: { marginTop: 10, gap: 8 },
  modificationItem: { flexDirection: "row", alignItems: "flex-start" },
  bullet: { fontSize: 18, color: "#6b7280", marginRight: 8, lineHeight: 24 },
  modificationText: { flex: 1, fontSize: 16, color: "#4b5563", lineHeight: 24 },
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
  pickupCodeValue: { fontSize: 48, fontWeight: "900", color: "#111827", letterSpacing: 8 },
  confirmPickupButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: "#16a34a",
    alignItems: "center",
    alignSelf: "stretch",
  },
  confirmPickupButtonDone: { backgroundColor: "#d1fae5" },
  confirmPickupButtonText: { fontSize: 16, fontWeight: "800", color: "#ffffff" },
  detailActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#d4d4d4",
    backgroundColor: "#ffffff",
  },
  detailActionButton: { flex: 1, paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  detailActionButtonText: { fontSize: 16, fontWeight: "800", color: "#039700" },
  detailActionButtonTextClose: { fontSize: 16, fontWeight: "800", color: "#ff0000" },
  actionDivider: { width: 1, backgroundColor: "#d4d4d4" },
  disabledButton: { backgroundColor: "#f3f4f6" },
  disabledButtonText: { color: "#9ca3af" },
  unreadStatusBadge: { backgroundColor: "#969696" },
  openStatusBadge: { backgroundColor: "#8cda8c" },
  finishedStatusBadge: { backgroundColor: "#b1b1b1" },
  closeReasonBox: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  closeReasonTitle: { fontSize: 14, fontWeight: "800", color: "#9A3412", marginBottom: 6 },
  closeReasonText: { fontSize: 15, color: "#7C2D12", lineHeight: 21 },
});
