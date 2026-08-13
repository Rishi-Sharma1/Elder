import { kineticColors, kineticTypography } from '../theme/kineticTokens';
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api";



export default function AvailableRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get(
          "/volunteer/requests"
        );

        setRequests(res.data);
      } catch (err) {
        console.error("FETCH REQUESTS ERROR:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const acceptRequest = async (id) => {
    try {
      setProcessingId(id);

      await api.post(
        `/volunteer/accept/${id}`,
        {}
      );

      Alert.alert("Success", "Request accepted!");
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("ACCEPT ERROR:", err.response?.data || err);
      Alert.alert("Error", "Failed to accept request");
    } finally {
      setProcessingId(null);
    }
  };

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
          No available requests right now.
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
            {/* Type */}
            <Text style={styles.type}>
              {item.type?.toUpperCase()}
            </Text>

            {/* Description */}
            <Text style={styles.description}>
              {item.description}
            </Text>

            {/* Elder Info */}
            <Text style={styles.info}>
              👤 {item.elder?.name || item.elder?.email || "N/A"}
            </Text>

            <Text style={styles.info}>
              📞 {item.elder?.phone || "N/A"}
            </Text>

            {/* Accept Button */}
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => acceptRequest(item._id)}
              disabled={processingId === item._id}
            >
              {processingId === item._id ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.acceptText}>
                  Accept Request
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    padding: 30,
    borderWidth: 2,
    borderColor: kineticColors.border,
    marginBottom: 24,
  },

  type: {
    ...kineticTypography.subheading,
    marginBottom: 16,
    color: kineticColors.foreground,
  },

  description: {
    ...kineticTypography.body,
    marginBottom: 20,
    color: kineticColors.foreground,
  },

  info: {
    ...kineticTypography.body,
    marginBottom: 10,
    color: kineticColors.mutedForeground,
  },

  acceptButton: {
    backgroundColor: kineticColors.accent,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: kineticColors.foreground,
    alignItems: "center",
    marginTop: 20,
  },

  acceptText: {
    color: kineticColors.accentForeground,
    ...kineticTypography.label,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: kineticColors.background,
  },

  emptyText: {
    ...kineticTypography.subheading,
    color: kineticColors.mutedForeground,
  },
});
