import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";

export default function DashboardScreen({ navigateToScreen }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DAILY CHECKS</Text>
      </View>

      <View style={styles.content}>
      /* morning seciton */
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morning</Text>

          <TouchableOpacity
            style={styles.checklistButton}
            onPress={() => navigateToScreen("opening-checklist")}
          >
            /* Opening section checklist
            <Text style={styles.buttonText}>Opening Checklist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checklistButton}
            onPress={() => navigateToScreen("due-diligence-am")}
          >
            <Text style={styles.buttonText}>Due Diligence AM</Text>
          </TouchableOpacity>
        </View>
        /* stock section */
        
     
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>To allocate throughout the day</Text>

          <TouchableOpacity
            style={styles.checklistButton}
            onPress={() => navigateToScreen("stock-check")}
          >
            <Text style={styles.buttonText}>Stock Check</Text>
          </TouchableOpacity>
        </View>

      
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evening</Text>

          <TouchableOpacity
            style={styles.checklistButton}
            onPress={() => navigateToScreen("closing-checklist")}
          >
            <Text style={styles.buttonText}>Closing Checklist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checklistButton}
            onPress={() => navigateToScreen("due-diligence-pm")}
          >
            <Text style={styles.buttonText}>Due Diligence PM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffffff" },
  header: { backgroundColor: "#ea6313", padding: 30, paddingTop: 20, alignItems: "center" },
  headerTitle: { fontSize: 32, fontWeight: "bold", color: "#000000ff", marginBottom: 8 },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 22, fontWeight: "600", color: "#000000ff", marginBottom: 15 },
  checklistButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#000000ff",
    borderRadius: 25,
    padding: 18,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: { fontSize: 18, fontWeight: "500", color: "#000000ff" },
});
