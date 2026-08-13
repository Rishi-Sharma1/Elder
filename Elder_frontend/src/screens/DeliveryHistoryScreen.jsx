import { kineticColors, kineticTypography } from '../theme/kineticTokens';
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api";
import ElderSidebar, { ElderMobileBottomBar } from "../components/ElderSidebar";
import useResponsive from "../hooks/useResponsive";



const statusColors = {
  pending: kineticColors.mutedForeground,
  accepted: kineticColors.accent,
  picked_up: kineticColors.accent,
  out_for_delivery: kineticColors.mutedForeground,
  delivered: kineticColors.foreground,
  cancelled: kineticColors.error,
};

const statusLabels = {
  pending: "Pending",
  accepted: "Accepted",
  picked_up: "Picked Up",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function DeliveryHistoryScreen({ navigation }) {
  const responsive = useResponsive();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, medicine, grocery

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/delivery/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("FETCH DELIVERY HISTORY ERROR:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleDeleteOrder = (orderId) => {
    const title = "Delete Order";
    const message = "Are you sure you want to remove this order from your history? This action cannot be undone.";

    if (Platform.OS === 'web') {
      const confirm = window.confirm(`${title}\n\n${message}`);
      if (confirm) {
        performDelete(orderId);
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => performDelete(orderId) }
        ]
      );
    }
  };

  const performDelete = async (orderId) => {
    try {
      await api.delete(`/delivery/order/${orderId}`);
      setOrders(prev => prev.filter(o => o._id !== orderId));
    } catch (err) {
      console.error("DELETE ORDER ERROR:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete order";
      if (Platform.OS === 'web') {
        window.alert(errorMsg);
      } else {
        Alert.alert("Error", errorMsg);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.category === filter);

  const activeOrders = filtered.filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  );
  const pastOrders = filtered.filter((o) =>
    ["delivered", "cancelled"].includes(o.status)
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={kineticColors.accent} />
          <Text style={styles.loadingText}>Loading deliveries...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[styles.layout, { flexDirection: responsive.showSidebar ? "row" : "column" }]}
      >
        <ElderSidebar navigation={navigation} activeKey="DeliveryHistoryScreen" />

        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.contentInner, { padding: responsive.contentPadding }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={kineticColors.accent}
            />
          }
        >
          {/* Header */}
          <Text style={styles.heading}>My Deliveries</Text>
          <Text style={styles.subheading}>Track and manage your delivery orders</Text>

          {/* Filter Tabs */}
          <View style={styles.filterRow}>
            {[
              { key: "all", label: "All", icon: "📋" },
              { key: "medicine", label: "Medicine", icon: "💊" },
              { key: "grocery", label: "Grocery", icon: "🛒" },
            ].map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={styles.filterIcon}>{f.icon}</Text>
                <Text
                  style={[styles.filterText, filter === f.key && styles.filterTextActive]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats */}
          <View style={[styles.statsRow, { flexDirection: responsive.isMobile ? "column" : "row" }]}>
            <StatCard title="Total Orders" value={filtered.length} color={kineticColors.accent} />
            <StatCard title="Active" value={activeOrders.length} color={kineticColors.mutedForeground} />
            <StatCard title="Delivered" value={pastOrders.filter((o) => o.status === "delivered").length} color={kineticColors.foreground} />
          </View>

          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <>
              <SectionHeader title="Active Deliveries" icon="🚚" count={activeOrders.length} />
              {activeOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onPress={() =>
                    navigation.navigate("DeliveryTrackingScreen", { orderId: order._id })
                  }
                  isActive
                />
              ))}
            </>
          )}

          {/* Past Orders */}
          {pastOrders.length > 0 && (
            <>
              <SectionHeader title="Past Orders" icon="📦" count={pastOrders.length} />
              {pastOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onPress={() =>
                    navigation.navigate("DeliveryTrackingScreen", { orderId: order._id })
                  }
                  onDelete={() => handleDeleteOrder(order._id)}
                />
              ))}
            </>
          )}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No delivery orders yet</Text>
              <TouchableOpacity
                style={styles.orderBtn}
                onPress={() => navigation.navigate("DeliveryOrderScreen")}
              >
                <Text style={styles.orderBtnText}>Place Your First Order</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: responsive.showBottomBar ? 80 : 40 }} />
        </ScrollView>

        <ElderMobileBottomBar navigation={navigation} activeKey="DeliveryHistoryScreen" />
      </View>
    </SafeAreaView>
  );
}

/* ── Sub Components ── */

const SectionHeader = ({ title, icon, count }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionIcon}>{icon}</Text>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.countBadge}>
      <Text style={styles.countText}>{count}</Text>
    </View>
  </View>
);

const StatCard = ({ title, value, color }) => (
  <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const OrderCard = ({ order, onPress, onDelete, isActive }) => {
  const statusColor = statusColors[order.status] || kineticColors.mutedForeground;
  const itemCount = order.items?.length || 0;
  const urgentCount = order.items?.filter((i) => i.urgent).length || 0;

  return (
    <View style={[styles.orderCard, isActive && styles.orderCardActive]}>
      {/* Main Touchable part of the card */}
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.7}
        style={styles.orderCardClickable}
      >
        <View style={styles.orderCardHeader}>
          <View style={styles.orderCategoryBadge}>
            <Text style={styles.orderCategoryIcon}>
              {order.category === "medicine" ? "💊" : "🛒"}
            </Text>
            <Text style={styles.orderCategoryText}>
              {order.category?.charAt(0).toUpperCase() + order.category?.slice(1)}
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusColor + "20" }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabels[order.status] || order.status}
            </Text>
          </View>
        </View>

        <Text style={styles.orderAddress} numberOfLines={1}>
          📍 {order.deliveryAddress}
        </Text>

        <View style={styles.orderMeta}>
          <Text style={styles.orderMetaText}>
            {itemCount} item{itemCount !== 1 ? "s" : ""}
            {urgentCount > 0 ? ` · ${urgentCount} urgent` : ""}
          </Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {order.volunteer && (
          <View style={styles.orderVolunteer}>
            <Text style={styles.orderVolunteerText}>
              🙋 {order.volunteer.name || "Volunteer assigned"}
            </Text>
          </View>
        )}

        {isActive && (
          <View style={styles.trackBtn}>
            <Text style={styles.trackBtnText}>Track Delivery →</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Independent Delete Button */}
      {onDelete && (
        <TouchableOpacity 
          style={styles.absDeleteBtn}
          onPress={onDelete}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Text style={styles.smallDeleteBtnText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: kineticColors.background },
  layout: { flex: 1 },
  content: { flex: 1 },
  contentInner: {},
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  loadingText: { color: kineticColors.mutedForeground, fontSize: 16 },

  heading: { fontSize: 28, fontWeight: "800", color: kineticColors.foreground, letterSpacing: -0.5 },
  subheading: { color: kineticColors.mutedForeground, marginBottom: 24, marginTop: 6, fontSize: 15 },

  // Filters
  filterRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: kineticColors.background,
    borderWidth: 1,
    borderColor: kineticColors.border,
  },
  filterTabActive: {
    backgroundColor: kineticColors.accent + "20",
    borderColor: kineticColors.accent,
  },
  filterIcon: { fontSize: 14 },
  filterText: { fontSize: 13, fontWeight: "600", color: kineticColors.mutedForeground },
  filterTextActive: { color: kineticColors.accent },

  // Stats
  statsRow: { gap: 14, marginBottom: 28 },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: kineticColors.background,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: kineticColors.border,
  },
  statTitle: { color: kineticColors.mutedForeground, fontSize: 12, fontWeight: "500", marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: "800", color: kineticColors.foreground },

  // Section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    marginTop: 8,
  },
  sectionIcon: { fontSize: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: kineticColors.foreground, flex: 1 },
  countBadge: {
    backgroundColor: kineticColors.accent + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: { color: kineticColors.accent, fontSize: 13, fontWeight: "700" },

  // Order card
  orderCard: {
    backgroundColor: kineticColors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: kineticColors.border,
    marginBottom: 12,
    position: "relative", // Ensure relative for absolute child
  },
  orderCardActive: { borderColor: kineticColors.accent + "50" },
  orderCardClickable: {
    padding: 18,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingRight: 30, // Make room for absolute X button
  },
  orderCategoryBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  orderCategoryIcon: { fontSize: 16 },
  orderCategoryText: { fontSize: 14, fontWeight: "600", color: kineticColors.foreground },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: "600" },
  absDeleteBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: kineticColors.error + "20",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10, // Ensure it's on top
  },
  smallDeleteBtnText: {
    color: kineticColors.error,
    fontSize: 12,
    fontWeight: "800",
  },
  orderAddress: { fontSize: 13, color: kineticColors.mutedForeground, marginBottom: 10 },
  orderMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderMetaText: { fontSize: 12, color: kineticColors.mutedForeground },
  orderDate: { fontSize: 12, color: kineticColors.mutedForeground },
  orderVolunteer: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: kineticColors.border + "50" },
  orderVolunteerText: { fontSize: 13, color: kineticColors.accent, fontWeight: "500" },
  trackBtn: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: kineticColors.accent + "15",
    borderRadius: 8,
    alignItems: "center",
  },
  trackBtnText: { color: kineticColors.accent, fontWeight: "600", fontSize: 13 },

  // Empty
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: kineticColors.mutedForeground, fontSize: 16 },
  orderBtn: {
    backgroundColor: kineticColors.accent,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  orderBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
