import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { kineticColors, kineticTypography } from "../theme/kineticTokens";
import KineticCard from "../components/KineticCard";
import { BlurView } from "expo-blur";

export default function RoleSelectScreen({ navigation }) {
  const selectRole = (role) => {
    navigation.navigate("Signup", { role });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Organic Shapes for MD3 Bold Factor */}
      <View style={styles.shape1} />
      <View style={styles.shape2} />
      <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />

      <View style={styles.content}>
        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>
          Select how you want to use Elder Connect
        </Text>

        {/* Elder */}
        <KineticCard
          style={[styles.card, { borderTopColor: kineticColors.accent, borderTopWidth: 4 }]}
          onPress={() => selectRole("elder")}
          variant="filled"
        >
          <Text style={styles.icon}>🧓</Text>
          <Text style={styles.cardTitle}>Elder</Text>
          <Text style={styles.cardText}>
            Request help, food, or medical assistance
          </Text>
        </KineticCard>

        {/* Volunteer */}
        <KineticCard
          style={[styles.card, { borderTopColor: kineticColors.accent, borderTopWidth: 4 }]}
          onPress={() => selectRole("volunteer")}
          variant="filled"
        >
          <Text style={styles.icon}>🤝</Text>
          <Text style={styles.cardTitle}>Volunteer</Text>
          <Text style={styles.cardText}>
            Help elders and support your community
          </Text>
        </KineticCard>

        {/* NGO */}
        <KineticCard
          style={[styles.card, { borderTopColor: kineticColors.error, borderTopWidth: 4 }]}
          onPress={() => selectRole("ngo")}
          variant="filled"
        >
          <Text style={styles.icon}>🏢</Text>
          <Text style={styles.cardTitle}>NGO</Text>
          <Text style={styles.cardText}>
            Manage requests and coordinate support
          </Text>
        </KineticCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: kineticColors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  title: {
    ...kineticTypography.subheading,
    textAlign: "center",
    marginBottom: 10,
    color: kineticColors.foreground,
  },
  subtitle: {
    ...kineticTypography.body,
    textAlign: "center",
    marginBottom: 40,
    color: kineticColors.mutedForeground,
  },
  card: {
    marginBottom: 20,
    alignItems: "center",
  },
  icon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    ...kineticTypography.cardTitle,
    color: kineticColors.foreground,
    marginBottom: 6,
  },
  cardText: {
    ...kineticTypography.body,
    color: kineticColors.mutedForeground,
    textAlign: "center",
  },
  shape1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: kineticColors.accentContainer,
    opacity: 0.6,
  },
  shape2: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: kineticColors.accentContainer,
    opacity: 0.4,
  },
});
