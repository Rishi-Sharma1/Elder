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
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import ElderSidebar, { ElderMobileBottomBar } from "../components/ElderSidebar";
import useResponsive from "../hooks/useResponsive";


export default function DeliveryOrderScreen({ navigation }) {
  const responsive = useResponsive();
  const { user } = React.useContext(AuthContext);

  const [category, setCategory] = useState("medicine");
  const [items, setItems] = useState([{ name: "", quantity: 1, notes: "", urgent: false }]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [useProfileAddress, setUseProfileAddress] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = review

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, notes: "", urgent: false }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const toggleProfileAddress = (val) => {
    setUseProfileAddress(val);
    if (val && user?.address) {
      setDeliveryAddress(user.address);
    } else if (!val) {
      setDeliveryAddress("");
    }
  };

  const validate = () => {
    if (!items.some((i) => i.name.trim())) {
      const msg = "Please add at least one item";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Error", msg);
      return false;
    }
    if (!deliveryAddress.trim()) {
      const msg = "Please enter a delivery address";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Error", msg);
      return false;
    }
    return true;
  };

  const handleReview = () => {
    if (validate()) setStep(2);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const cleanItems = items
        .filter((i) => i.name.trim())
        .map((i) => ({
          name: i.name.trim(),
          quantity: parseInt(i.quantity) || 1,
          notes: i.notes.trim(),
          urgent: i.urgent,
        }));

      await api.post("/delivery/order", {
        category,
        items: cleanItems,
        deliveryAddress: deliveryAddress.trim(),
        specialInstructions: specialInstructions.trim(),
      });

      const msg = "Delivery order placed successfully!";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Success", msg);
      navigation.goBack();
    } catch (err) {
      console.error("CREATE DELIVERY ERROR:", err);
      const msg = "Failed to place delivery order";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <>
      {/* Category Selector */}
      <Text style={styles.sectionLabel}>CATEGORY</Text>
      <View style={styles.categoryRow}>
        <TouchableOpacity
          style={[
            styles.categoryBtn,
            category === "medicine" && styles.categoryBtnActiveMed,
          ]}
          onPress={() => setCategory("medicine")}
        >
          <Text style={styles.categoryIcon}>💊</Text>
          <Text
            style={[
              styles.categoryText,
              category === "medicine" && styles.categoryTextActive,
            ]}
          >
            Medicine
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryBtn,
            category === "grocery" && styles.categoryBtnActiveGro,
          ]}
          onPress={() => setCategory("grocery")}
        >
          <Text style={styles.categoryIcon}>🛒</Text>
          <Text
            style={[
              styles.categoryText,
              category === "grocery" && styles.categoryTextActive,
            ]}
          >
            Grocery
          </Text>
        </TouchableOpacity>
      </View>

      {/* Items */}
      <Text style={styles.sectionLabel}>
        {category === "medicine" ? "MEDICATIONS" : "GROCERY ITEMS"}
      </Text>

      {items.map((item, index) => (
        <View
          key={index}
          style={[styles.itemCard, item.urgent && styles.itemCardUrgent]}
        >
          <View style={styles.itemHeader}>
            <Text style={styles.itemNumber}>#{index + 1}</Text>
            {items.length > 1 && (
              <TouchableOpacity onPress={() => removeItem(index)}>
                <Text style={styles.removeBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            placeholder={category === "medicine" ? "Medicine name..." : "Item name..."}
            placeholderTextColor={kineticColors.mutedForeground}
            value={item.name}
            onChangeText={(v) => updateItem(index, "name", v)}
            style={styles.input}
          />

          <View style={styles.itemRow}>
            <View style={styles.qtyContainer}>
              <Text style={styles.inputLabel}>Qty</Text>
              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    updateItem(index, "quantity", Math.max(1, item.quantity - 1))
                  }
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateItem(index, "quantity", item.quantity + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.urgentContainer}>
              <Text style={styles.inputLabel}>Urgent</Text>
              <Switch
                value={item.urgent}
                onValueChange={(v) => updateItem(index, "urgent", v)}
                trackColor={{ false: kineticColors.border, true: kineticColors.error + "80" }}
                thumbColor={item.urgent ? kineticColors.error : kineticColors.mutedForeground}
              />
            </View>
          </View>

          <TextInput
            placeholder="Notes (optional)..."
            placeholderTextColor={kineticColors.mutedForeground}
            value={item.notes}
            onChangeText={(v) => updateItem(index, "notes", v)}
            style={[styles.input, { minHeight: 44 }]}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
        <Text style={styles.addItemText}>+ Add Another Item</Text>
      </TouchableOpacity>

      {/* Delivery Address */}
      <View style={styles.addressHeader}>
        <Text style={styles.sectionLabel}>DELIVERY ADDRESS</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Use Profile Address</Text>
          <Switch
            value={useProfileAddress}
            onValueChange={toggleProfileAddress}
            trackColor={{ false: kineticColors.border, true: kineticColors.accent + "80" }}
            thumbColor={useProfileAddress ? kineticColors.accent : kineticColors.mutedForeground}
          />
        </View>
      </View>
      <TextInput
        placeholder="Enter your delivery address..."
        placeholderTextColor={kineticColors.mutedForeground}
        value={deliveryAddress}
        onChangeText={(v) => {
          setDeliveryAddress(v);
          if (v !== user?.address) setUseProfileAddress(false);
        }}
        style={[styles.input, styles.addressInput]}
        multiline
      />

      {/* Special Instructions */}
      <Text style={styles.sectionLabel}>SPECIAL INSTRUCTIONS</Text>
      <TextInput
        placeholder="e.g., Ring bell twice, leave at door..."
        placeholderTextColor={kineticColors.mutedForeground}
        value={specialInstructions}
        onChangeText={setSpecialInstructions}
        style={[styles.input, { minHeight: 80 }]}
        multiline
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={handleReview}>
        <Text style={styles.primaryBtnText}>Review Order →</Text>
      </TouchableOpacity>
    </>
  );

  const renderReview = () => {
    const validItems = items.filter((i) => i.name.trim());
    return (
      <>
        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewIcon}>
              {category === "medicine" ? "💊" : "🛒"}
            </Text>
            <Text style={styles.reviewTitle}>
              {category === "medicine" ? "Medicine" : "Grocery"} Delivery
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.reviewLabel}>ITEMS ({validItems.length})</Text>
          {validItems.map((item, i) => (
            <View key={i} style={styles.reviewItem}>
              <View style={styles.reviewItemLeft}>
                <Text style={styles.reviewItemName}>{item.name}</Text>
                {item.notes ? (
                  <Text style={styles.reviewItemNote}>{item.notes}</Text>
                ) : null}
              </View>
              <View style={styles.reviewItemRight}>
                <Text style={styles.reviewItemQty}>×{item.quantity}</Text>
                {item.urgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>URGENT</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          <View style={styles.divider} />

          <Text style={styles.reviewLabel}>DELIVER TO</Text>
          <Text style={styles.reviewValue}>{deliveryAddress}</Text>

          {specialInstructions ? (
            <>
              <Text style={[styles.reviewLabel, { marginTop: 16 }]}>
                SPECIAL INSTRUCTIONS
              </Text>
              <View style={styles.instructionBox}>
                <Text style={styles.instructionIcon}>📢</Text>
                <Text style={styles.reviewValue}>{specialInstructions}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.reviewActions}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setStep(1)}
          >
            <Text style={styles.backBtnText}>← Edit Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, { flex: 1 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryBtnText}>Place Order 🚀</Text>
            )}
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.layout,
          { flexDirection: responsive.showSidebar ? "row" : "column" },
        ]}
      >
        <ElderSidebar navigation={navigation} activeKey="DeliveryOrderScreen" />

        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentInner,
            { padding: responsive.contentPadding },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.tagline}>
                {category === "medicine" ? "💊 MEDICINE" : "🛒 GROCERY"} DELIVERY
              </Text>
              <Text style={styles.heading}>
                {step === 1 ? "New Delivery Order" : "Review Your Order"}
              </Text>
            </View>
            <View style={styles.stepIndicator}>
              <View
                style={[styles.stepDot, step >= 1 && styles.stepDotActive]}
              />
              <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
              <View
                style={[styles.stepDot, step >= 2 && styles.stepDotActive]}
              />
            </View>
          </View>

          {step === 1 ? renderForm() : renderReview()}

          <View style={{ height: responsive.showBottomBar ? 80 : 40 }} />
        </ScrollView>

        <ElderMobileBottomBar
          navigation={navigation}
          activeKey="DeliveryOrderScreen"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: kineticColors.background },
  layout: { flex: 1 },
  content: { flex: 1 },
  contentInner: {},

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  tagline: {
    ...kineticTypography.label,
    color: kineticColors.accent,
    marginBottom: 6,
  },
  heading: {
    ...kineticTypography.subheading,
    color: kineticColors.foreground,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: kineticColors.border,
  },
  stepDotActive: { backgroundColor: kineticColors.accent },
  stepLine: { width: 32, height: 2, backgroundColor: kineticColors.border },
  stepLineActive: { backgroundColor: kineticColors.accent },

  sectionLabel: {
    ...kineticTypography.body,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: kineticColors.mutedForeground,
    marginBottom: 10,
    marginTop: 20,
    flex: 1,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 4,
  },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  toggleLabel: { fontSize: 13, color: kineticColors.mutedForeground },

  // Category
  categoryRow: { flexDirection: "row", gap: 12 },
  categoryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderWidth: 2,
    borderColor: kineticColors.border,
    backgroundColor: kineticColors.background,
    gap: 10,
  },
  categoryBtnActiveMed: {
    borderColor: kineticColors.accent,
    backgroundColor: kineticColors.accent + "15",
  },
  categoryBtnActiveGro: {
    borderColor: kineticColors.foreground,
    backgroundColor: kineticColors.foreground + "15",
  },
  categoryIcon: { fontSize: 24 },
  categoryText: { ...kineticTypography.body, fontWeight: "700", color: kineticColors.mutedForeground },
  categoryTextActive: { color: kineticColors.foreground },

  // Items
  itemCard: {
    backgroundColor: kineticColors.background,
    borderWidth: 2,
    borderColor: kineticColors.border,
    padding: 24,
    marginBottom: 16,
  },
  itemCardUrgent: {
    borderColor: kineticColors.error,
    backgroundColor: kineticColors.background,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemNumber: {
    ...kineticTypography.label,
    color: kineticColors.accent,
  },
  removeBtn: { fontSize: 16, color: kineticColors.error, fontWeight: "700" },

  input: {
    backgroundColor: kineticColors.background,
    borderWidth: 2,
    borderColor: kineticColors.border,
    padding: 18,
    ...kineticTypography.body,
    color: kineticColors.foreground,
    marginBottom: 16,
  },
  addressInput: { minHeight: 60 },

  itemRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  qtyContainer: { flex: 1 },
  inputLabel: {
    ...kineticTypography.label,
    color: kineticColors.mutedForeground,
    marginBottom: 6,
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    backgroundColor: kineticColors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnText: { ...kineticTypography.body, color: kineticColors.foreground },
  qtyValue: { ...kineticTypography.body, color: kineticColors.foreground, minWidth: 30, textAlign: "center" },
  urgentContainer: { alignItems: "center" },

  addItemBtn: {
    padding: 18,
    borderWidth: 2,
    borderColor: kineticColors.accent,
    borderStyle: "dashed",
    alignItems: "center",
    marginBottom: 16,
  },
  addItemText: { color: kineticColors.accent, ...kineticTypography.body },

  // Buttons
  primaryBtn: {
    backgroundColor: kineticColors.accent,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: kineticColors.foreground,
    alignItems: "center",
    marginTop: 30,
  },
  primaryBtnText: { color: kineticColors.accentForeground, ...kineticTypography.cardTitle },

  // Review
  reviewCard: {
    backgroundColor: kineticColors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: kineticColors.border,
    padding: 24,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reviewIcon: { fontSize: 28 },
  reviewTitle: { ...kineticTypography.subheading, color: kineticColors.foreground },
  divider: {
    height: 2,
    backgroundColor: kineticColors.border,
    marginVertical: 24,
  },
  reviewLabel: {
    ...kineticTypography.label,
    color: kineticColors.mutedForeground,
    marginBottom: 10,
  },
  reviewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: kineticColors.border + "40",
  },
  reviewItemLeft: { flex: 1 },
  reviewItemName: { ...kineticTypography.body, color: kineticColors.foreground },
  reviewItemNote: { ...kineticTypography.label, color: kineticColors.mutedForeground, marginTop: 4 },
  reviewItemRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewItemQty: { ...kineticTypography.body, color: kineticColors.mutedForeground },
  urgentBadge: {
    backgroundColor: kineticColors.error + "20",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: kineticColors.error,
  },
  urgentBadgeText: { fontSize: 10, fontWeight: "800", color: kineticColors.error },
  reviewValue: { ...kineticTypography.body, color: kineticColors.foreground },
  instructionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: kineticColors.accent + "10",
    padding: 18,
    borderWidth: 2,
    borderColor: kineticColors.border,
  },
  instructionIcon: { fontSize: 24 },

  reviewActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  backBtn: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: kineticColors.border,
    backgroundColor: kineticColors.background,
  },
  backBtnText: { color: kineticColors.mutedForeground, ...kineticTypography.cardTitle },
});
