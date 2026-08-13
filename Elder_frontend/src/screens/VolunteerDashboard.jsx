import { useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { useFocusEffect } from "@react-navigation/native";
import useResponsive from "../hooks/useResponsive";
import VolunteerSidebar, { VolunteerMobileBottomBar } from "../components/VolunteerSidebar";
import { kineticColors, kineticTypography } from "../theme/kineticTokens";

export default function VolunteerDashboard({ navigation }) {
  const { user } = useContext(AuthContext);

  const [available, setAvailable] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nearestNGOs, setNearestNGOs] = useState([]);
  const responsive = useResponsive();

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      console.log("BASE URL:", api.defaults.baseURL);

      const fetchOne = async (url) => {
        try {
          const res = await api.get(url);
          return res.data;
        } catch (err) {
          const status = err.response?.status;
          const msg = err.response?.data?.message || err.message;
          console.warn(`FETCH ERROR [${url}]: Status ${status} - ${msg}`);
          return null;
        }
      };

      const [availableData, tasksData, deliveriesData, activeData, historyData, ngosData] = await Promise.all([
        fetchOne("/volunteer/requests"),
        fetchOne("/volunteer/tasks"),
        fetchOne("/delivery/available"),
        fetchOne("/delivery/active"),
        fetchOne("/delivery/history"),
        fetchOne("/volunteer/ngos")
      ]);

      if (availableData) setAvailable(availableData);
      if (deliveriesData) setDeliveries(deliveriesData);
      if (activeData) setActiveDelivery(activeData);
      if (ngosData) setNearestNGOs(ngosData);

      console.log("DASHBOARD DATA LOADED:", {
        available: availableData?.length,
        deliveries: deliveriesData?.length,
        active: !!activeData
      });

      const completedRegular = (tasksData || [])
        .filter((t) => t.status?.toLowerCase() === "completed")
        .map((t) => ({ ...t, displayType: t.type }));

      const completedDeliveries = (historyData || [])
        .map((d) => ({
          _id: d._id,
          displayType: d.category === "medicine" ? "Medicine Delivery" : "Grocery Delivery",
          description: `Delivered to ${d.elder?.name || "Elder"} at ${d.deliveryAddress}`,
          status: d.status,
          updatedAt: d.updatedAt,
        }));

      const completedTasks = [...completedRegular, ...completedDeliveries]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setCompleted(completedTasks);

    } catch (err) {
      console.log("DASHBOARD ERROR:", err.response?.data || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard(true);
  };

  const acceptDelivery = async (deliveryId) => {
    try {
      await api.post(
        `/delivery/accept/${deliveryId}`,
        {}
      );
      navigation.navigate("VolunteerActiveDelivery", { orderId: deliveryId });
    } catch (err) {
      console.error("ACCEPT DELIVERY ERROR:", err);
      const msg = "Failed to accept delivery";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Error", msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.layout, { flexDirection: responsive.showSidebar ? "row" : "column" }]}>
        {/* Sidebar */}
        <VolunteerSidebar 
          navigation={navigation} 
          activeKey="VolunteerDashboard" 
          activeDelivery={activeDelivery} 
        />

        {/* Main Content */}
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.heading}>Dashboard</Text>
          <Text style={styles.subheading}>
            Manage your activities and performance
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={kineticColors.accent} />
          ) : (
            <>
              {/* Stats */}
              <View style={[
                styles.statsRow, 
                { 
                  flexDirection: "row", 
                  flexWrap: "wrap", 
                  justifyContent: "center",
                  gap: 16,
                  marginBottom: 30 
                }
              ]}>
                <StatCard
                  title="Available Tasks"
                  value={available.length}
                  color={kineticColors.accent}
                  onPress={() => navigation.navigate("AvailableRequests")}
                  width={responsive.isMobile ? "100%" : "48%"}
                />
                <StatCard
                  title="Completed Tasks"
                  value={completed.length}
                  color={kineticColors.foreground}
                  onPress={() => navigation.navigate("MyTasks")}
                  width={responsive.isMobile ? "100%" : "48%"}
                />
                <StatCard
                  title="Pending Deliveries"
                  value={deliveries.length}
                  color="#F59E0B"
                  width={responsive.isMobile ? "100%" : "100%"}
                />
              </View>

              {/* Nearby NGOs Section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Nearby Partner NGOs 🏢</Text>
              </View>
              <View style={styles.ngoList}>
                {nearestNGOs.length > 0 ? (
                  nearestNGOs.map((ngo) => (
                    <TouchableOpacity 
                      key={ngo._id} 
                      style={styles.ngoCard}
                      onPress={() => navigation.navigate("NGOsScreen")}
                    >
                      <View style={styles.ngoAvatar}>
                        {ngo.profilePhoto ? (
                          <Image source={{ uri: ngo.profilePhoto }} style={styles.ngoImage} />
                        ) : (
                          <Text style={styles.ngoAvatarText}>{ngo.name?.charAt(0)?.toUpperCase()}</Text>
                        )}
                      </View>
                      <View style={styles.ngoInfo}>
                        <Text style={styles.ngoName}>{ngo.name}</Text>
                        <Text style={styles.ngoAddress}>📍 {ngo.address || "Address not provided"}</Text>
                      </View>
                      <View style={styles.joinBadge}>
                        <Text style={styles.joinBadgeText}>View</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No NGOs found in your city yet.</Text>
                  </View>
                )}
              </View>

              {/* Active Delivery Banner */}
              {activeDelivery && (
                <TouchableOpacity
                  style={styles.activeDeliveryBanner}
                  onPress={() =>
                    navigation.navigate("VolunteerActiveDelivery", {
                      orderId: activeDelivery._id,
                    })
                  }
                >
                  <View style={styles.activeBannerLeft}>
                    <Text style={styles.activeBannerIcon}>🚚</Text>
                    <View>
                      <Text style={styles.activeBannerTitle}>Active Delivery</Text>
                      <Text style={styles.activeBannerDesc}>
                        {activeDelivery.category === "medicine" ? "💊 Medicine" : "🛒 Grocery"} •{" "}
                        {activeDelivery.items?.length} items • {activeDelivery.status?.replace(/_/g, " ")}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.activeBannerArrow}>→</Text>
                </TouchableOpacity>
              )}

              {/* Available Deliveries */}
              {deliveries.length > 0 && (
                <>
                  <SectionTitle title="🚚 Available Deliveries" />
                  {deliveries.slice(0, 5).map((delivery) => (
                    <View key={delivery._id} style={styles.deliveryCard}>
                      <View style={styles.deliveryCardHeader}>
                        <Text style={styles.deliveryCategory}>
                          {delivery.category === "medicine" ? "💊 Medicine" : "🛒 Grocery"}
                        </Text>
                        <Text style={styles.deliveryItemCount}>
                          {delivery.items?.length} items
                          {delivery.items?.some((i) => i.urgent) && " · ⚡ Urgent"}
                        </Text>
                      </View>
                      <Text style={styles.deliveryAddress} numberOfLines={1}>
                        📍 {delivery.deliveryAddress}
                      </Text>
                      {delivery.elder && (
                        <Text style={styles.deliveryElder}>
                          👤 {delivery.elder.name}
                        </Text>
                      )}
                      <TouchableOpacity
                        style={styles.acceptDeliveryBtn}
                        onPress={() => acceptDelivery(delivery._id)}
                      >
                        <Text style={styles.acceptDeliveryText}>Accept Delivery →</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}

              {/* Quick Actions */}
              <SectionTitle title="Quick Actions" />

              {available.slice(0, 3).map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.quickCard}
                  onPress={() => navigation.navigate("AvailableRequests")}
                >
                  <Text style={styles.quickTitle}>
                    {item.type?.toUpperCase()}
                  </Text>
                  <Text style={styles.quickDesc}>{item.description}</Text>
                </TouchableOpacity>
              ))}

              {available.length === 0 && (
                <Text style={{ color: kineticColors.mutedForeground, ...kineticTypography.body }}>
                  No available requests.
                </Text>
              )}

              {/* Recent Activity */}
              <SectionTitle title="Recent Activity" />

              {completed.slice(0, 3).map((item) => (
                <View key={item._id} style={styles.activityCard}>
                  <Text style={styles.activityTitle}>
                    {item.displayType?.toUpperCase() || item.type?.toUpperCase()}
                  </Text>
                  <Text style={styles.activityDesc}>{item.description}</Text>
                  <Text style={styles.activityStatus}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              ))}

              {completed.length === 0 && (
                <Text style={{ color: kineticColors.mutedForeground, ...kineticTypography.body }}>
                  No completed tasks yet.
                </Text>
              )}
            </>
          )}
        </ScrollView>
      </View>
      <VolunteerMobileBottomBar 
        navigation={navigation} 
        activeKey="VolunteerDashboard" 
        activeDelivery={activeDelivery} 
      />
    </SafeAreaView>
  );
}

const SidebarItem = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.sidebarItem, active && { backgroundColor: kineticColors.border }]}
    onPress={onPress}
  >
    <Text style={styles.sidebarText}>{label}</Text>
  </TouchableOpacity>
);

const StatCard = ({ title, value, color, onPress, width }) => (
  <TouchableOpacity
    style={[styles.statCard, { borderColor: color, width: width || "100%" }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.statNumber}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </TouchableOpacity>
);

const SectionTitle = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: kineticColors.background },

  layout: {
    flexDirection: "row", // Overridden dynamically below but keeping base as row for styling purposes
    flex: 1,
  },

  sidebar: {
    width: 250,
    backgroundColor: kineticColors.background,
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: kineticColors.border,
  },

  profileSection: {
    marginBottom: 30,
    alignItems: "center",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: kineticColors.border,
    marginBottom: 10,
  },

  profileName: {
    color: kineticColors.foreground,
    ...kineticTypography.subheading,
    fontSize: 20,
  },

  profileRole: {
    color: kineticColors.mutedForeground,
    ...kineticTypography.label,
  },

  sidebarItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  sidebarText: {
    color: kineticColors.foreground,
    ...kineticTypography.label,
  },

  content: {
    flex: 1,
    padding: 24,
  },

  heading: {
    ...kineticTypography.heading,
    color: kineticColors.foreground,
  },

  subheading: {
    ...kineticTypography.body,
    color: kineticColors.mutedForeground,
    marginBottom: 30,
  },

  statsRow: {
    flexDirection: "row", // we will override inline
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 30,
  },

  statCard: {
    flex: 1,
    backgroundColor: kineticColors.background,
    padding: 30,
    borderWidth: 2,
    alignItems: "center",
  },

  statNumber: {
    ...kineticTypography.hero,
    fontSize: 48,
    color: kineticColors.foreground,
  },

  statTitle: {
    ...kineticTypography.label,
    marginTop: 8,
    color: kineticColors.mutedForeground,
  },

  sectionTitle: {
    ...kineticTypography.cardTitle,
    color: kineticColors.foreground,
    marginBottom: 15,
  },

  quickCard: {
    backgroundColor: kineticColors.background,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: kineticColors.border,
  },

  quickTitle: {
    color: kineticColors.accent,
    ...kineticTypography.subheading,
    fontSize: 20,
    marginBottom: 5,
  },

  quickDesc: {
    color: kineticColors.mutedForeground,
    ...kineticTypography.body,
  },

  activityCard: {
    backgroundColor: kineticColors.background,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: kineticColors.border,
  },

  activityTitle: {
    color: kineticColors.foreground,
    ...kineticTypography.subheading,
    fontSize: 18,
    marginBottom: 5,
  },

  activityDesc: {
    color: kineticColors.mutedForeground,
    ...kineticTypography.body,
  },

  activityStatus: {
    marginTop: 6,
    color: kineticColors.foreground,
    ...kineticTypography.label,
  },

  // Delivery styles
  activeDeliveryBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: kineticColors.accent,
    borderWidth: 2,
    borderColor: kineticColors.foreground,
    padding: 16,
    marginBottom: 20,
  },
  activeBannerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  activeBannerIcon: { fontSize: 28 },
  activeBannerTitle: { ...kineticTypography.subheading, fontSize: 20, color: kineticColors.accentForeground },
  activeBannerDesc: { ...kineticTypography.body, fontSize: 13, color: kineticColors.accentForeground, marginTop: 2 },
  activeBannerArrow: { fontSize: 24, color: kineticColors.accentForeground, fontWeight: "700" },

  deliveryCard: {
    backgroundColor: kineticColors.background,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: kineticColors.border,
  },
  deliveryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  deliveryCategory: { color: kineticColors.foreground, ...kineticTypography.label },
  deliveryItemCount: { color: kineticColors.mutedForeground, ...kineticTypography.label, fontSize: 12 },
  deliveryAddress: { color: kineticColors.mutedForeground, ...kineticTypography.body, fontSize: 14, marginBottom: 6 },
  deliveryElder: { color: kineticColors.foreground, ...kineticTypography.body, fontSize: 14, marginBottom: 10 },
  acceptDeliveryBtn: {
    backgroundColor: kineticColors.accent,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: kineticColors.foreground,
  },
  acceptDeliveryText: { color: kineticColors.accentForeground, ...kineticTypography.label },
  
  ngoList: { gap: 12, marginBottom: 20 },
  ngoCard: {
    flexDirection: "row",
    backgroundColor: kineticColors.background,
    borderWidth: 2,
    borderColor: kineticColors.border,
    padding: 16,
    alignItems: "center",
  },
  ngoAvatar: {
    width: 50,
    height: 50,
    borderRadius: 0,
    backgroundColor: kineticColors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  ngoImage: { width: "100%", height: "100%" },
  ngoAvatarText: { color: kineticColors.foreground, ...kineticTypography.subheading, fontSize: 24 },
  ngoInfo: { flex: 1, gap: 4 },
  ngoName: { color: kineticColors.foreground, ...kineticTypography.subheading, fontSize: 18 },
  ngoAddress: { color: kineticColors.mutedForeground, ...kineticTypography.body, fontSize: 14 },
  joinBadge: {
    backgroundColor: kineticColors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  joinBadgeText: { color: kineticColors.foreground, ...kineticTypography.label },
  emptyCard: {
    padding: 20,
    backgroundColor: kineticColors.background,
    alignItems: "center",
    borderWidth: 2,
    borderColor: kineticColors.border,
  },
  emptyText: { color: kineticColors.mutedForeground, ...kineticTypography.body },
});
