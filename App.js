// App.js
import React, { useState, useEffect, useRef } from "react";
import { StatusBar, Animated, View, StyleSheet } from "react-native";
import DashboardScreen from "./screens/DashboardScreen";
import OpeningChecklistScreen from "./screens/OpeningCheckListScreen";
import SplashScreen from "./screens/SplashScreen";
import ClosingChecklistScreen from "./screens/ClosingCheckListScreen"

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("splash");
  const [showSplash, setShowSplash] = useState(true);

  const splashOpacity = useRef(new Animated.Value(1)).current;   // splash starts visible
  const dashOpacity   = useRef(new Animated.Value(0)).current;   // dashboard starts hidden

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(dashOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSplash(false);
        setCurrentScreen("dashboard");
      });
    }, 3000); // show splash for 3s

    return () => clearTimeout(timer);
  }, []);

  const go = (screen) => setCurrentScreen(screen);
  const back = () => setCurrentScreen("dashboard");

  return (
    <View style={styles.container}>
      <StatusBar style={showSplash ? "dark" : "light"} />

      {/* Base layer: dashboard (or other main screens) */}
      <Animated.View style={[styles.fill, { opacity: dashOpacity }]}>
        {currentScreen === "opening-checklist" ? (
          <OpeningChecklistScreen onBack={back} />
        ) : (
          <DashboardScreen navigateToScreen={go} />
        )}
      </Animated.View>

      {/* Top layer: full-screen splash overlay that crossfades out */}
      {showSplash && (
        <Animated.View
          pointerEvents="none"
          style={[styles.overlay, { opacity: splashOpacity, zIndex: 10 }]}
        >
          <SplashScreen />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" }, // avoid black gaps
  fill: { flex: 1 },
  overlay: {
    // This is the key fix: make the splash cover the whole screen
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
  },
});
