import { kineticColors, kineticTypography } from '../theme/kineticTokens';
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api";



export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get(
          "/elder/requests"
        );

        setRequests(res.data);
      } catch (error) {
        console.log("FETCH REQUEST ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const renderItem = ({ item }) => {
    const statusStyle =
      item.status === "approved"
        ? styles.approved
        : item.status === "rejected"
          ? styles.rejected
          : styles.pending;

    return (
      <View style={styles.card}>
        <Text style={styles.type}>
          {item.type?.toUpperCase()}
        </Text>

        <Text style={styles.description}>
          {item.description}
        </Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={[styles.statusBadge, statusStyle]}>
            <Text style={styles.statusText}>
              {item.status?.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  if (requests.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyTitle}>
          No requests submitted yet
        </Text>
        <Text style={styles.emptySub}>
          Your help requests will appear here.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 25 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: kineticColors.background,
  },

  card: {
    backgroundColor: kineticColors.background,
    padding: 20,
    borderRadius: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: kineticColors.border,
  },

  type: {
    fontSize: 18,
    fontWeight: "bold",
    color: kineticColors.foreground,
    marginBottom: 8,
  },

  description: {
    fontSize: 15,
    color: kineticColors.mutedForeground,
    marginBottom: 15,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusLabel: {
    color: kineticColors.mutedForeground,
    fontSize: 14,
  },

  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },

  approved: {
    backgroundColor: kineticColors.foreground,
  },

  rejected: {
    backgroundColor: kineticColors.error,
  },

  pending: {
    backgroundColor: kineticColors.mutedForeground,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: kineticColors.background,
  },

  emptyTitle: {
    fontSize: 20,
    color: kineticColors.foreground,
    marginBottom: 8,
  },

  emptySub: {
    color: kineticColors.mutedForeground,
  },
});
