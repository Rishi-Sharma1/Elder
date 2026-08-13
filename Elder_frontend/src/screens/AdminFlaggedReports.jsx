import { kineticColors, kineticTypography } from '../theme/kineticTokens';
import { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform,
  ActivityIndicator, RefreshControl, Modal, Image, Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminSidebar, { MobileBottomBar } from "../components/AdminSidebar";
import useResponsive from "../hooks/useResponsive";
import api from "../api";



export default function AdminFlaggedReports({ navigation }) {
  const responsive = useResponsive();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      const res = await api.get("/admin/verifications");
      setReports(res.data);
    } catch (err) {
      console.error("FLAGGED REPORTS ERROR:", err.response?.data || err);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );
  const onRefresh = () => { setRefreshing(true); fetchReports(); };

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/admin/verify-user/${id}`, { status });
      fetchReports();
    } catch (err) {
      console.error("VERIFY ERROR:", err.response?.data || err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={kineticColors.accent} />
          <Text style={s.loadingText}>Loading Reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={[s.layout, { flexDirection: responsive.showSidebar ? "row" : "column" }]}>
        <AdminSidebar navigation={navigation} activeKey="AdminFlaggedReports" />
        <ScrollView style={s.content} contentContainerStyle={[s.cc, { padding: responsive.contentPadding }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={kineticColors.accent} />}>

          <Text style={s.heading}>Pending Verifications</Text>
          <Text style={s.sub}>Review pending identity verifications from platform users</Text>

          {/* Stats */}
          <View style={[s.statsRow, { flexDirection: responsive.isMobile ? "column" : "row" }]}>
            <View style={[s.statCard, { borderTopColor: kineticColors.mutedForeground, borderTopWidth: 3 }]}>
              <Text style={s.statLabel}>Pending Reviews</Text>
              <Text style={s.statBig}>{reports.length}</Text>
            </View>
            <View style={[s.statCard, { borderTopColor: kineticColors.error, borderTopWidth: 3 }]}>
              <Text style={s.statLabel}>Needs Attention</Text>
              <Text style={s.statBig}>{reports.length > 0 ? "Yes" : "No"}</Text>
            </View>
          </View>

          {/* Reports List */}
          <View style={s.sectionH}>
            <Text style={s.sectionI}>📄</Text>
            <Text style={s.sectionT}>Pending Verifications ({reports.length})</Text>
          </View>

          {reports.length > 0 ? (
            reports.map((report, i) => (
              <View key={report._id} style={s.reportCard}>
                {/* Header */}
                <View style={s.reportHeader}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{report.name?.charAt(0)?.toUpperCase() || "?"}</Text>
                  </View>
                  <View style={s.reportInfo}>
                    <Text style={s.reportName}>{report.name}</Text>
                    <Text style={s.reportEmail}>{report.email}</Text>
                  </View>
                  <View style={[s.roleBadge, { backgroundColor: getRoleColor(report.role) + "20" }]}>
                    <Text style={[s.roleBadgeText, { color: getRoleColor(report.role) }]}>
                      {report.role?.charAt(0).toUpperCase() + report.role?.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Verification Details */}
                <View style={s.detailsGrid}>
                  <View style={s.detailItem}>
                    <Text style={s.detailLabel}>ID Type</Text>
                    <Text style={s.detailValue}>{report.verification?.idType || "Not specified"}</Text>
                  </View>
                  <View style={s.detailItem}>
                    <Text style={s.detailLabel}>Status</Text>
                    <View style={s.statusBadge}>
                      <View style={[s.statusDot, { backgroundColor: kineticColors.mutedForeground }]} />
                      <Text style={[s.detailValue, { color: kineticColors.mutedForeground }]}>Pending</Text>
                    </View>
                  </View>
                  <View style={s.detailItem}>
                    <Text style={s.detailLabel}>Submitted</Text>
                    <Text style={s.detailValue}>
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })
                        : "Unknown"}
                    </Text>
                  </View>
                </View>

                {/* ID Document Links */}
                {(report.verification?.idFrontUrl || report.verification?.idBackUrl || report.verification?.selfieUrl) && (
                  <View style={s.documentsRow}>
                    <Text style={s.documentsLabel}>📎 Documents Submitted:</Text>
                    <View style={s.docBadges}>
                      {report.verification?.idFrontUrl && <View style={s.docBadge}><Text style={s.docBadgeText}>ID Front</Text></View>}
                      {report.verification?.idBackUrl && <View style={s.docBadge}><Text style={s.docBadgeText}>ID Back</Text></View>}
                      {report.verification?.selfieUrl && <View style={s.docBadge}><Text style={s.docBadgeText}>Selfie</Text></View>}
                    </View>
                  </View>
                )}

                {/* Actions */}
                <View style={s.actionsRow}>
                  <TouchableOpacity 
                    style={[s.actionBtn, s.viewBtn]} 
                    onPress={() => setSelectedDocs({ ...report.verification, name: report.name })}
                  >
                    <Text style={s.actionBtnText}>View Docs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.actionBtn, s.verifyBtn]} onPress={() => handleVerify(report._id, "verified")}>
                    <Text style={s.actionBtnText}>✓ Verify User</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.actionBtn, s.rejectBtn]} onPress={() => handleVerify(report._id, "rejected")}>
                    <Text style={[s.actionBtnText, { color: kineticColors.error }]}>✗ Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={s.emptyCard}>
              <Text style={s.emptyIcon}>🎉</Text>
              <Text style={s.emptyTitle}>All Clear!</Text>
              <Text style={s.emptyText}>No pending verification reports to review</Text>
            </View>
          )}

          <View style={{ height: responsive.showBottomBar ? 80 : 40 }} />
        </ScrollView>

        <MobileBottomBar navigation={navigation} activeKey="AdminFlaggedReports" />
      </View>

      {/* Document Viewer Modal */}
      <Modal
        visible={!!selectedDocs}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedDocs(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{selectedDocs?.name}'s Documents</Text>
              <TouchableOpacity onPress={() => setSelectedDocs(null)} style={s.modalCloseBtn}>
                <Text style={s.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={s.modalScroll}>
              {selectedDocs?.idFrontUrl ? (
                <View style={s.docImageContainer}>
                  <Text style={s.docLabel}>ID Front</Text>
                  <Image source={{ uri: selectedDocs.idFrontUrl }} style={s.docImage} resizeMode="contain" />
                </View>
              ) : null}
              {selectedDocs?.idBackUrl ? (
                <View style={s.docImageContainer}>
                  <Text style={s.docLabel}>ID Back</Text>
                  <Image source={{ uri: selectedDocs.idBackUrl }} style={s.docImage} resizeMode="contain" />
                </View>
              ) : null}
              {selectedDocs?.selfieUrl ? (
                <View style={s.docImageContainer}>
                  <Text style={s.docLabel}>Selfie</Text>
                  <Image source={{ uri: selectedDocs.selfieUrl }} style={s.docImage} resizeMode="contain" />
                </View>
              ) : null}
              
              {!selectedDocs?.idFrontUrl && !selectedDocs?.idBackUrl && !selectedDocs?.selfieUrl && (
                <Text style={s.noDocsText}>No documents uploaded by this user.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getRoleColor(role) {
  switch (role) { case "elder": return "#F59E0B"; case "volunteer": return "#22C55E"; case "ngo": return "#4799EB"; case "admin": return "#EF4444"; default: return "#94A3B8"; }
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: kineticColors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  loadingText: { color: kineticColors.mutedForeground, fontSize: 16 },
  layout: { flex: 1 },
  content: { flex: 1 }, cc: {},
  heading: { fontSize: 28, fontWeight: "800", color: kineticColors.foreground, letterSpacing: -0.5 },
  sub: { color: kineticColors.mutedForeground, marginBottom: 24, marginTop: 6, fontSize: 15 },

  statsRow: { gap: 16, marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: kineticColors.background, padding: 20, borderRadius: 14, borderWidth: 1, borderColor: kineticColors.border },
  statLabel: { color: kineticColors.mutedForeground, fontSize: 13, fontWeight: "500", marginBottom: 8 },
  statBig: { fontSize: 32, fontWeight: "800", color: kineticColors.foreground },

  sectionH: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  sectionI: { fontSize: 22 },
  sectionT: { fontSize: 20, fontWeight: "700", color: kineticColors.foreground },

  reportCard: {
    backgroundColor: kineticColors.background, borderRadius: 14, borderWidth: 1, borderColor: kineticColors.border,
    padding: 24, marginBottom: 16,
  },
  reportHeader: {
    flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20,
    paddingBottom: 16, borderBottomWidth: 1, borderColor: `${kineticColors.border}60`,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: `${kineticColors.accent}25`,
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: kineticColors.accent, fontSize: 20, fontWeight: "700" },
  reportInfo: { flex: 1, gap: 2 },
  reportName: { color: kineticColors.foreground, fontWeight: "700", fontSize: 17 },
  reportEmail: { color: kineticColors.mutedForeground, fontSize: 13 },

  roleBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  roleBadgeText: { fontSize: 12, fontWeight: "700" },

  detailsGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 16,
  },
  detailItem: { flex: 1, gap: 4 },
  detailLabel: { color: kineticColors.mutedForeground, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  detailValue: { color: kineticColors.foreground, fontSize: 14, fontWeight: "500" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  documentsRow: { marginBottom: 20, gap: 8 },
  documentsLabel: { color: kineticColors.mutedForeground, fontSize: 13 },
  docBadges: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  docBadge: { backgroundColor: `${kineticColors.accent}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: `${kineticColors.accent}30` },
  docBadgeText: { color: kineticColors.accent, fontSize: 12, fontWeight: "600" },

  actionsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 10 },
  actionBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  viewBtn: { backgroundColor: kineticColors.mutedForeground },
  verifyBtn: { backgroundColor: kineticColors.foreground },
  rejectBtn: { backgroundColor: `${kineticColors.error}15`, borderWidth: 1, borderColor: `${kineticColors.error}40` },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  emptyCard: {
    backgroundColor: kineticColors.background, borderRadius: 14, borderWidth: 1, borderColor: kineticColors.border,
    padding: 48, alignItems: "center", gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: kineticColors.foreground, fontSize: 20, fontWeight: "700" },
  emptyText: { color: kineticColors.mutedForeground, fontSize: 15 },
  
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: kineticColors.background, borderRadius: 16, width: "100%", maxWidth: 600, maxHeight: "85%", overflow: "hidden" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: kineticColors.border, backgroundColor: kineticColors.background },
  modalTitle: { color: kineticColors.foreground, fontSize: 18, fontWeight: "700" },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: kineticColors.border, justifyContent: "center", alignItems: "center" },
  modalCloseText: { color: kineticColors.foreground, fontSize: 16, fontWeight: "bold" },
  modalScroll: { padding: 20 },
  docImageContainer: { marginBottom: 24 },
  docLabel: { color: kineticColors.mutedForeground, fontSize: 14, fontWeight: "600", marginBottom: 12 },
  docImage: { width: "100%", height: 250, backgroundColor: kineticColors.background, borderRadius: 12, borderWidth: 1, borderColor: kineticColors.border },
  noDocsText: { color: kineticColors.mutedForeground, textAlign: "center", marginVertical: 40 },
});
