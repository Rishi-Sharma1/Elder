import { useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Pressable } from "react-native";
import useResponsive from "../hooks/useResponsive";
import { AuthContext } from "../context/AuthContext";
import { kineticColors, kineticTypography } from "../theme/kineticTokens";

const navItems = [
  { key: "ElderDashboard", label: "Dashboard", shortLabel: "Home", icon: "🏠" },
  { key: "CreateRequest", label: "Create Request", shortLabel: "Request", icon: "📝" },
  { key: "MyRequests", label: "My Requests", shortLabel: "Requests", icon: "📋" },
  { key: "DeliveryOrderScreen", label: "Deliveries", shortLabel: "Deliver", icon: "🚚" },
  { key: "DeliveryHistoryScreen", label: "Track Orders", shortLabel: "Track", icon: "📍" },
  { key: "NGOsScreen", label: "Partner NGOs", shortLabel: "NGOs", icon: "🤝" },
  { key: "MyNGOsScreen", label: "My NGOs", shortLabel: "My NGOs", icon: "🏢" },
  { key: "EventsScreen", label: "Events", shortLabel: "Events", icon: "📅" },
];

function navigateTo(navigation, key, activeKey) {
  if (key !== activeKey) {
    if (key === "ElderDashboard") {
      navigation.popToTop?.() || navigation.navigate("ElderDashboard");
    } else {
      navigation.navigate(key);
    }
  }
}

/* ── Desktop Sidebar ── */
export default function ElderSidebar({ navigation, activeKey }) {
  const { showSidebar } = useResponsive();
  const { user } = useContext(AuthContext);
  const [hoveredKey, setHoveredKey] = useState(null);

  if (!showSidebar) return null;

  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Text style={styles.logo}>ElderConnect</Text>
        <Text style={styles.hub}>Elder Hub</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          {user?.profilePhoto ? (
            <Image 
              source={{ uri: user.profilePhoto }} 
              style={{ width: "100%", height: "100%", borderRadius: 25 }} 
            />
          ) : (
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>{user?.name || "Elder"}</Text>
          <Text style={styles.profileRole}>Elder</Text>
        </View>
      </View>

      <View style={styles.sidebarNav}>
        {navItems.map((item) => {
          const isActive = activeKey === item.key;
          const isHovered = hoveredKey === item.key;
          
          return (
            <Pressable
              key={item.key}
              onPress={() => navigateTo(navigation, item.key, activeKey)}
              onHoverIn={() => setHoveredKey(item.key)}
              onHoverOut={() => setHoveredKey(null)}
              style={[
                styles.sidebarItem, 
                isActive && styles.sidebarItemActive,
                !isActive && isHovered && styles.sidebarItemHover,
              ]}
            >
              <Text style={styles.sidebarIcon}>{item.icon}</Text>
              <Text style={[styles.sidebarText, isActive && styles.sidebarTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ── Mobile / Tablet Bottom Bar ── */
export function ElderMobileBottomBar({ navigation, activeKey }) {
  const { showBottomBar } = useResponsive();
  if (!showBottomBar) return null;

  return (
    <View style={styles.bottomBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bottomBarContent}
      >
        {/* Render first 3 nav items: Home, Request, Requests */}
        {navItems.slice(0, 3).map((item) => {
          const isActive = activeKey === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => navigateTo(navigation, item.key, activeKey)}
              style={[styles.bottomTab, isActive && styles.bottomTabActive]}
            >
              <View style={[styles.bottomTabIconContainer, isActive && styles.bottomTabIconContainerActive]}>
                <Text style={[styles.bottomTabIcon, isActive && styles.bottomTabIconActive]}>
                  {item.icon}
                </Text>
              </View>
              <Text style={[styles.bottomTabLabel, isActive && styles.bottomTabLabelActive]}>
                {item.shortLabel}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Centerpiece: Deliver (New Order) */}
        <TouchableOpacity
          onPress={() => navigation.navigate("DeliveryOrderScreen")}
          style={[
            styles.bottomTab, 
            { 
              marginVertical: 4, 
              paddingHorizontal: 8,
              minWidth: 80,
            }
          ]}
        >
          <View style={[styles.bottomTabIconContainer, { backgroundColor: md3Colors.tertiary, borderRadius: md3Radii.extraLarge, width: 64, height: 32, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={[styles.bottomTabIcon, { fontSize: 20, color: md3Colors.onTertiary }]}>🚚</Text>
          </View>
          <Text style={[styles.bottomTabLabel, { color: md3Colors.tertiary, fontWeight: '800' }]}>Deliver</Text>
        </TouchableOpacity>

        {/* Primary Action: Track (History) */}
        <TouchableOpacity
          onPress={() => navigation.navigate("DeliveryHistoryScreen")}
          style={[styles.bottomTab]}
        >
          <View style={[styles.bottomTabIconContainer, activeKey === "DeliveryHistoryScreen" && styles.bottomTabIconContainerActive]}>
            <Text style={[styles.bottomTabIcon, activeKey === "DeliveryHistoryScreen" && styles.bottomTabIconActive]}>📍</Text>
          </View>
          <Text style={[styles.bottomTabLabel, activeKey === "DeliveryHistoryScreen" && styles.bottomTabLabelActive]}>Track</Text>
        </TouchableOpacity>

        {/* Render remaining nav items: NGOs, Events */}
        {navItems.slice(5).map((item) => {
          const isActive = activeKey === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => navigateTo(navigation, item.key, activeKey)}
              style={[styles.bottomTab]}
            >
              <View style={[styles.bottomTabIconContainer, isActive && styles.bottomTabIconContainerActive]}>
                <Text style={[styles.bottomTabIcon, isActive && styles.bottomTabIconActive]}>
                  {item.icon}
                </Text>
              </View>
              <Text style={[styles.bottomTabLabel, isActive && styles.bottomTabLabelActive]}>
                {item.shortLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ── Sidebar ── */
  sidebar: {
    width: 340,
    backgroundColor: kineticColors.backgroundContainerLow,
    borderRightWidth: 1,
    borderRightColor: kineticColors.border,
  },
  sidebarHeader: { padding: 24, borderBottomWidth: 1, borderBottomColor: kineticColors.border },
  logo: { ...kineticTypography.subheading, fontSize: 32, color: kineticColors.accent },
  hub: { color: kineticColors.mutedForeground, marginTop: 4, ...kineticTypography.label },
  
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: kineticColors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 0,
    backgroundColor: kineticColors.accentContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { ...kineticTypography.cardTitle, fontSize: 20, color: kineticColors.accentForeground },
  profileInfo: { flex: 1 },
  profileName: { color: kineticColors.foreground, ...kineticTypography.cardTitle, fontSize: 20, marginBottom: 2 },
  profileRole: { color: kineticColors.mutedForeground, ...kineticTypography.label },

  sidebarNav: { padding: 12 },
  sidebarItem: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 0, marginBottom: 4, gap: 12,
  },
  sidebarItemActive: {
    backgroundColor: (kineticColors.accent + "20"),
    borderLeftWidth: 6, borderLeftColor: kineticColors.accent,
  },
  sidebarItemHover: {
    backgroundColor: kineticColors.backgroundContainer,
  },
  sidebarIcon: { fontSize: 20 },
  sidebarText: { color: kineticColors.mutedForeground, ...kineticTypography.body },
  sidebarTextActive: { color: kineticColors.accent, ...kineticTypography.body, fontWeight: "700" },

  /* ── Bottom Bar ── */
  bottomBar: {
    backgroundColor: kineticColors.background,
    borderTopWidth: 1,
    borderTopColor: kineticColors.border,
    paddingBottom: 8,
    paddingTop: 8,
  },
  bottomBarContent: { flexDirection: "row", paddingHorizontal: 4, alignItems: "center" },
  bottomTab: {
    flex: 1, minWidth: 70, alignItems: "center",
    paddingVertical: 4, paddingHorizontal: 4,
    borderRadius: 0, marginHorizontal: 2,
  },
  bottomTabIconContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 0,
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomTabIconContainerActive: {
    backgroundColor: (kineticColors.accent + "20"),
    borderLeftWidth: 6, borderLeftColor: kineticColors.accent,
  },
  bottomTabIcon: { fontSize: 20 },
  bottomTabIconActive: { fontSize: 22 },
  bottomTabLabel: { color: kineticColors.mutedForeground, ...kineticTypography.label, textAlign: "center" },
  bottomTabLabelActive: { color: kineticColors.foreground, ...kineticTypography.label, fontWeight: "700" },
});
