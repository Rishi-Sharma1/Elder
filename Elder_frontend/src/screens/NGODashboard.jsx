import { kineticColors, kineticTypography } from '../theme/kineticTokens';
import { useContext, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import useResponsive from "../hooks/useResponsive";
import NGOSidebar, { NGOMobileBottomBar } from "../components/NGOSidebar";



export default function NGODashboard({ navigation }) {
  const { user } = useContext(AuthContext);

  const [volunteerCount, setVolunteerCount] = useState(0);
  const [openRequests, setOpenRequests] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const responsive = useResponsive();

  useFocusEffect(
    useCallback(() => {
      const fetchDashboard = async () => {
        try {
          const statsRes = await api.get(
            "/ngo/stats"
          );

          setVolunteerCount(statsRes.data.volunteers);
          setOpenRequests(statsRes.data.openRequests);
          setCompletedCount(statsRes.data.completedTasks);

          const completedRes = await api.get(
            "/ngo/completed"
          );

          setVolunteerCount(statsRes.data.volunteers);
          setCompletedCount(statsRes.data.completedTasks);
          setRecent(completedRes.data);
        } catch (err) {
          console.log("NGO DASHBOARD ERROR:", err.response?.data || err);
        } finally {
          setLoading(false);
        }
      };

      fetchDashboard();
    }, [])
  );

  if (loading)
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.layout, { flexDirection: responsive.showSidebar ? "row" : "column" }]}>
        <NGOSidebar navigation={navigation} activeKey="NGODashboard" />

        <ScrollView style={styles.content}>
          <Text style={styles.heading}>Dashboard</Text>
          <Text style={styles.subheading}>
            Overview of activities and performance
          </Text>

          <Text style={styles.sectionTitle}>Key Metrics</Text>

          <View style={[
            styles.metricsRow, 
            { 
              flexDirection: "row", 
              flexWrap: "wrap", 
              justifyContent: "center",
              gap: 15,
              marginBottom: 30 
            }
          ]}>
            <MetricCard
              title="Active Volunteers"
              value={volunteerCount}
              width={responsive.isMobile ? "100%" : "48%"}
            />

            <MetricCard
              title="Open Requests"
              value={openRequests}
              width={responsive.isMobile ? "100%" : "48%"}
            />

            <MetricCard
              title="Completed Tasks"
              value={completedCount}
              width={responsive.isMobile ? "100%" : "100%"}
            />
          </View>


          <Text style={styles.sectionTitle}>Recent Activities</Text>

          <Table
            headers={["Elder", "Type", "Volunteer", "Status"]}
            rows={
              recent.length > 0
                ? recent.map((r) => [
                  r.elder?.name || "N/A",
                  r.type || "N/A",
                  r.volunteer?.name || "N/A",
                  "Completed",
                ])
                : [["No completed tasks yet", "", "", ""]]
            }
          />
        </ScrollView>
      </View>
      <NGOMobileBottomBar navigation={navigation} activeKey="NGODashboard" />
    </SafeAreaView>
  );
}

const SidebarItem = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.sidebarItem, active && { backgroundColor: kineticColors.background }]}
  >
    <Text style={styles.sidebarText}>{label}</Text>
  </TouchableOpacity>
);

const MetricCard = ({ title, value, width }) => (
  <View style={[styles.metricCard, { width: width || "100%" }]}>
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const Table = ({ headers, rows }) => (
  <View style={styles.table}>
    <View style={styles.tableHeader}>
      {headers.map((h, i) => (
        <Text key={i} style={styles.tableHeaderText}>
          {h}
        </Text>
      ))}
    </View>

    {rows.map((row, i) => (
      <View key={i} style={styles.tableRow}>
        {row.map((cell, j) => (
          <View key={j} style={styles.cell}>
            <Text style={styles.cellText}>{cell}</Text>
          </View>
        ))}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: kineticColors.background },
  layout: {
    flex: 1,
  },
  sidebar: {
    width: 250,
    backgroundColor: kineticColors.background,
    padding: 20,
  },
  sidebarHeader: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: kineticColors.border,
    paddingBottom: 20,
  },
  logo: { fontSize: 20, fontWeight: "bold", color: kineticColors.foreground },
  hub: { color: kineticColors.mutedForeground },

  profileSection: {
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: kineticColors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: kineticColors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 20, color: kineticColors.foreground, fontWeight: "bold" },
  profileInfo: { flex: 1 },
  profileName: { color: kineticColors.foreground, fontWeight: "bold", fontSize: 15, marginBottom: 2 },
  profileRole: { color: kineticColors.mutedForeground, fontSize: 12 },

  sidebarItem: { padding: 12, borderRadius: 10, marginBottom: 8 },
  sidebarText: { color: kineticColors.foreground },
  content: { flex: 1, padding: 24 },
  heading: { fontSize: 28, fontWeight: "bold", color: kineticColors.foreground },
  subheading: { color: kineticColors.mutedForeground, marginBottom: 25 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: kineticColors.foreground,
    marginBottom: 15,
    marginTop: 20,
  },
  metricsRow: {
    gap: 15,
    marginBottom: 30,
  },
  metricCard: {
    flex: 1,
    backgroundColor: kineticColors.background,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: kineticColors.border,
  },
  metricTitle: { color: kineticColors.mutedForeground, marginBottom: 10 },
  metricValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: kineticColors.foreground,
  },
  table: {
    borderWidth: 1,
    borderColor: kineticColors.border,
    borderRadius: 10,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: kineticColors.background,
    padding: 12,
  },
  tableHeaderText: {
    flex: 1,
    color: kineticColors.mutedForeground,
    fontWeight: "600",
  },
  tableRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderColor: kineticColors.border,
  },
  cell: { flex: 1 },
  cellText: { color: kineticColors.foreground },
});
