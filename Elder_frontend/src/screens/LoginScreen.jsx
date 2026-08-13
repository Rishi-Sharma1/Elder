import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { kineticColors, kineticTypography } from "../theme/kineticTokens";
import KineticCard from "../components/KineticCard";
import KineticInput from "../components/KineticInput";
import KineticButton from "../components/KineticButton";
import { BlurView } from 'expo-blur';
import RoleSelectModal from "../components/RoleSelectModal";

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRoleModalVisible, setRoleModalVisible] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error) {
      Alert.alert("Login Failed", error.response?.data?.message || error.message || "Wrong email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Organic Shapes for MD3 Bold Factor */}
      <View style={styles.shape1} />
      <View style={styles.shape2} />
      <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.wrapper}
          keyboardShouldPersistTaps="handled"
        >
          <KineticCard style={styles.card}>
            <Text style={styles.title}>Elder Connect</Text>
            <Text style={styles.subtitle}>
              Volunteer & Support Platform
            </Text>

            <KineticInput
              label="Email Address"
              placeholder="Enter your email"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <KineticInput
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.buttonContainer}>
              {loading ? (
                <ActivityIndicator color={kineticColors.accent} size="large" />
              ) : (
                <KineticButton
                  title="Login"
                  onPress={handleLogin}
                  variant="filled"
                  style={styles.loginButton}
                />
              )}
            </View>

            <KineticButton
              title="Create New Account"
              onPress={() => setRoleModalVisible(true)}
              variant="text"
            />
          </KineticCard>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <RoleSelectModal 
        visible={isRoleModalVisible} 
        onClose={() => setRoleModalVisible(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: kineticColors.background,
    position: 'relative',
  },
  shape1: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: kineticColors.accentContainer,
    opacity: 0.8,
  },
  shape2: {
    position: 'absolute',
    bottom: -height * 0.05,
    left: -width * 0.3,
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: kineticColors.accentContainer,
    opacity: 0.6,
  },
  wrapper: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    width: "100%",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: kineticColors.backgroundContainer,
  },
  title: {
    ...kineticTypography.subheading,
    color: kineticColors.foreground,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    ...kineticTypography.body,
    color: kineticColors.mutedForeground,
    textAlign: "center",
    marginBottom: 32,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 16,
    height: 48, // slightly taller to give space for loading indicator
    justifyContent: 'center',
  },
  loginButton: {
    height: 48,
  }
});
