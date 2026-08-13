import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { kineticColors, kineticTypography } from "../theme/kineticTokens";
import KineticCard from "../components/KineticCard";
import KineticButton from "../components/KineticButton";
import KineticInput from "../components/KineticInput";
import { BlurView } from "expo-blur";

export default function SignupScreen({ route, navigation }) {
  const { role } = route.params;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const signup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await register({
        name,
        email,
        password,
        role,
      });

      Alert.alert(
        "Registration Successful 🎉",
        "Your account has been created successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              if (Platform.OS === "web") {
                window.location.reload();
              }
            },
          },
        ]
      );
    } catch (err) {
      console.log("FULL BACKEND ERROR:", err.response?.data || err);
      Alert.alert(
        "Signup Failed",
        err.response?.data?.message || err.message || "Something went wrong. Try again."
      );
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
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>
            {role === "ngo"
              ? "Register Organization"
              : "Create Account"}
          </Text>

          <Text style={styles.subtitle}>
            {role === "ngo"
              ? "Join Elder Connect as an NGO"
              : "Join Elder Connect today"}
          </Text>

          <KineticCard variant="filled" style={styles.card}>
            <KineticInput
              label={role === "ngo" ? "Organization Name" : "Full Name"}
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <KineticInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <KineticInput
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              error={password && confirmPassword && password !== confirmPassword}
            />

            <KineticInput
              label="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              error={password && confirmPassword && password !== confirmPassword}
            />
          </KineticCard>

          <KineticButton
            title={loading ? "Creating Account..." : "Create Account"}
            onPress={signup}
            disabled={loading}
            style={styles.signupButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: kineticColors.background,
  },
  content: {
    padding: 30,
    justifyContent: "center",
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  title: {
    ...kineticTypography.subheading,
    textAlign: "center",
    marginBottom: 8,
    color: kineticColors.foreground,
  },
  subtitle: {
    ...kineticTypography.body,
    textAlign: "center",
    marginBottom: 30,
    color: kineticColors.mutedForeground,
  },
  card: {
    marginBottom: 30,
    padding: 24,
  },
  input: {
    marginBottom: 16,
  },
  signupButton: {
    marginTop: 8,
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
