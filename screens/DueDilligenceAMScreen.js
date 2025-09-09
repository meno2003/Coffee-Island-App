// Permanent Dropbox credentials
const DROPBOX_REFRESH_TOKEN = "skIHw_jT9GEAAAAAAAAAAcyKd_JPUDB683YIHZTdREGLoqniKUwmFfajXpOfX1xM";
const DROPBOX_APP_KEY = "8edsxle2ywjgt29";
const DROPBOX_APP_SECRET = "237hl7oqm45t5wr";

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import ViewShot from "react-native-view-shot";
import { useRef } from "react";

// 📹 Fetch a new short-lived access token from Dropbox
const getDropboxAccessToken = async () => {
  try {
    const body = `grant_type=refresh_token&refresh_token=${DROPBOX_REFRESH_TOKEN}&client_id=${DROPBOX_APP_KEY}&client_secret=${DROPBOX_APP_SECRET}`;

    const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data = await response.json();

    if (data.access_token) {
      return data.access_token;
    } else {
      console.error("Failed to refresh token:", data);
      throw new Error("Could not refresh Dropbox token");
    }
  } catch (err) {
    console.error("Token refresh error:", err);
    throw err;
  }
};

export default function DueDiligenceAMScreen({ onBack }) {
  const [fridgeTemps, setFridgeTemps] = useState({
    fridge1: '',
    fridge2: '',
    fridge3: '',
    fridge4: '',
    fridge5: '',
    fridge6: '',
    fridge7: '',
    fridge8: '',
  });
  const [staffName, setStaffName] = useState('');
  const [notes, setNotes] = useState('');
  const viewShotRef = useRef();

  const handleTempChange = (fridgeId, value) => {
    // Allow negative numbers and decimals
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      setFridgeTemps(prev => ({
        ...prev,
        [fridgeId]: value
      }));
    }
  };

  const handleSave = () => {
    Alert.alert('Saved', 'Due diligence saved successfully.');
  };

  const handleSubmit = async () => {
    // Check if all temperatures are filled
    const emptyFields = Object.entries(fridgeTemps).filter(([key, value]) => value.trim() === '');
    if (emptyFields.length > 0) {
      Alert.alert("Error", "Please enter temperatures for all fridges.");
      return;
    }

    if (!staffName.trim()) {
      Alert.alert("Error", "Please enter staff name.");
      return;
    }

    try {
      // 1. Build HTML with all data
      const fridgeDataHtml = Object.entries(fridgeTemps).map(([fridgeId, temp], index) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Fridge ${index + 1}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${temp}°C</td>
        </tr>
      `).join("");

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #ea6313; }
              h2 { margin-top: 20px; }
              table { border-collapse: collapse; width: 100%; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f2f2f2; }
              .notes { margin-top: 20px; padding: 10px; border: 1px solid #ccc; }
            </style>
          </head>
          <body>
            <h1>Due Diligence AM</h1>
            <p><strong>Staff:</strong> ${staffName}</p>
            <p><strong>Location:</strong> Coffee Island Edgware Road, 254 Edgware Road, London W2 1DS</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-GB")}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}</p>

            <h2>Fridge Temperatures</h2>
            <table>
              <tr>
                <th>Fridge</th>
                <th>Temperature</th>
              </tr>
              ${fridgeDataHtml}
            </table>

            <h2>Notes</h2>
            <div class="notes">${notes || "No notes provided"}</div>
          </body>
        </html>
      `;

      // 2. Save HTML file locally
      const fileName = `DueDiligenceAM_${staffName}_${new Date().toISOString()}.html`;
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, html, { encoding: FileSystem.EncodingType.UTF8 });

      // 3. Upload to Dropbox
      const accessToken = await getDropboxAccessToken();
      const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Dropbox-API-Arg": JSON.stringify({
            path: `/DueDiligenceAM/${fileName}`,
            mode: "add",
            autorename: true,
            mute: false,
          }),
          "Content-Type": "application/octet-stream",
        },
        body: html,
      });

      if (response.ok) {
        Alert.alert("✅ Success", "Due diligence saved and uploaded!");
        // Reset form
        setFridgeTemps({
          fridge1: '', fridge2: '', fridge3: '', fridge4: '',
          fridge5: '', fridge6: '', fridge7: '', fridge8: ''
        });
        setStaffName('');
        setNotes('');
      } else {
        const err = await response.text();
        Alert.alert("❌ Upload Failed", err);
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save due diligence.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 0.9, result: "tmpfile" }}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>London - Edgware Road</Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Due Diligence AM</Text>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fridge Temperatures *</Text>
              <Text style={styles.instructions}>Please enter the temperature for each fridge (e.g., 4, -20)</Text>
              
              {[1, 2, 3, 4, 5, 6, 7, 8].map((fridgeNum) => (
                <View key={fridgeNum} style={styles.fridgeItem}>
                  <Text style={styles.fridgeLabel}>Fridge {fridgeNum}:</Text>
                  <View style={styles.tempInputContainer}>
                    <TextInput
                      style={styles.tempInput}
                      value={fridgeTemps[`fridge${fridgeNum}`]}
                      onChangeText={(value) => handleTempChange(`fridge${fridgeNum}`, value)}
                      placeholder="0"
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                    <Text style={styles.tempUnit}>°C</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>Notes</Text>
              <Text style={styles.notesLabel}>Additional notes (optional):</Text>
              <TextInput
                style={styles.notesInput}
                multiline
                numberOfLines={4}
                placeholder="Any issues or observations..."
                placeholderTextColor="#999"
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <View style={styles.formFields}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Name of Staff *</Text>
                <TextInput
                  style={styles.textInput}
                  value={staffName}
                  onChangeText={setStaffName}
                  placeholder=""
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Location *</Text>
                <TextInput
                  style={styles.textInput}
                  value="Coffee Island Edgware Road, 254 Edgware Road, London W2 1DS"
                  editable={false}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Date *</Text>
                <TextInput
                  style={styles.textInput}
                  value={new Date().toLocaleDateString('en-GB')}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </ViewShot>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#ea6313',
  },
  backButton: {
    width: 30,
  },
  backButtonText: {
    color: '#ffffffff',
    fontSize: 28,
    fontWeight: '300',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 2,
  },
  editButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  editButtonText: {
    color: '#ffffffff',
    fontSize: 14,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  fridgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  fridgeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  tempInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
  },
  tempInput: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    minWidth: 40,
  },
  tempUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  notesSection: {
    marginTop: 30,
    backgroundColor: '#ea6313',
    padding: 20,
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  notesLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  formFields: {
    marginTop: 25,
    marginBottom: 30,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    flex: 0.45,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#E5E5E5',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    flex: 0.45,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },});