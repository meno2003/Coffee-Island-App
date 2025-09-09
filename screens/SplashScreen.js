import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.coffeeText}>COFFEE</Text>
        <Text style={styles.islandText}>ISLAND</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ea6313',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  coffeeText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 4,
    marginBottom: -12,
  },
  islandText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 4,
  },
});