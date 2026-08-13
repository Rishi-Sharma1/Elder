import { kineticColors, kineticTypography } from '../theme/kineticTokens';
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api";
import { Picker } from "@react-native-picker/picker";



export default function CreateRequest({ navigation }) {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!type || !description) {
      Platform.OS === "web"
        ? alert("Please fill all fields")
        : Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "/elder/request",
        {
          type: type.toLowerCase(),
          description,
        }
      );

      Platform.OS === "web"
        ? alert("Request submitted successfully")
        : Alert.alert("Success", "Request submitted successfully");

      navigation.goBack();
    } catch (err) {
      console.log("CREATE REQUEST ERROR:", err);
      Platform.OS === "web"
        ? alert("Failed to submit request")
        : Alert.alert("Error", "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>
          Create Help Request
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            Select Request Type
          </Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={type}
              onValueChange={(value) => setType(value)}
              dropdownIconColor={kineticColors.foreground}
              style={styles.picker}
            >
              <Picker.Item label="Select Type" value="" />
              <Picker.Item label="Medicine" value="medicine" />
              <Picker.Item label="Food" value="food" />
              <Picker.Item label="Emergency" value="emergency" />
            </Picker>
          </View>

          <Text style={styles.label}>
            Describe Your Need
          </Text>

          <TextInput
            placeholder="Explain what you need..."
            placeholderTextColor={kineticColors.mutedForeground}
            value={description}
            onChangeText={setDescription}
            style={styles.textArea}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            type === "emergency" && styles.emergencyButton,
          ]}
          onPress={submit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>
              {type === "emergency"
                ? "🚨 Submit Emergency Request"
                : "Submit Request"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    flexGrow: 1,
    justifyContent: "center",
  },

  header: {
    ...kineticTypography.subheading,
    color: kineticColors.foreground,
    marginBottom: 25,
  },

  card: {
    backgroundColor: kineticColors.background,
    padding: 30,
    borderWidth: 2,
    borderColor: kineticColors.border,
    marginBottom: 30,
  },

  label: {
    ...kineticTypography.body,
    color: kineticColors.foreground,
    marginBottom: 10,
  },

  pickerContainer: {
    backgroundColor: kineticColors.background,
    borderWidth: 2,
    borderColor: kineticColors.border,
    marginBottom: 20,
  },

  picker: {
    color: kineticColors.foreground,
    backgroundColor: kineticColors.background,
    ...kineticTypography.body,
    height: 55,
    width: "100%",
  },

  textArea: {
    backgroundColor: kineticColors.background,
    padding: 16,
    ...kineticTypography.body,
    color: kineticColors.foreground,
    borderWidth: 2,
    borderColor: kineticColors.border,
    minHeight: 120,
    textAlignVertical: "top",
  },

  submitButton: {
    backgroundColor: kineticColors.accent,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: kineticColors.foreground,
  },

  emergencyButton: {
    backgroundColor: kineticColors.error,
  },

  submitText: {
    color: kineticColors.accentForeground,
    ...kineticTypography.label,
  },
});
