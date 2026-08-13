import { kineticColors, kineticTypography } from '../theme/kineticTokens';
import { useContext, useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { AuthContext } from "../context/AuthContext";
import api from "../api";



const SUGGESTIONS = {
  cities: ["Bhopal", "Indore", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Lucknow", "Nagpur", "Noida", "Gurgaon", "Chandigarh"],
  states: ["Madhya Pradesh", "Maharashtra", "Delhi", "Karnataka", "Telangana", "Gujarat", "Tamil Nadu", "West Bengal", "Rajasthan", "Uttar Pradesh", "Haryana", "Punjab"]
};

export default function EventsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // For NGO Event Creation
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Location components
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  
  // Autocomplete states
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [stateSuggestions, setStateSuggestions] = useState([]);
  
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error("EVENTS FETCH ERROR:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreateEvent = async () => {
    const fullLocation = `${locality}, ${city}, ${state}`;
    if (!title || !description || !date || !locality || !city || !state) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    try {
      setCreating(true);
      await api.post("/events", { 
        title, 
        description, 
        date: date.toISOString(), 
        location: fullLocation 
      });
      Alert.alert("Success", "Event created successfully!");
      setTitle(""); 
      setDescription(""); 
      setDate(new Date()); 
      setLocality(""); setCity(""); setState("");
      fetchEvents();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  const handleCityChange = (val) => {
    setCity(val);
    if (val.length > 0) {
      const filtered = SUGGESTIONS.cities.filter(c => c.toLowerCase().includes(val.toLowerCase()));
      setCitySuggestions(filtered);
    } else {
      setCitySuggestions([]);
    }
  };

  const handleStateChange = (val) => {
    setState(val);
    if (val.length > 0) {
      const filtered = SUGGESTIONS.states.filter(s => s.toLowerCase().includes(val.toLowerCase()));
      setStateSuggestions(filtered);
    } else {
      setStateSuggestions([]);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };



  const handleJoinEvent = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/join`);
      Alert.alert("Success", "Joined event successfully!");
      fetchEvents();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to join event");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={kineticColors.accent} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Community Events</Text>
        <Text style={styles.subheading}>Explore and participate in ongoing initiatives</Text>

        {user.role === "ngo" && (
          <View style={styles.createCard}>
            <Text style={styles.createTitle}>Post a New Event</Text>
            <TextInput style={styles.input} placeholder="Event Title" placeholderTextColor={kineticColors.mutedForeground} value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Description" placeholderTextColor={kineticColors.mutedForeground} value={description} onChangeText={setDescription} multiline />
            
            {Platform.OS === 'web' ? (
              <TextInput
                style={styles.input}
                type="date"
                value={date.toISOString().split('T')[0]}
                onChangeText={(val) => setDate(new Date(val))}
              />
            ) : (
              <>
                <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                  <Text style={{ color: date ? kineticColors.foreground : kineticColors.mutedForeground }}>
                    📅 {date ? date.toDateString() : "Select Date"}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                    minimumDate={new Date()}
                  />
                )}
              </>
            )}

            <View style={styles.locationGroup}>
              <TextInput 
                style={styles.input} 
                placeholder="Locality / Area" 
                placeholderTextColor={kineticColors.mutedForeground} 
                value={locality} 
                onChangeText={setLocality} 
              />

              <View style={{zIndex: 10}}>
                <TextInput 
                  style={styles.input} 
                  placeholder="City / District" 
                  placeholderTextColor={kineticColors.mutedForeground} 
                  value={city} 
                  onChangeText={handleCityChange} 
                />
                {citySuggestions.length > 0 && (
                  <View style={styles.suggestions}>
                    {citySuggestions.map((item, i) => (
                      <TouchableOpacity key={i} onPress={() => { setCity(item); setCitySuggestions([]); }} style={styles.suggestionItem}>
                        <Text style={styles.suggestionText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={{zIndex: 5}}>
                <TextInput 
                  style={styles.input} 
                  placeholder="State" 
                  placeholderTextColor={kineticColors.mutedForeground} 
                  value={state} 
                  onChangeText={handleStateChange} 
                />
                {stateSuggestions.length > 0 && (
                  <View style={styles.suggestions}>
                    {stateSuggestions.map((item, i) => (
                      <TouchableOpacity key={i} onPress={() => { setState(item); setStateSuggestions([]); }} style={styles.suggestionItem}>
                        <Text style={styles.suggestionText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
            
            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateEvent} disabled={creating}>
              <Text style={styles.submitText}>{creating ? "Creating..." : "Create Event"}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.list}>
          {events.length > 0 ? (
            events.map((evt) => {
              const isVolunteerJoined = evt.volunteers?.includes(user._id);

              return (
                <View key={evt._id} style={styles.card}>
                  <View style={styles.info}>
                    <Text style={styles.title}>{evt.title}</Text>
                    <Text style={styles.desc}>{evt.description}</Text>
                    <Text style={styles.meta}>📅 {new Date(evt.date).toDateString()} | 📍 {evt.location}</Text>
                    <Text style={styles.ngoName}>NGO: {evt.ngo?.name}</Text>
                  </View>
                  {user.role === "volunteer" && (
                    <TouchableOpacity 
                      style={[styles.joinBtn, isVolunteerJoined && styles.joinedBtn]} 
                      onPress={() => handleJoinEvent(evt._id)}
                      disabled={isVolunteerJoined}
                    >
                      <Text style={styles.joinText}>{isVolunteerJoined ? "Joined" : "Join to Volunteer"}</Text>
                    </TouchableOpacity>
                  )}
                  {user.role === "elder" && (
                    <View style={styles.elderBadge}>
                      <Text style={styles.elderBadgeText}>You're Invited!</Text>
                    </View>
                  )}
                </View>
              )
            })
          ) : (
            <Text style={{ color: kineticColors.mutedForeground, textAlign: "center", marginTop: 20 }}>No events found.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: kineticColors.background },
  content: { padding: 20 },
  heading: { fontSize: 28, fontWeight: "800", color: kineticColors.foreground, marginBottom: 5 },
  subheading: { fontSize: 15, color: kineticColors.mutedForeground, marginBottom: 20 },
  createCard: { backgroundColor: kineticColors.background, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: kineticColors.border, marginBottom: 20 },
  createTitle: { fontSize: 18, fontWeight: "bold", color: kineticColors.foreground, marginBottom: 15 },
  input: { backgroundColor: kineticColors.background, color: kineticColors.foreground, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: kineticColors.border, marginBottom: 10, justifyContent: 'center' },
  locationGroup: { gap: 2, marginBottom: 10 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  locationBtnSmall: { backgroundColor: kineticColors.accent, width: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  suggestions: { 
    position: 'absolute', top: 52, left: 0, right: 0, 
    backgroundColor: kineticColors.background, borderRadius: 8, borderWidth: 1, borderColor: kineticColors.border,
    maxHeight: 150, overflow: 'hidden', shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 5, elevation: 5
  },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: kineticColors.border },
  suggestionText: { color: kineticColors.foreground },
  submitBtn: { backgroundColor: kineticColors.foreground, padding: 14, borderRadius: 8, alignItems: "center", marginTop: 5 },
  submitText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  list: { gap: 15 },
  card: { backgroundColor: kineticColors.background, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: kineticColors.border },
  info: { gap: 6, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "bold", color: kineticColors.foreground },
  desc: { fontSize: 14, color: kineticColors.mutedForeground },
  meta: { fontSize: 13, color: kineticColors.foreground, marginTop: 4 },
  ngoName: { fontSize: 13, color: "#94A3B8", fontStyle: "italic" },
  joinBtn: { backgroundColor: kineticColors.accent, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  joinedBtn: { backgroundColor: kineticColors.foreground, opacity: 0.8 },
  joinText: { color: "#FFF", fontWeight: "bold" },
  elderBadge: { backgroundColor: `${kineticColors.accent}20`, padding: 8, borderRadius: 6, alignSelf: "flex-start" },
  elderBadgeText: { color: kineticColors.accent, fontWeight: "bold", fontSize: 12 }
});
