import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Preset items
const sandwiches = [
  "Tuna Panini",
  "Chicken & Pesto Panini",
  "Chicken Chorizo Panini",
  "Tomato & Mozzarella Panini",
  "Sourdough Ham & Cheese Toastie",
  "Mozzarella & Cheese Toastie",
  "Ham & Mozarella Toastie",
  "Mushroom Toastie",
  "Luna Wrap",
];

const greekPies = [
  "Spinach Pie",
  "Feta Cheese Pie",
  "Ham & Cheese Pie",
  "Philadelphia Cheese Roll",
];

const desserts = [
  "Rocky Road",
  "Salted Caramel Slice",
  "White Chocolate & Cranberry Slice",
  "Lemon & Blueberry Blondie",
  "Salted Caramel Mini-Cakes",
  "Toffee Apple & Cinnamon Cake",
  "Millionaire Slice",
  "Raspberry Millionaire Slice",
  "Lemon Slice",
  "Tiramisu Slice",
  "Chocolate Brownie",
];

const STORAGE_KEY = "stock_batches";

export default function StockCheckScreen({ onBack }) {
  const [stock, setStock] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantityInput, setQuantityInput] = useState("");

  // Load saved stock
  useEffect(() => {
    const loadStock = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setStock(JSON.parse(saved));
      } catch (err) {
        console.error("Error loading stock", err);
      }
    };
    loadStock();
  }, []);

  // Save stock whenever it changes
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stock));
  }, [stock]);

  // Add new batch
  const handleAddStock = () => {
    if (!quantityInput || isNaN(quantityInput)) {
      Alert.alert("Invalid Input", "Please enter a valid number.");
      return;
    }
    const qty = parseInt(quantityInput);
    const now = new Date();
    let expiryDays = 3; 
    if (desserts.includes(selectedItem)) expiryDays = 7;

    const expiry = new Date(now);
    expiry.setDate(now.getDate() + expiryDays);

    const newBatch = {
      qty,
      added: now.toISOString(),
      expiry: expiry.toISOString(),
    };

    setStock((prev) => {
      const prevBatches = prev[selectedItem]?.batches || [];
      return {
        ...prev,
        [selectedItem]: {
          batches: [...prevBatches, newBatch],
        },
      };
    });

    setModalVisible(false);
    setQuantityInput("");
  };

  // Delete batch
  const handleDeleteBatch = (item, idx) => {
    setStock((prev) => {
      const prevBatches = prev[item]?.batches || [];
      const newBatches = prevBatches.filter((_, i) => i !== idx);

      if (newBatches.length === 0) {
        const updated = { ...prev };
        delete updated[item];
        return updated;
      }

      return {
        ...prev,
        [item]: { batches: newBatches },
      };
    });
  };

  /* Get only fresh quantities */
  const getTotalQuantity = (batches) => {
    const now = new Date();
    return batches
      .filter((b) => new Date(b.expiry) > now)
      .reduce((sum, b) => sum + b.qty, 0);
  };

  /* Render each item row */
  const renderItem = ({ item }) => {
    const batches = stock[item]?.batches || [];
    const now = new Date();

    return (
      <View style={styles.itemRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item}</Text>
          <Text style={styles.itemDetails}>
            {batches.length === 0
              ? "No stock"
              : `Total Qty (fresh): ${getTotalQuantity(batches)}`}
          </Text>

          {batches.map((b, idx) => {
            const isExpired = new Date(b.expiry) <= now;
            return (
              <View key={idx} style={styles.batchRow}>
                <Text
                  style={[
                    styles.batchText,
                    isExpired && { color: "red", fontWeight: "700" },
                  ]}
                >
                  • {b.qty} added {new Date(b.added).toLocaleString("en-GB")}
                  {"  "}expires {new Date(b.expiry).toLocaleDateString("en-GB")}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                   console.log("❌ pressed for", item, idx); 
                    handleDeleteBatch(item, idx);
                      }}
                      style={styles.deleteButton}
>
                  
                  <Text style={styles.deleteButtonText}>❌</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedItem(item);
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /* expired logs */
  const expiredBatches = [];
  Object.keys(stock).forEach((item) => {
    (stock[item]?.batches || []).forEach((b) => {
      if (new Date(b.expiry) <= new Date()) {
        expiredBatches.push({ item, ...b });
      }
    });
  });

  return (
    <SafeAreaView style={styles.container}>
      /* Header */
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stock Check</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView>
        <Text style={styles.sectionTitle}>Sandwiches</Text>
        {sandwiches.map((s) => (
          <View key={s}>{renderItem({ item: s })}</View>
        ))}

        <Text style={styles.sectionTitle}>Greek Pies</Text>
        {greekPies.map((p) => (
          <View key={p}>{renderItem({ item: p })}</View>
        ))}

        <Text style={styles.sectionTitle}>Desserts</Text>
        {desserts.map((d) => (
          <View key={d}>{renderItem({ item: d })}</View>
        ))}

        /* Expired Log Section */
        <Text style={styles.sectionTitle}>⚠️ Expired Stock Log</Text>
        {expiredBatches.length === 0 ? (
          <Text style={{ marginLeft: 20, color: "#555" }}>
            No expired stock.
          </Text>
        ) : (
          expiredBatches.map((e, idx) => (
            <Text key={idx} style={{ marginLeft: 20, color: "red" }}>
              {e.item}: {e.qty} (added{" "}
              {new Date(e.added).toLocaleDateString("en-GB")}) expired on{" "}
              {new Date(e.expiry).toLocaleDateString("en-GB")}
            </Text>
          ))
        )}
      </ScrollView>

      /* Modal */
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Stock: {selectedItem}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              keyboardType="numeric"
              value={quantityInput}
              onChangeText={setQuantityInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addConfirmButton]}
                onPress={handleAddStock}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#ea6313",
  },
  backButton: { width: 30 },
  backButtonText: { color: "#fff", fontSize: 28, fontWeight: "300" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "600" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 20,
    color: "#000",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemName: { fontSize: 16, fontWeight: "500", color: "#000" },
  itemDetails: { fontSize: 14, color: "#555" },
  batchText: { fontSize: 12, color: "#333", marginLeft: 10 },
  addButton: {
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  addButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: {
    flex: 0.45,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#aaa" },
  addConfirmButton: { backgroundColor: "#ea6313" },
  modalButtonText: { color: "#fff", fontWeight: "600" },

  batchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 10,
    marginTop: 2,
  },
  deleteButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteButtonText: {
    fontSize: 14,
    color: "red",
  },
});
