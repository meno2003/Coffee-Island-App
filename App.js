// App.js
import React, { useState, useEffect, useRef } from "react";
import { StatusBar, Animated, View, StyleSheet } from "react-native";
import DashboardScreen from "./screens/DashboardScreen";
import OpeningChecklistScreen from "./screens/OpeningCheckListScreen";
import ClosingChecklistScreen from "./screens/ClosingCheckListScreen";
import DueDiligenceAMScreen from "./screens/DueDiligenceAMScreen";
import DueDiligencePMScreen from "./screens/DueDiligencePMScreen";
import SplashScreen from "./screens/SplashScreen";
import StockCheckScreen from "./screens/StockCheckScreen";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";



  


export default function App() {
  const [currentScreen, setCurrentScreen] = useState("splash");
  const [showSplash, setShowSplash] = useState(true);

  const splashOpacity = useRef(new Animated.Value(1)).current;   // splash starts visible
  const dashOpacity   = useRef(new Animated.Value(0)).current;   // dashboard starts hidden

  useEffect(() => {

    const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Please enable notifications to get expiry reminders!");
    }
  };
  setupNotifications();

  // For iOS, set how notifications are displayed
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  
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

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "opening-checklist":
        return <OpeningChecklistScreen onBack={back} />;
      case "closing-checklist":
        return <ClosingChecklistScreen onBack={back} />;
      case "due-diligence-am":
        return <DueDiligenceAMScreen onBack={back} />;
      case "due-diligence-pm":
        return <DueDiligencePMScreen onBack={back} />;
      case "stock-check":
        return <StockCheckScreen onBack={back} />;
      default:
        return <DashboardScreen navigateToScreen={go} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style={showSplash ? "dark" : "light"} />

      {/* Base layer: dashboard (or other main screens) */}
      <Animated.View style={[styles.fill, { opacity: dashOpacity }]}>
        {renderCurrentScreen()}
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