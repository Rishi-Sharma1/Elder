import { kineticColors, kineticTypography } from '../theme/kineticTokens';
import { useContext, useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import useResponsive from "../hooks/useResponsive";
import VolunteerSidebar, { VolunteerMobileBottomBar } from "../components/VolunteerSidebar";
import ElderSidebar, { ElderMobileBottomBar } from "../components/ElderSidebar";



export default function MyNGOsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const responsive = useResponsive();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = user.role === "elder" ? "/elder/my-ngos" : "/volunteer/my-ngos";
      const res = await api.get(endpoint);
      setNgos(res.data);
    } catch (err) {
      console.error("MY NGOS FETCH ERROR:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [user.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={kineticColors.accent} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.layout, { flexDirection: responsive.showSidebar ? "row" : "column" }]}>
        {user.role === "volunteer" ? (
          <VolunteerSidebar navigation={navigation} activeKey="MyNGOsScreen" />
        ) : (
          <ElderSidebar navigation={navigation} activeKey="MyNGOsScreen" />
        )}

        <ScrollView contentContainerStyle={[styles.content, { padding: responsive.contentPadding }]}>
          <Text style={styles.heading}>My NGOs</Text>
          <Text style={styles.subheading}>Organization(s) you have joined</Text>

          <View style={styles.list}>
            {ngos.length > 0 ? (
              ngos.map((ngo) => (
                <TouchableOpacity 
                  key={ngo._id} 
                  style={styles.card}
                  onPress={() => navigation.navigate("NGODetailScreen", { ngoId: ngo._id, ngoName: ngo.name })}
                >
                  <View style={styles.avatar}>
                    {ngo.profilePhoto ? (
                      <Image source={{ uri: ngo.profilePhoto }} style={styles.image} />
                    ) : (
                      <Text style={styles.avatarText}>{ngo.name?.charAt(0)?.toUpperCase()}</Text>
                    )}
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{ngo.name}</Text>
                    <Text style={styles.address}>📍 {ngo.address || "Address not provided"}</Text>
                    {ngo.phone && <Text style={styles.phone}>📞 {ngo.phone}</Text>}
                  </View>
                  <Text style={styles.viewMore}>View Members →</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🤝</Text>
                <Text style={styles.emptyText}>You haven't joined any NGOs yet.</Text>
                <TouchableOpacity 
                  style={styles.browseBtn}
                  onPress={() => navigation.navigate("NGOsScreen")}
                >
                  <Text style={styles.browseBtnText}>Browse NGOs</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {user.role === "volunteer" ? (
        <VolunteerMobileBottomBar navigation={navigation} activeKey="MyNGOsScreen" />
      ) : (
        <ElderMobileBottomBar navigation={navigation} activeKey="MyNGOsScreen" />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: kineticColors.background },
  layout: { flex: 1 },
  content: { paddingBottom: 100 },
  heading: { fontSize: 28, fontWeight: "800", color: kineticColors.foreground, marginBottom: 5 },
  subheading: { fontSize: 15, color: kineticColors.mutedForeground, marginBottom: 25 },
  list: { gap: 16 },
  card: {
    flexDirection: "row", backgroundColor: kineticColors.background, padding: 16,
    borderRadius: 12, borderWidth: 1, borderColor: kineticColors.border, alignItems: "center"
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: "#334155", 
    justifyContent: "center", alignItems: "center", marginRight: 15, overflow: "hidden"
  },
  image: { width: "100%", height: "100%" },
  avatarText: { fontSize: 24, color: kineticColors.foreground, fontWeight: "bold" },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 18, fontWeight: "bold", color: kineticColors.foreground },
  address: { fontSize: 13, color: kineticColors.mutedForeground },
  phone: { fontSize: 13, color: kineticColors.foreground },
  viewMore: { color: kineticColors.accent, fontSize: 12, fontWeight: "600" },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyIcon: { fontSize: 64 },
  emptyText: { color: kineticColors.mutedForeground, fontSize: 16, textAlign: 'center' },
  browseBtn: { backgroundColor: kineticColors.accent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, marginTop: 10 },
  browseBtnText: { color: "#FFF", fontWeight: "bold" }
});
