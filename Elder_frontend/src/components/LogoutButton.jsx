import { Text, TouchableOpacity, Platform, Alert } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function LogoutButton() {
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Do you want to sign out?");
      if (!confirmed) return;
      await logout();
    } else {
      Alert.alert(
        "Sign out",
        "Do you want to sign out?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign out",
            style: "destructive",
            onPress: async () => {
              await logout();
            },
          },
        ]
      );
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 12 }}>
      <Text style={{ color: "red", fontWeight: "600" }}>
        Sign Out
      </Text>
    </TouchableOpacity>
  );
}
