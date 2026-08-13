import { useContext, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import ElderSidebar, { ElderMobileBottomBar } from "../components/ElderSidebar";
import useResponsive from "../hooks/useResponsive";
import { md3Colors, md3Typography, md3Radii } from "../theme/md3Tokens";
import KineticCard from "../components/KineticCard";
import { kineticColors, kineticTypography } from "../theme/kineticTokens";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get('window');

export default function ElderDashboard({ navigation }) {
  const { user } = useContext(AuthContext);
  const responsive = useResponsive();

  const [requests, setRequests] = useState([]);
  const [nearestNGOs, setNearestNGOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const reqsRes = await api.get("/elder/requests");
      setRequests(reqsRes.data);

      try {
        const ngosRes = await api.get("/elder/nearest-ngos");
        setNearestNGOs(ngosRes.data);
      } catch (ngoErr) {
        console.warn("NEAREST NGOS ERROR:", ngoErr.message);
        setNearestNGOs([]);
      }
    } catch (err) {
      console.error("ELDER DASHBOARD ERROR (Requests):", err.message || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [fetchRequests])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={kineticColors.accent} />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pendingCount = requests.filter((r) => r.status?.toLowerCase() === "pending").length;
  const completedCount = requests.filter((r) => r.status?.toLowerCase() === "completed").length;
  const assignedCount = requests.filter((r) => r.status?.toLowerCase() === "assigned").length;

  const recent = [...requests]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Organic Shapes for MD3 Bold Factor */}
      <View style={styles.shape1} />
      <View style={styles.shape2} />
      <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />

      <View style={[styles.layout, { flexDirection: responsive.showSidebar ? "row" : "column" }]}>
        <ElderSidebar navigation={navigation} activeKey="ElderDashboard" />

        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.contentContainer, { padding: responsive.contentPadding }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={kineticColors.accent} />
          }
        >
          {/* Header */}
          <Text style={styles.heading}>
            Welcome back, {user?.name || "Elder"}
          </Text>
          <Text style={styles.subheading}>
            Manage your requests and health information
          </Text>

          {/* Stat Cards */}
          <View style={[styles.statsRow, { flexDirection: responsive.isMobile ? "column" : "row", flexWrap: responsive.isTablet ? "wrap" : "nowrap" }]}>
            <StatCard title="Total Requests" value={requests.length} color={kineticColors.accent} />
            <StatCard title="Pending" value={pendingCount} color={kineticColors.accent} />
            <StatCard title="Assigned" value={assignedCount} color={kineticColors.accent} />
            <StatCard title="Completed" value={completedCount} color={kineticColors.accentContainer} textColor={kineticColors.accentForegroundContainer} />
          </View>

          {/* Quick Actions */}
          <SectionHeader title="Quick Actions" icon="⚡" />
          <View style={[
            styles.actionsRow, 
            { 
              flexDirection: "row", 
              flexWrap: "wrap", 
              justifyContent: "center",
              gap: 12 
            }
          ]}>
            <ActionCard
              icon="💊"
              title="Medicine"
              desc="Request drop-off"
              onPress={() => navigation.navigate("CreateRequest", { type: "medicine" })}
              width={responsive.isMobile ? "100%" : "48%"}
            />
            <ActionCard
              icon="🚚"
              title="Delivery"
              desc="Medicine & grocery"
              onPress={() => navigation.navigate("DeliveryOrderScreen")}
              width={responsive.isMobile ? "100%" : "48%"}
            />
            <ActionCard
              icon="🤖"
              title="AI Companion"
              desc="Friendly chat"
              onPress={() => navigation.navigate("CompanionScreen")}
              width={responsive.isMobile ? "100%" : "48%"}
            />
            <ActionCard
              icon="📍"
              title="Track Deliveries"
              desc="Active orders"
              onPress={() => navigation.navigate("DeliveryHistoryScreen")}
              width={responsive.isMobile ? "100%" : "48%"}
            />
          </View>

          {/* Nearest Old Age Homes */}
          <SectionHeader title="Nearest Support & Old Age Homes" icon="🏥" />
          <View style={styles.ngoList}>
            {nearestNGOs.length > 0 ? (
              nearestNGOs.map((ngo) => (
                <KineticCard key={ngo._id} style={styles.ngoCard} onPress={() => {}}>
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
                    {ngo.phone && <Text style={styles.ngoPhone}>📞 {ngo.phone}</Text>}
                  </View>
                </KineticCard>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyIcon}>🏢</Text>
                <Text style={styles.emptyText}>No nearby homes found yet.</Text>
              </View>
            )}
          </View>

          {/* Bottom padding */}
          <View style={{ height: responsive.showBottomBar ? 100 : 40 }} />
        </ScrollView>
      </View>
      <ElderMobileBottomBar navigation={navigation} activeKey="ElderDashboard" />
    </SafeAreaView>
  );
}

/* ── Sub Components ── */

const SectionHeader = ({ title, icon }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionIcon}>{icon}</Text>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const StatCard = ({ title, value, color, textColor }) => (
  <View style={[styles.statCardWrapper, { flex: 1, minWidth: 140 }]}>
    <KineticCard variant="filled" style={[styles.statCard, { borderTopColor: color, borderTopWidth: 4 }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color: textColor || kineticColors.foreground }]}>{typeof value === "number" ? value.toLocaleString() : value}</Text>
    </KineticCard>
  </View>
);

const ActionCard = ({ icon, title, desc, onPress, width }) => (
  <View style={{ width, minWidth: 150 }}>
    <KineticCard style={styles.actionCard} onPress={onPress}>
      {({ isHovered }) => (
        <>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>{icon}</Text>
          </View>
          <Text style={[styles.actionTitle, isHovered && { color: kineticColors.accentForeground }]}>{title}</Text>
          <Text style={[styles.actionDesc, isHovered && { color: kineticColors.accentForeground }]}>{desc}</Text>
        </>
      )}
    </KineticCard>
  </View>
);

/* ── Styles ── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: kineticColors.background, position: 'relative' },
  shape1: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: kineticColors.accentContainer,
    opacity: 0.6,
  },
  shape2: {
    position: 'absolute',
    bottom: -height * 0.05,
    left: -width * 0.3,
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: kineticColors.accentContainer,
    opacity: 0.4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: { ...kineticTypography.body, color: kineticColors.mutedForeground },

  layout: { flex: 1 },

  content: { flex: 1 },
  contentContainer: {},
  heading: {
    ...kineticTypography.subheading,
    color: kineticColors.foreground,
    marginBottom: 4,
  },
  subheading: { ...kineticTypography.body, color: kineticColors.mutedForeground, marginBottom: 28 },

  statsRow: { gap: 16, marginBottom: 32 },
  statCardWrapper: {},
  statCard: {
    padding: 20,
    height: '100%',
  },
  statTitle: { ...kineticTypography.label, color: kineticColors.mutedForeground, marginBottom: 8 },
  statValue: { ...kineticTypography.cardTitle, color: kineticColors.foreground },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    marginTop: 12,
  },
  sectionIcon: { fontSize: 32 },
  sectionTitle: { ...kineticTypography.cardTitle, color: kineticColors.foreground },

  actionsRow: { gap: 16, marginBottom: 32 },
  actionCard: {
    alignItems: "center",
    padding: 20,
    gap: 8,
  },
  actionIconContainer: {
    backgroundColor: kineticColors.accentContainer,
    padding: 16,
    borderRadius: 999,
    marginBottom: 8,
  },
  actionIcon: { fontSize: 36 },
  actionTitle: { ...kineticTypography.cardTitle, color: kineticColors.foreground, textAlign: 'center' },
  actionDesc: { ...kineticTypography.body, color: kineticColors.mutedForeground, textAlign: "center" },

  ngoList: { gap: 16, marginBottom: 32 },
  ngoCard: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  ngoAvatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: kineticColors.accentContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  ngoImage: { width: "100%", height: "100%" },
  ngoAvatarText: { color: kineticColors.accent, ...kineticTypography.cardTitle },
  ngoInfo: { flex: 1, gap: 4 },
  ngoName: { ...kineticTypography.cardTitle, color: kineticColors.foreground },
  ngoAddress: { ...kineticTypography.body, color: kineticColors.mutedForeground },
  ngoPhone: { ...kineticTypography.label, color: kineticColors.accent, marginTop: 2 },

  emptyStateContainer: { alignItems: "center", paddingVertical: 20 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { ...kineticTypography.body, color: kineticColors.mutedForeground },
});
