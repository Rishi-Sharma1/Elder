import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Platform,
  Pressable,
} from "react-native";
import { md3Colors, md3Typography, md3Radii } from "../theme/md3Tokens";
import { SpotlightCard } from "./core/SpotlightCard";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";

export default function RoleSelectModal({ visible, onClose }) {
  const navigation = useNavigation();

  const selectRole = (role) => {
    onClose(); // Close the modal first
    navigation.navigate("Signup", { role });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop overlay */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        
        {/* Prevent taps inside the modal from closing it */}
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Role</Text>
            <Text style={styles.subtitle}>
              Select how you want to use Elder Connect
            </Text>
          </View>

          {/* Elder */}
          <SpotlightCard
            style={styles.card}
            spotlightColor={md3Colors.primary}
            onPress={() => selectRole("elder")}
          >
            <View style={[styles.cardInner, { borderLeftColor: md3Colors.primary, borderLeftWidth: 6 }]}>
              <View style={styles.cardRow}>
                <Text style={styles.icon}>🧓</Text>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Elder</Text>
                  <Text style={styles.cardText}>
                    Request help, food, or medical assistance
                  </Text>
                </View>
              </View>
            </View>
          </SpotlightCard>

          {/* Volunteer */}
          <SpotlightCard
            style={styles.card}
            spotlightColor={md3Colors.tertiary}
            onPress={() => selectRole("volunteer")}
          >
            <View style={[styles.cardInner, { borderLeftColor: md3Colors.tertiary, borderLeftWidth: 6 }]}>
              <View style={styles.cardRow}>
                <Text style={styles.icon}>🤝</Text>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Volunteer</Text>
                  <Text style={styles.cardText}>
                    Help elders and support your community
                  </Text>
                </View>
              </View>
            </View>
          </SpotlightCard>

          {/* NGO */}
          <SpotlightCard
            style={styles.card}
            spotlightColor={md3Colors.error}
            onPress={() => selectRole("ngo")}
          >
            <View style={[styles.cardInner, { borderLeftColor: md3Colors.error, borderLeftWidth: 6 }]}>
              <View style={styles.cardRow}>
                <Text style={styles.icon}>🏢</Text>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>NGO</Text>
                  <Text style={styles.cardText}>
                    Manage requests and coordinate support
                  </Text>
                </View>
              </View>
            </View>
          </SpotlightCard>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: md3Colors.surfaceContainer,
    borderRadius: md3Radii.extraLarge,
    padding: 24,
    borderWidth: 1,
    borderColor: md3Colors.outlineVariant,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    ...md3Typography.headlineMedium,
    color: md3Colors.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...md3Typography.bodyMedium,
    color: md3Colors.onSurfaceVariant,
    textAlign: "center",
  },
  card: {
    marginBottom: 16,
  },
  cardInner: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    ...md3Typography.titleMedium,
    color: md3Colors.onSurface,
    marginBottom: 4,
  },
  cardText: {
    ...md3Typography.bodySmall,
    color: md3Colors.onSurfaceVariant,
  },
  closeBtn: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    ...md3Typography.labelLarge,
    color: md3Colors.primary,
  }
});
