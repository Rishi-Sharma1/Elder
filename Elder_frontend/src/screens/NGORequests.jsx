import { kineticColors, kineticTypography } from '../theme/kineticTokens';
import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api";
import { useFocusEffect } from "@react-navigation/native";



export default function NGORequests({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get(
        "/ngo/requests"
      );

      setRequests(res.data);
    } catch (err) {
      console.error("FETCH NGO REQUESTS ERROR:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={kineticColors.accent} />
      </SafeAreaView>
    );
  }

  if (requests.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyText}>
          No requests available.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.type}>
              {item.type?.toUpperCase()}
            </Text>

            <Text style={styles.description}>
              {item.description}
            </Text>

            <Text style={styles.info}>
              👤 {item.elder?.name || item.elder?.email}
            </Text>

            <View style={styles.statusRow}>
              <StatusBadge status={item.status} />

              {item.status === "pending" && (
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() =>
                    navigation.navigate("AssignVolunteer", {
                      requestId: item._id,
                    })
                  }
                >
                  <Text style={styles.assignText}>
                    Assign Volunteer
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const StatusBadge = ({ status }) => {
  const lower = status?.toLowerCase();

  let backgroundColor = kineticColors.background;

  if (lower === "completed") backgroundColor = "#16A34A";
  else if (lower === "assigned") backgroundColor = "#F59E0B";
  else if (lower === "pending") backgroundColor = kineticColors.accent;

  return (
    <View style={[styles.statusBadge, { backgroundColor }]}>
      <Text style={styles.statusText}>
        {status?.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: kineticColors.background,
  },

  card: {
    backgroundColor: kineticColors.background,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: kineticColors.border,
    marginBottom: 16,
  },

  type: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: kineticColors.foreground,
  },

  description: {
    fontSize: 15,
    marginBottom: 10,
    color: kineticColors.mutedForeground,
  },

  info: {
    fontSize: 14,
    marginBottom: 10,
    color: kineticColors.mutedForeground,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },

  assignButton: {
    backgroundColor: kineticColors.accent,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  assignText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: kineticColors.background,
  },

  emptyText: {
    fontSize: 18,
    color: kineticColors.mutedForeground,
  },
});
