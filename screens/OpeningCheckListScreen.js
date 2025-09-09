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
import { captureScreen } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import ViewShot from "react-native-view-shot";
import { useRef } from "react";

// 🔹 Fetch a new short-lived access token from Dropbox
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



export default function OpeningChecklistScreen({ onBack }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [notes, setNotes] = useState('');
  const [staffName, setStaffName] = useState('');
  const viewShotRef = useRef();


  const checklistItems = [
    {
      id: 'outside_pavement',
      text: 'Thoroughly clean outdoor pavement, including communal spaces, and ensure the cleanliness of entryway mats. Wipe down windows, benches, and planters.',
      category: 'Outside'
    },
    {
      id: 'outdoor_furniture',
      text: 'Set up tables and chairs outdoors; ensure they are cleaned. Check for any damage.',
      category: 'Outside'
    },
    {
      id: 'shop_ready',
      text: 'Get shop ready for service. Ensure tables are all set and are all disinfected.',
      category: 'Inside'
    },
    {
      id: 'lighting_music',
      text: 'Turn on all lighting fixtures, music and AC/heating as appropriate.',
      category: 'Inside'
    },
    {
      id: 'cleanliness_premises',
      text: 'Ensure cleanliness throughout the premises - inspect work carried out by the cleaner if applicable, and address any issues immediately. Check toilets.',
      category: 'Inside'
    },
    {
      id: 'soap_sanitiser',
      text: 'Ensure soap and hand sanitiser is topped up throughout the premises (including behind the bar, toilets and at the host\'s stand).',
      category: 'Inside'
    },
    {
      id: 'staff_health',
      text: 'Ensure all staff is in good health, is wearing clean and well-presented uniform, hair is tied, and jewellery is off.',
      category: 'Inside'
    },
    {
      id: 'equipment_damage',
      text: 'Check for damage to any furniture, equipment, fixtures and fittings.',
      category: 'Inside'
    },
    {
      id: 'basement_utility',
      text: 'Maintain tidiness and cleanliness in the basement utility area.',
      category: 'Inside'
    },
    {
      id: 'till_float',
      text: 'Check till float.',
      category: 'Inside'
    }
  ];

  const handleCheckToggle = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleSave = () => {
    Alert.alert('Saved', 'Checklist saved successfully.');
  };

 const handleSubmit = async () => {
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalItems = checklistItems.length;

  if (checkedCount < totalItems) {
    Alert.alert("Error", "Please complete all items before submitting.");
    return;
  }

  if (!staffName.trim()) {
    Alert.alert("Error", "Please enter staff name.");
    return;
  }

  try {
    // 1. Build HTML with all data
    const checkedListHtml = checklistItems.map(item => `
      <li style="margin-bottom: 6px;">
        ${checkedItems[item.id] ? "✅" : "❌"} ${item.text}
      </li>
    `).join("");

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #ea6313; }
            h2 { margin-top: 20px; }
            ul { padding-left: 20px; }
            .notes { margin-top: 20px; padding: 10px; border: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <h1>Opening Checklist</h1>
          <p><strong>Staff:</strong> ${staffName}</p>
          <p><strong>Location:</strong> Coffee Island Edgware Road, 254 Edgware Road, London W2 1DS</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-GB")}</p>

          <h2>Checklist</h2>
          <ul>${checkedListHtml}</ul>

          <h2>Notes</h2>
          <div class="notes">${notes || "No notes provided"}</div>
        </body>
      </html>
    `;

    // 2. Save HTML file locally
    const fileName = `OpeningChecklist_${staffName}_${new Date().toISOString()}.html`;
    const fileUri = FileSystem.documentDirectory + fileName;
    await FileSystem.writeAsStringAsync(fileUri, html, { encoding: FileSystem.EncodingType.UTF8 });

    // 3. Upload to Dropbox
    const accessToken = await getDropboxAccessToken();
    const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Dropbox-API-Arg": JSON.stringify({
          path: `/OpeningChecklists/${fileName}`,
          mode: "add",
          autorename: true,
          mute: false,
        }),
        "Content-Type": "application/octet-stream",
      },
      body: html,
    });

    if (response.ok) {
      Alert.alert("✅ Success", "Checklist saved and uploaded! Now opening file...");
      // 4. Open file in a browser view
      Sharing.shareAsync(fileUri);
    } else {
      const err = await response.text();
      Alert.alert("❌ Upload Failed", err);
    }

  } catch (error) {
    console.error(error);
  
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
          <Text style={styles.formTitle}>Opening Checklist</Text>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Outside *</Text>
            {checklistItems.filter(item => item.category === 'Outside').map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.checklistItem}
                onPress={() => handleCheckToggle(item.id)}
              >
                <View style={[styles.checkbox, checkedItems[item.id] && styles.checkedBox]}>
                  {checkedItems[item.id] && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.itemText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inside *</Text>
            {checklistItems.filter(item => item.category === 'Inside').map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.checklistItem}
                onPress={() => handleCheckToggle(item.id)}
              >
                <View style={[styles.checkbox, checkedItems[item.id] && styles.checkedBox]}>
                  {checkedItems[item.id] && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.itemText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesLabel}>Notes:</Text>
            <TextInput
              style={styles.notesInput}
              multiline
              numberOfLines={4}
              placeholder="Type here..."
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
            />
            <Text style={styles.disclaimer}>
              These are not monitored on a regular basis so please flag any immediate concerns with your manager!
            </Text>
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
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 3,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    lineHeight: 20,
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
    marginBottom: 10,
  },
  disclaimer: {
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 16,
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
  },
});
