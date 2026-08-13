import { kineticColors, kineticTypography } from '../theme/kineticTokens';
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import api from "../api";
import ElderSidebar, { ElderMobileBottomBar } from "../components/ElderSidebar";
import useResponsive from "../hooks/useResponsive";
import {
  connectSocket,
  joinDelivery,
  leaveDelivery,
  onLocationUpdate,
  onStatusUpdate,
  offLocationUpdate,
  offStatusUpdate,
} from "../api/socketService";

import { MapView, Marker } from "../components/MapModule";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");



const STATUS_STEPS = [
  { key: "accepted", label: "Accepted", icon: "✓" },
  { key: "picked_up", label: "Picked Up", icon: "✓" },
  { key: "out_for_delivery", label: "On the way", icon: "🛵" },
  { key: "delivered", label: "Delivered", icon: "🏁" },
];

export default function DeliveryTrackingScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  const responsive = useResponsive();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [volunteerLocation, setVolunteerLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null); // { distance, duration }
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
      ])
    );
    pulse.start();
    return () => {
      try {
        if (pulse && typeof pulse.stop === 'function') {
          pulse.stop();
        }
      } catch (e) {
        console.warn("Pulse animation stop error:", e);
      }
    };
  }, [pulseAnim]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/delivery/order/${orderId}`);
        setOrder(res.data);
        if (res.data.volunteerLocation?.coordinates) {
          const [lng, lat] = res.data.volunteerLocation.coordinates;
          if (lat && lng) setVolunteerLocation({ latitude: lat, longitude: lng });
        }
        
        // Geocode the destination address
        if (res.data.deliveryAddress) {
          try {
            const geocoded = await Location.geocodeAsync(res.data.deliveryAddress);
            if (geocoded && geocoded.length > 0) {
              setDestination({
                latitude: geocoded[0].latitude,
                longitude: geocoded[0].longitude,
              });
            } else {
              setDestination({ latitude: 23.2599, longitude: 77.4126 });
            }
          } catch (e) {
            console.warn("Geocoding failed:", e);
            setDestination({ latitude: 23.2599, longitude: 77.4126 });
          }
        }
      } catch (err) {
        console.error("FETCH ORDER ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    const socket = connectSocket();
    joinDelivery(orderId);

    onLocationUpdate((data) => {
      setVolunteerLocation({ latitude: data.latitude, longitude: data.longitude });
    });

    onStatusUpdate((data) => {
      setOrder((prev) =>
        prev ? { ...prev, status: data.status, estimatedArrival: data.estimatedArrival } : prev
      );
    });

    return () => {
      leaveDelivery(orderId);
      offLocationUpdate();
      offStatusUpdate();
    };
  }, [orderId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={kineticColors.accent} />
          <Text style={styles.loadingText}>Fetching your order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={{ fontSize: 48 }}>📭</Text>
          <Text style={styles.loadingText}>Delivery not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Treat 'pending' as 0th step (before accepted)
  const currentStepIndex =
    order.status === "pending"
      ? -1
      : STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isActive = !["delivered", "cancelled"].includes(order.status);

  // Time formatting - prioritize live routing data
  const getETA = () => {
    if (order.status === "delivered") return "Delivered";

    // Prioritize Live routing data from OSRM
    if (routeInfo?.duration) {
      const mins = Math.round(routeInfo.duration / 60);
      return `Arriving in ${mins} min`;
    }

    if (!order.estimatedArrival) return "Calculating ETA...";
    
    const etaMs = new Date(order.estimatedArrival).getTime();
    const nowMs = new Date().getTime();
    const diffMins = Math.max(1, Math.round((etaMs - nowMs) / 60000));
    
    return `Arriving in ${diffMins} min`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.layout, { flexDirection: responsive.showSidebar ? "row" : "column" }]}>
        <ElderSidebar navigation={navigation} activeKey="DeliveryOrderScreen" />

        <View style={styles.mainContent}>
          {/* Map Section - Takes upper half */}
          <View style={styles.mapSection}>
            {isActive || order.status === "delivered" ? (
              <MapView
                style={styles.map}
                volunteer={volunteerLocation}
                destination={destination}
                onRouteUpdate={setRouteInfo}
                initialRegion={{
                  ...(volunteerLocation || destination || { latitude: 23.2599, longitude: 77.4126 }),
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              />
            ) : (
              <View style={styles.mapPlaceholder}>
                <Text style={styles.mapPlaceholderText}>Map unavailable</Text>
              </View>
            )}

            {/* Live Indicator Overlay & ETA */}
            {isActive && (
              <View style={styles.liveBadgeOverlay}>
                <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
                <Text style={styles.liveTextLabel}>TRACKING LIVE</Text>
                {routeInfo && (
                  <>
                    <View style={styles.badgeDivider} />
                    <Text style={styles.etaBadgeText}>
                      {Math.round(routeInfo.duration / 60)} MINS ({(routeInfo.distance / 1000).toFixed(1)} KM)
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Bottom Sheet Style Overlay */}
          <ScrollView 
            style={styles.sheetContainer}
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ETA & Status Header */}
            <View style={styles.etaHeader}>
              <View style={styles.etaLeft}>
                <Text style={styles.etaText}>{getETA()}</Text>
                <Text style={styles.etaSubText}>
                  {order.status === "pending"
                    ? "Waiting for a volunteer to accept..."
                    : order.status === "delivered"
                    ? "Your order has been safely delivered."
                    : "Your delivery partner is on the way."}
                </Text>
              </View>
              {order.status !== "delivered" && order.status !== "cancelled" && (
                <View style={styles.animatedProgressContainer}>
                  <View style={styles.animatedProgressBar} />
                </View>
              )}
            </View>

            {/* Horizontal Zomato Stepper */}
            <View style={styles.stepperContainer}>
              {STATUS_STEPS.map((step, i) => {
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;

                return (
                  <View key={step.key} style={styles.stepWrapper}>
                    <View style={styles.stepNodeContainer}>
                      <View style={[
                        styles.stepCircle,
                        isCompleted && styles.stepCircleCompleted,
                        isCurrent && styles.stepCircleCurrent
                      ]}>
                        <Text style={[
                          styles.stepIcon,
                          isCompleted && styles.stepIconActive,
                          isCurrent && { fontSize: 16 }
                        ]}>
                          {isCompleted ? step.icon : ""}
                        </Text>
                      </View>
                      {/* Current step pulse effect */}
                      <Animated.View style={[
                        styles.stepPulse,
                        { transform: [{ scale: pulseAnim }], opacity: isCurrent ? 0.5 : 0 }
                      ]} />
                    </View>

                    <Text style={[styles.stepLabelText, isCompleted && styles.stepLabelTextActive]}>
                      {step.label}
                    </Text>

                    {/* Connecting Line */}
                    {i < STATUS_STEPS.length - 1 && (
                      <View style={[
                        styles.stepLine,
                        i < currentStepIndex && styles.stepLineActive
                      ]} />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Volunteer Partner Card */}
            {order.volunteer && (
              <View style={styles.partnerCard}>
                <View style={styles.partnerInfo}>
                  <View style={styles.partnerAvatarBox}>
                    <Text style={styles.partnerAvatarText}>
                      {order.volunteer.name?.charAt(0).toUpperCase()}
                    </Text>
                    <View style={styles.partnerActiveDot} />
                  </View>
                  <View>
                    <Text style={styles.partnerName}>{order.volunteer.name}</Text>
                    <Text style={styles.partnerRole}>Delivery Partner</Text>
                  </View>
                </View>

                {order.volunteer.phone && isActive && (
                  <View style={styles.partnerActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => Linking.openURL(`tel:${order.volunteer.phone}`)}
                    >
                      <Text style={styles.actionBtnIcon}>📞</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => Linking.openURL(`sms:${order.volunteer.phone}`)}
                    >
                      <Text style={styles.actionBtnIcon}>💬</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Order Details Details */}
            <View style={styles.detailsCard}>
              <View style={styles.detailsHeader}>
                <Text style={styles.detailsTitle}>
                  {order.category === "medicine" ? "💊 Medicine" : "🛒 Grocery"} Order 
                </Text>
                <Text style={styles.detailsOrderId}>#{order._id.slice(-6).toUpperCase()}</Text>
              </View>

              <View style={styles.divider} />

              {order.items?.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <View style={styles.itemBullet} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.notes ? (
                      <Text style={styles.itemNotes}>{item.notes}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.itemQty}>x{item.quantity}</Text>
                </View>
              ))}

              <View style={styles.divider} />

              <View style={styles.addressSection}>
                <Text style={styles.addressIcon}>📍</Text>
                <View>
                  <Text style={styles.addressLabel}>Delivery Address</Text>
                  <Text style={styles.addressText}>{order.deliveryAddress}</Text>
                </View>
              </View>

              {order.specialInstructions ? (
                <View style={styles.instructionSection}>
                  <Text style={styles.instructionIcon}>📝</Text>
                  <View>
                    <Text style={styles.addressLabel}>Special Instructions</Text>
                    <Text style={styles.addressText}>{order.specialInstructions}</Text>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={{ height: responsive.showBottomBar ? 80 : 40 }} />
          </ScrollView>
        </View>

        <ElderMobileBottomBar navigation={navigation} activeKey="DeliveryOrderScreen" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: kineticColors.background },
  layout: { flex: 1 },
  mainContent: { flex: 1, position: "relative" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  loadingText: { color: kineticColors.mutedForeground, fontSize: 16 },

  // Map Area
  mapSection: {
    height: Platform.OS === "web" ? "55%" : SCREEN_HEIGHT * 0.5,
    width: "100%",
    backgroundColor: "#111",
    position: "relative",
  },
  map: { flex: 1 },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  mapPlaceholderText: { color: kineticColors.mutedForeground },
  liveBadgeOverlay: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: kineticColors.accent,
  },
  liveTextLabel: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  badgeDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  etaBadgeText: {
    color: kineticColors.accent,
    fontSize: 10,
    fontWeight: "900",
  },

  // Bottom Sheet Overlays
  sheetContainer: {
    flex: 1,
    marginTop: -20, // Overlays map slightly
    backgroundColor: kineticColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  sheetContent: {
    padding: 24,
    gap: 20,
  },

  // ETA Header
  etaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  etaLeft: { flex: 1 },
  etaText: {
    fontSize: 26,
    fontWeight: "800",
    color: kineticColors.foreground,
    letterSpacing: -0.5,
  },
  etaSubText: {
    fontSize: 14,
    color: kineticColors.mutedForeground,
    marginTop: 4,
  },
  animatedProgressContainer: {
    width: 60,
    height: 6,
    backgroundColor: kineticColors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  animatedProgressBar: {
    width: "60%",
    height: "100%",
    backgroundColor: kineticColors.accent,
    borderRadius: 3,
  },

  // Stepper
  stepperContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  stepWrapper: {
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  stepNodeContainer: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: kineticColors.border,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  stepCircleCompleted: {
    backgroundColor: kineticColors.accent,
  },
  stepCircleCurrent: {
    backgroundColor: kineticColors.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  stepPulse: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: kineticColors.accent,
    zIndex: 1,
  },
  stepIcon: {
    fontSize: 12,
    color: "#fff",
    opacity: 0,
  },
  stepIconActive: {
    opacity: 1,
  },
  stepLabelText: {
    fontSize: 11,
    color: kineticColors.mutedForeground,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
    width: 70,
  },
  stepLabelTextActive: {
    color: kineticColors.foreground,
    fontWeight: "700",
  },
  stepLine: {
    position: "absolute",
    top: 18,
    left: "50%",
    right: "-50%",
    height: 2,
    backgroundColor: kineticColors.border,
    zIndex: 1,
  },
  stepLineActive: {
    backgroundColor: kineticColors.accent,
  },

  // Partner Card
  partnerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: kineticColors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: kineticColors.border,
  },
  partnerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  partnerAvatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  partnerAvatarText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },
  partnerActiveDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: kineticColors.accent,
    borderWidth: 2,
    borderColor: kineticColors.background,
  },
  partnerName: {
    color: kineticColors.foreground,
    fontSize: 16,
    fontWeight: "700",
  },
  partnerRole: {
    color: kineticColors.mutedForeground,
    fontSize: 13,
    marginTop: 2,
  },
  partnerActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(96, 178, 70, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnIcon: {
    fontSize: 18,
  },

  // Details Card
  detailsCard: {
    backgroundColor: kineticColors.background,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: kineticColors.border,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailsTitle: {
    color: kineticColors.foreground,
    fontSize: 15,
    fontWeight: "700",
  },
  detailsOrderId: {
    color: kineticColors.mutedForeground,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: kineticColors.border,
    marginVertical: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  itemBullet: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: kineticColors.accent,
    borderRadius: 2,
    marginTop: 4,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: kineticColors.foreground,
    fontSize: 15,
    fontWeight: "500",
  },
  itemNotes: {
    color: kineticColors.mutedForeground,
    fontSize: 13,
    marginTop: 4,
  },
  itemQty: {
    color: kineticColors.foreground,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 12,
  },
  addressSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  addressIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  addressLabel: {
    color: kineticColors.mutedForeground,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
    marginBottom: 4,
  },
  addressText: {
    color: kineticColors.foreground,
    fontSize: 14,
    lineHeight: 20,
  },
  instructionSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 16,
  },
  instructionIcon: {
    fontSize: 18,
    marginTop: 2,
  },
});
