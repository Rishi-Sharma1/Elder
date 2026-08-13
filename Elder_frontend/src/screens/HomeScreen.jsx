import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useResponsive from "../hooks/useResponsive";
import { kineticTypography, kineticColors } from "../theme/kineticTokens";
import KineticButton from "../components/KineticButton";
import KineticCard from "../components/KineticCard";
import Marquee from "../components/Marquee";
import { BlurView } from "expo-blur";
import { InView } from "../components/core/InView";
import { SpotlightCard } from "../components/core/SpotlightCard";
import RoleSelectModal from "../components/RoleSelectModal";

export default function HomeScreen({ navigation }) {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const [isRoleModalVisible, setRoleModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Organic Shapes for MD3 Bold Factor */}
      <View style={styles.shape1} />
      <View style={styles.shape2} />
      <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Navbar ─── */}
        <View style={styles.navbar}>
          <View style={styles.navLeft}>
            <Text style={styles.logoIcon}>🤝</Text>
            <Text style={styles.logoText}>ElderConnect</Text>
          </View>
          {!isMobile && (
            <View style={styles.navLinks}>
              {["Home", "About Us", "Benefits", "Contact"].map((link) => (
                <Text key={link} style={styles.navLink}>{link}</Text>
              ))}
            </View>
          )}
          <View style={styles.navRight}>
            <KineticButton
              title="Login"
              variant="outlined"
              onPress={() => navigation.navigate("Login")}
              style={styles.navBtn}
            />
            <KineticButton
              title="Register"
              variant="filled"
              onPress={() => setRoleModalVisible(true)}
              style={styles.navBtn}
            />
          </View>
        </View>

        {/* ─── Hero Section ─── */}
        <InView
          variants={{
            hidden: { opacity: 0, y: 30, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ duration: 0.5 }}
          viewOptions={{ margin: '0px 0px -50px 0px', once: true }}
        >
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, isMobile && { fontSize: 48 }]}>
              CONNECTING GENERATIONS,{"\n"}ENRICHING LIVES
            </Text>
            <Text style={styles.heroSubtitle}>
              ElderConnect brings together seniors, volunteers, and NGOs to create a supportive community for aging with dignity.
            </Text>
            <View style={[styles.heroButtons, isMobile && { flexDirection: "column" }]}>
              <KineticButton
                title="Get Started →"
                variant="filled"
                onPress={() => setRoleModalVisible(true)}
                style={styles.heroBtn}
              />
              <KineticButton
                title="Sign In"
                variant="tonal"
                onPress={() => navigation.navigate("Login")}
                style={styles.heroBtn}
              />
            </View>
          </View>
        </InView>

        {/* Marquee Section */}
        <Marquee text="10K+ ELDERS HELPED • 5K+ VOLUNTEERS • 50+ PARTNER NGOS" />

        {/* ─── Features Section ─── */}
        <InView
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5 }}
          viewOptions={{ margin: '0px 0px -100px 0px', once: true }}
        >
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>OUR SERVICES</Text>
            <Text style={[styles.sectionTitle, isMobile && { fontSize: 28 }]}>
              Tailored for Our Community
            </Text>
            <Text style={styles.sectionSubtitle}>
              Whether you are looking for help, want to give back, or manage an organization, we have the tools for you.
            </Text>

            <View style={[styles.featuresGrid, isMobile && { flexDirection: "column" }]}>
                <SpotlightCard style={styles.featureCardWrap} spotlightColor={kineticColors.accent}>
                  <View style={styles.featureCardInner}>
                    <Text style={styles.featureIcon}>👴</Text>
                    <Text style={styles.featureTitle}>For Seniors</Text>
                    <Text style={[styles.featureSubtitle, { color: kineticColors.accent }]}>Care & Companionship</Text>
                    <Text style={styles.featureDesc}>Find assistance with daily tasks, companionship, and engaging community events tailored for your comfort.</Text>
                  </View>
                </SpotlightCard>
                <SpotlightCard style={styles.featureCardWrap} spotlightColor={kineticColors.accent}>
                  <View style={styles.featureCardInner}>
                    <Text style={styles.featureIcon}>🤝</Text>
                    <Text style={styles.featureTitle}>For Volunteers</Text>
                    <Text style={[styles.featureSubtitle, { color: kineticColors.accent }]}>Make a Meaningful Impact</Text>
                    <Text style={styles.featureDesc}>Share your skills and time to brighten someone's day while gaining invaluable life experience.</Text>
                  </View>
                </SpotlightCard>
                <SpotlightCard style={styles.featureCardWrap} spotlightColor={kineticColors.error}>
                  <View style={styles.featureCardInner}>
                    <Text style={styles.featureIcon}>🏢</Text>
                    <Text style={styles.featureTitle}>For NGOs</Text>
                    <Text style={[styles.featureSubtitle, { color: kineticColors.error }]}>Efficient Resource Management</Text>
                    <Text style={styles.featureDesc}>Access professional tools to manage programs and connect with dedicated volunteers effortlessly.</Text>
                  </View>
                </SpotlightCard>
            </View>
          </View>
        </InView>


        {/* ─── Services Grid ─── */}
        <InView
          variants={{
            hidden: { opacity: 0, x: -100 },
            visible: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.5 }}
          viewOptions={{ margin: '0px 0px -100px 0px', once: true }}
        >
          <View style={[styles.section, { backgroundColor: kineticColors.backgroundContainerLow }]}>
            <Text style={styles.sectionLabel}>FEATURES</Text>
            <Text style={[styles.sectionTitle, isMobile && { fontSize: 28 }]}>
              Everything You Need
            </Text>

            <View style={[styles.servicesGrid, isMobile && { flexDirection: "column" }]}>
              {[
                { icon: "💊", title: "Medicine Delivery", desc: "Timely medication delivery right to your doorstep" },
                { icon: "🤖", title: "AI Chatbot", desc: "24/7 AI assistance for urgent queries and support" },
                { icon: "📋", title: "Medical Records", desc: "Secure storage for your complete medical history" },
                { icon: "🎉", title: "Social Events", desc: "Community events to keep you connected and engaged" },
              ].map((item) => (
                <KineticCard key={item.title} variant="outlined" style={styles.serviceCard} hoverable={true}>
                  <Text style={styles.serviceIcon}>{item.icon}</Text>
                  <Text style={styles.serviceTitle}>{item.title}</Text>
                  <Text style={styles.serviceDesc}>{item.desc}</Text>
                </KineticCard>
              ))}
            </View>
          </View>
        </InView>

        {/* ─── Innovation Section ─── */}
        <InView
          variants={{
            hidden: { opacity: 0, x: 100 },
            visible: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.5 }}
          viewOptions={{ margin: '0px 0px -100px 0px', once: true }}
        >
          <View style={styles.section}>
            <View style={[styles.innovationRow, isMobile && { flexDirection: "column" }]}>
              <View style={[styles.innovationLeft, !isMobile && { flex: 1 }]}>
                <Text style={styles.sectionLabel}>WHY CHOOSE US</Text>
                <Text style={[styles.sectionSubheading, { textAlign: "left" }, isMobile && { fontSize: 28 }]}>
                  Innovative support designed for everyday life.
                </Text>
                <Text style={[styles.sectionSubtitle, { textAlign: "left" }]}>
                  We combine the warmth of human connection with cutting-edge technology to ensure safety, health, and happiness.
                </Text>
              </View>
                <View style={[styles.innovationRight, !isMobile && { flex: 1 }]}>
                  {[
                    "Verified professional volunteers only",
                    "Secure storage for medical history",
                    "24/7 AI assistance for urgent queries",
                    "Community-driven support network",
                  ].map((item) => (
                    <KineticCard key={item} variant="filled" style={styles.checkItem}>
                      <View style={styles.checkCircle}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                      <Text style={styles.checkText}>{item}</Text>
                    </KineticCard>
                  ))}
                </View>
            </View>
          </View>
        </InView>

        {/* ─── Mission Section ─── */}
        <InView
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.4 }}
          viewOptions={{ margin: '0px 0px -100px 0px', once: true }}
        >
          <View style={[styles.section, { backgroundColor: kineticColors.backgroundContainerLow }]}>
            <View style={styles.missionCard}>
              <Text style={styles.sectionLabel}>OUR MISSION</Text>
              <Text style={[styles.sectionTitle, isMobile && { fontSize: 28 }]}>
                Building a Safer, More Connected World
              </Text>
              <Text style={[styles.sectionSubtitle, { maxWidth: 700 }]}>
                We believe every senior deserves to age with dignity, surrounded by a community that cares. Through compassionate volunteerism and technological innovation, we're bridging the gap between generations.
              </Text>
            </View>
          </View>
        </InView>

        {/* ─── CTA Section ─── */}
        <InView
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5 }}
          viewOptions={{ margin: '0px 0px -50px 0px', once: true }}
        >
          <View style={styles.ctaSection}>
            <Text style={[styles.ctaTitle, isMobile && { fontSize: 28 }]}>
              Ready to Make a Difference?
            </Text>
            <Text style={styles.ctaSubtitle}>
              Join thousands of members already making an impact in their local communities. Start your journey today.
            </Text>
            <View style={[styles.ctaButtons, isMobile && { flexDirection: "column" }]}>
              <KineticButton
                title="Join Now →"
                variant="filled"
                onPress={() => setRoleModalVisible(true)}
                style={styles.heroBtn}
              />
              <KineticButton
                title="Sign In"
                variant="tonal"
                onPress={() => navigation.navigate("Login")}
                style={styles.heroBtn}
              />
            </View>
          </View>
        </InView>

        {/* ─── Footer ─── */}
        <View style={styles.footer}>
          <View style={[styles.footerTop, isMobile && { flexDirection: "column", gap: 30 }]}>
            <View style={styles.footerBrand}>
              <Text style={styles.logoText}>🤝 ElderConnect</Text>
              <Text style={styles.footerBrandDesc}>
                Dedicated to enhancing the quality of life for seniors through compassionate volunteerism and technological innovation.
              </Text>
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>Platform</Text>
              {["Home", "About Us", "Benefits", "Contact"].map((link) => (
                <Text key={link} style={styles.footerLink}>{link}</Text>
              ))}
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>Legal</Text>
              {["Privacy Policy", "Terms of Service", "Accessibility"].map((link) => (
                <Text key={link} style={styles.footerLink}>{link}</Text>
              ))}
            </View>
          </View>
          <View style={styles.footerBottom}>
            <Text style={styles.footerCopyright}>© 2024 ElderConnect. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
      
      <RoleSelectModal 
        visible={isRoleModalVisible} 
        onClose={() => setRoleModalVisible(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: kineticColors.background },

  /* Shapes */
  shape1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: kineticColors.accentContainer,
    opacity: 0.5,
  },
  shape2: {
    position: 'absolute',
    bottom: 200,
    left: -150,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: kineticColors.accentContainer,
    opacity: 0.4,
  },

  /* Navbar */
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: kineticColors.borderVariant,
    backgroundColor: kineticColors.backgroundContainerLow + 'F0',
  },
  navLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoIcon: { fontSize: 24 },
  logoText: { ...kineticTypography.cardTitle, color: kineticColors.accent },
  navLinks: { flexDirection: "row", gap: 32 },
  navLink: { color: kineticColors.mutedForeground, ...kineticTypography.body, fontWeight: "700" },
  navRight: { flexDirection: "row", gap: 12 },
  navBtn: { height: 40 },

  /* Hero */
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 60,
  },
  heroTitle: {
    ...kineticTypography.hero,
    color: kineticColors.foreground,
    textAlign: "center",
    marginBottom: 20,
  },
  heroSubtitle: {
    ...kineticTypography.cardTitle,
    textTransform: "none",
    fontWeight: "500",
    color: kineticColors.mutedForeground,
    textAlign: "center",
    maxWidth: 750,
    marginBottom: 40,
  },
  heroButtons: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 60,
  },
  heroBtn: { minWidth: 200, height: 64 },

  /* Section */
  section: {
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  sectionLabel: {
    color: kineticColors.accent,
    ...kineticTypography.label,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    ...kineticTypography.heading,
    color: kineticColors.foreground,
    textAlign: "center",
    marginBottom: 16,
  },
  sectionSubheading: {
    ...kineticTypography.subheading,
    color: kineticColors.foreground,
    textAlign: "center",
    marginBottom: 16,
  },
  sectionSubtitle: {
    ...kineticTypography.cardTitle,
    textTransform: "none",
    fontWeight: "500",
    color: kineticColors.mutedForeground,
    textAlign: "center",
    maxWidth: 700,
    marginBottom: 48,
    alignSelf: "center",
  },

  /* Features Grid */
  featuresGrid: {
    flexDirection: "row",
    gap: 20,
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
  },
  featureCardWrap: {
    flex: 1,
  },
  featureCardInner: {
    flex: 1,
    padding: 28,
  },
  featureIcon: { fontSize: 36, marginBottom: 16 },
  featureTitle: { ...kineticTypography.cardTitle, color: kineticColors.foreground, marginBottom: 4 },
  featureSubtitle: { ...kineticTypography.label, marginBottom: 12 },
  featureDesc: { ...kineticTypography.body, fontSize: 20, color: kineticColors.mutedForeground },

  /* Services Grid */
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    maxWidth: 900,
    alignSelf: "center",
    width: "100%",
  },
  serviceCard: {
    // Force equal widths so flex-grow doesn't warp sizes based on text content
    flexBasis: Platform.OS === 'web' ? 'calc(50% - 15px)' : '48%', 
    flexGrow: 1,
    minWidth: 260,
    padding: 28,
    alignItems: "center",
  },
  serviceIcon: { fontSize: 36, marginBottom: 12 },
  serviceTitle: { ...kineticTypography.cardTitle, color: kineticColors.foreground, marginBottom: 6, textAlign: "center" },
  serviceDesc: { ...kineticTypography.body, fontSize: 20, color: kineticColors.mutedForeground, textAlign: "center" },

  /* Innovation */
  innovationRow: {
    flexDirection: "row",
    gap: 48,
    maxWidth: 1000,
    alignSelf: "center",
    width: "100%",
  },
  innovationLeft: {},
  innovationRight: { gap: 16, justifyContent: "center" },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: kineticColors.accentContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { color: kineticColors.accent, fontWeight: "700", fontSize: 14 },
  checkText: { color: kineticColors.foreground, ...kineticTypography.body, flex: 1 },

  /* Mission */
  missionCard: {
    maxWidth: 800,
    alignSelf: "center",
    alignItems: "center",
  },

  /* CTA */
  ctaSection: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 24,
    backgroundColor: kineticColors.backgroundContainer,
    borderTopWidth: 1,
    borderTopColor: kineticColors.borderVariant,
    borderBottomWidth: 1,
    borderBottomColor: kineticColors.borderVariant,
  },
  ctaTitle: {
    ...kineticTypography.heading,
    color: kineticColors.accent,
    textAlign: "center",
    marginBottom: 16,
  },
  ctaSubtitle: {
    ...kineticTypography.cardTitle,
    textTransform: "none",
    fontWeight: "500",
    color: kineticColors.mutedForeground,
    textAlign: "center",
    maxWidth: 650,
    marginBottom: 36,
  },
  ctaButtons: {
    flexDirection: "row",
    gap: 16,
  },

  /* Footer */
  footer: {
    backgroundColor: kineticColors.backgroundContainerLow,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  footerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    maxWidth: 1000,
    alignSelf: "center",
    width: "100%",
    paddingBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: kineticColors.borderVariant,
  },
  footerBrand: { maxWidth: 350 },
  footerBrandDesc: { color: kineticColors.mutedForeground, ...kineticTypography.body, marginTop: 12 },
  footerCol: { gap: 10 },
  footerColTitle: { color: kineticColors.foreground, ...kineticTypography.label, marginBottom: 6 },
  footerLink: { color: kineticColors.mutedForeground, ...kineticTypography.body, fontSize: 20 },
  footerBottom: {
    paddingVertical: 24,
    alignItems: "center",
  },
  footerCopyright: { color: kineticColors.mutedForeground, ...kineticTypography.body },
});
