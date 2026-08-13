import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { useContext, useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { kineticColors, kineticTypography } from "../theme/kineticTokens";
import KineticCard from "../components/KineticCard";
import KineticButton from "../components/KineticButton";
import KineticInput from "../components/KineticInput";
import { BlurView } from "expo-blur";

const SUGGESTIONS = {
  cities: ["Bhopal", "Indore", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Lucknow", "Nagpur", "Noida", "Gurgaon", "Chandigarh"],
  states: ["Madhya Pradesh", "Maharashtra", "Delhi", "Karnataka", "Telangana", "Gujarat", "Tamil Nadu", "West Bengal", "Rajasthan", "Uttar Pradesh", "Haryana", "Punjab"]
};

export default function MyProfile() {
  const { user, login, loading } = useContext(AuthContext);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [idImage, setIdImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Address parts
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [citySuggestions, setCitySuggestions] = useState([]);
  const [stateSuggestions, setStateSuggestions] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    if (!user && !loading) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      
      const addr = user.address || "";
      const parts = addr.split(',').map(p => p.trim());
      setLocality(parts[0] || "");
      setCity(parts[1] || "");
      setState(parts[2] || "");
      setAddress(addr);

      setGender(user.gender || "");
      setEmergencyContact(user.emergencyContact || "");
      setProfilePhoto(user.profilePhoto || null);
    }
  }, [user]);

  if (loading || !user) return null;

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission required!");
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

    if (!result.canceled) {
      setIdImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!idImage) return null;

    const data = new FormData();

    if (Platform.OS === "web") {
      const res = await fetch(idImage);
      const blob = await res.blob();
      data.append("file", blob);
    } else {
      data.append("file", {
        uri: idImage,
        type: "image/jpeg",
        name: "id.jpg",
      });
    }

    data.append("upload_preset", "elder_verify");
    data.append("cloud_name", "rishisharma");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/rishisharma/image/upload",
      { method: "POST", body: data }
    );

    const json = await res.json();
    return json.secure_url;
  };

  const pickProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1], // Square aspect ratio for profile photo
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async () => {
    if (!profilePhoto || profilePhoto.startsWith("http")) return profilePhoto; // Already uploaded

    const data = new FormData();
    
    if (Platform.OS === "web") {
      const res = await fetch(profilePhoto);
      const blob = await res.blob();
      data.append("file", blob);
    } else {
      data.append("file", {
        uri: profilePhoto,
        type: "image/jpeg",
        name: "profile.jpg",
      });
    }

    data.append("upload_preset", "elder_verify");
    data.append("cloud_name", "rishisharma");

    const res = await fetch("https://api.cloudinary.com/v1_1/rishisharma/image/upload", {
      method: "POST",
      body: data,
    });
    const json = await res.json();
    return json.secure_url;
  };

  const handleCityChange = (text) => {
    setCity(text);
    if (text.length > 1) {
      const filtered = SUGGESTIONS.cities.filter(c => c.toLowerCase().includes(text.toLowerCase()));
      setCitySuggestions(filtered);
    } else {
      setCitySuggestions([]);
    }
  };

  const handleStateChange = (text) => {
    setState(text);
    if (text.length > 1) {
      const filtered = SUGGESTIONS.states.filter(s => s.toLowerCase().includes(text.toLowerCase()));
      setStateSuggestions(filtered);
    } else {
      setStateSuggestions([]);
    }
  };

  const saveProfile = async () => {
    try {
      setUploading(true);

      let imageUrl = user.verification?.idFrontUrl || null;
      let finalProfilePhoto = user.profilePhoto;

      if (idImage) imageUrl = await uploadImage();
      
      if (profilePhoto && !profilePhoto.startsWith("http")) {
        finalProfilePhoto = await uploadProfileImage();
      } else if (profilePhoto) {
         finalProfilePhoto = profilePhoto;
      }

      const fullAddress = `${locality}, ${city}, ${state}`;

      const res = await api.put(
        "/auth/update-profile",
        {
          phone,
          address: fullAddress,
          gender,
          emergencyContact,
          idFrontUrl: imageUrl,
          profilePhoto: finalProfilePhoto,
        }
      );

      login(res.data);
      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setUploading(false);
    }
  };

  const status = user?.verification?.status || "not_verified";

  const getStatusColor = () => {
    if (status === "approved") return kineticColors.accent;
    if (status === "rejected") return kineticColors.error;
    return kineticColors.accent; // Warning alternative
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Organic Shapes for MD3 Bold Factor */}
      <View style={styles.shape1} />
      <View style={styles.shape2} />
      <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>My Profile</Text>

        {/* Profile Avatar Selection */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            onPress={isEditing ? pickProfilePhoto : null} 
            style={styles.avatarContainer}
            disabled={!isEditing}
          >
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
            )}
            {isEditing && (
              <View style={styles.editAvatarBadge}>
                <Text style={styles.editAvatarIcon}>✏️</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Basic Info */}
        <KineticCard variant="filled" style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>

          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{user?.role}</Text>
        </KineticCard>

        {/* Editable Section */}
        <KineticCard variant="filled" style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          {isEditing ? (
            <KineticInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
            />
          ) : (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{phone || "Not set"}</Text>
            </View>
          )}

          {isEditing ? (
            <View style={{ gap: 10, marginBottom: 16 }}>
              <KineticInput
                label="Locality / Area Name"
                value={locality}
                onChangeText={setLocality}
              />
              <KineticInput
                label="City / District"
                value={city}
                onChangeText={handleCityChange}
              />
              {citySuggestions.length > 0 && (
                <View style={styles.suggestions}>
                  {citySuggestions.map((s, i) => (
                    <TouchableOpacity key={i} onPress={() => { setCity(s); setCitySuggestions([]); }} style={styles.suggestionItem}>
                      <Text style={styles.suggestionText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <KineticInput
                label="State"
                value={state}
                onChangeText={handleStateChange}
              />
              {stateSuggestions.length > 0 && (
                <View style={styles.suggestions}>
                  {stateSuggestions.map((s, i) => (
                    <TouchableOpacity key={i} onPress={() => { setState(s); setStateSuggestions([]); }} style={styles.suggestionItem}>
                      <Text style={styles.suggestionText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>
                {locality ? `${locality}, ${city}, ${state}` : "Not set"}
              </Text>
            </View>
          )}

          {user?.role !== "ngo" && (
            isEditing ? (
              <KineticInput
                label="Gender"
                value={gender}
                onChangeText={setGender}
                style={styles.input}
              />
            ) : (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Gender</Text>
                <Text style={styles.value}>{gender || "Not set"}</Text>
              </View>
            )
          )}

          {user?.role === "elder" && (
            isEditing ? (
              <KineticInput
                label="Emergency Contact"
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                style={styles.input}
              />
            ) : (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Emergency Contact</Text>
                <Text style={styles.value}>{emergencyContact || "Not set"}</Text>
              </View>
            )
          )}
        </KineticCard>

        {/* Upload ID */}
        <KineticCard variant="filled" style={styles.card}>
          <Text style={styles.sectionTitle}>Government ID</Text>

          {isEditing && (
            <KineticButton 
              title={idImage || user?.verification?.idFrontUrl ? "Change ID" : "Upload ID"}
              onPress={pickImage}
              variant="tonal"
            />
          )}

          {idImage ? (
            <Image source={{ uri: idImage }} style={styles.imagePreview} />
          ) : user?.verification?.idFrontUrl ? (
            <Image source={{ uri: user.verification.idFrontUrl }} style={styles.imagePreview} />
          ) : (
            !isEditing && <Text style={[styles.value, { marginTop: 10 }]}>No ID uploaded</Text>
          )}
        </KineticCard>

        {/* Action Buttons */}
        {isEditing ? (
          <View style={styles.actionRow}>
            <KineticButton
              title="Cancel"
              variant="tonal"
              onPress={() => {
                setIsEditing(false);
                setPhone(user.phone || "");
                setAddress(user.address || "");
                setGender(user.gender || "");
                setEmergencyContact(user.emergencyContact || "");
                setProfilePhoto(user.profilePhoto || null);
                setIdImage(null);
              }}
              disabled={uploading}
              style={{ flex: 1 }}
            />

            <KineticButton
              title={uploading ? "Saving..." : "Save Profile"}
              variant="filled"
              onPress={saveProfile}
              disabled={uploading}
              style={{ flex: 2 }}
            />
          </View>
        ) : (
          <KineticButton
            title="Edit Profile"
            variant="filled"
            onPress={() => setIsEditing(true)}
            style={{ marginBottom: 20 }}
          />
        )}

        {/* Verification Status */}
        <KineticCard variant="outlined" style={styles.card}>
          <Text style={styles.sectionTitle}>Verification Status</Text>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>
              {status.replace("_", " ").toUpperCase()}
            </Text>
          </View>

          {status === "rejected" && (
            <Text style={styles.rejectionText}>
              {user?.verification?.rejectionReason}
            </Text>
          )}
        </KineticCard>
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
    padding: 24,
  },
  header: {
    ...kineticTypography.heading,
    color: kineticColors.foreground,
    marginBottom: 20,
  },
  card: {
    marginBottom: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: kineticColors.accent,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: kineticColors.backgroundVariant,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: kineticColors.backgroundVariant,
  },
  avatarPlaceholderText: {
    ...kineticTypography.heading,
    color: kineticColors.mutedForeground,
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: -5,
    backgroundColor: kineticColors.accentContainer,
    borderRadius: 999,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: kineticColors.background,
  },
  editAvatarIcon: {
    fontSize: 14,
  },
  sectionTitle: {
    ...kineticTypography.cardTitle,
    marginBottom: 14,
    color: kineticColors.foreground,
  },
  label: {
    color: kineticColors.mutedForeground,
    ...kineticTypography.label,
    marginTop: 8,
  },
  value: {
    color: kineticColors.foreground,
    ...kineticTypography.body,
    marginBottom: 10,
  },
  input: {
    marginBottom: 16,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 14,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    marginBottom: 10,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#FFF",
    ...kineticTypography.label,
  },
  rejectionText: {
    color: kineticColors.error,
    ...kineticTypography.body,
    marginTop: 10,
  },
  suggestions: {
    backgroundColor: kineticColors.backgroundContainerHigh,
    borderRadius: 12,
    marginTop: -8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: kineticColors.borderVariant,
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: kineticColors.borderVariant,
  },
  suggestionText: {
    color: kineticColors.foreground,
    ...kineticTypography.body,
  },
  shape1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: kineticColors.accentContainer,
    opacity: 0.6,
  },
  shape2: {
    position: 'absolute',
    bottom: -150,
    right: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: kineticColors.accentContainer,
    opacity: 0.4,
  },
});
