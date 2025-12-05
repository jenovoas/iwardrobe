"use client";

import React from "react";
import CameraFeed from "@/components/mirror/CameraFeed";
import OverlayLayer from "@/components/mirror/OverlayLayer";
import AriaAvatar from "@/components/aria/AriaAvatar";
import ChatInterface from "@/components/aria/ChatInterface";
import LoginModal from "@/components/auth/LoginModal";
import SettingsModal from "@/components/settings/SettingsModal";
import VirtualTryOn from "@/components/mirror/VirtualTryOn";
import WeatherWidget from "@/components/widgets/WeatherWidget";
import WardrobeWidgets from "@/components/widgets/WardrobeWidgets";
import ClothingDetailPanel from "@/components/widgets/ClothingDetailPanel";
import HairStyleWidget from "@/components/widgets/HairStyleWidget";
import BeardStyleWidget from "@/components/widgets/BeardStyleWidget";
import { useSmartMirror } from "@/hooks/useSmartMirror";
import { ClothingItem } from "@/data/clothingData";
import { motion } from "framer-motion";
import { useAmbientLight } from "@/hooks/useAmbientLight";

export default function Home() {
  const {
    webcamRef,
    videoRef,
    gesture,
    user,
    logout,
    isLoginOpen,
    setIsLoginOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    selectedCameraId,
    setSelectedCameraId,
    selectedMicId,
    setSelectedMicId,
    selectedResolution,
    setSelectedResolution,
    login,
    swipeDirection,
    handPosition,
    isPointing,
  } = useSmartMirror();

  const [isAriaListening, setIsAriaListening] = React.useState(false);
  const [isTryOnActive, setIsTryOnActive] = React.useState(false);
  const [selectedClothingItem, setSelectedClothingItem] = React.useState<ClothingItem | null>(null);

  // Client-side time and date to prevent hydration mismatch
  const [currentTime, setCurrentTime] = React.useState<string>("");
  const [currentDate, setCurrentDate] = React.useState<string>("");
  const [isTimeLoaded, setIsTimeLoaded] = React.useState(false);

  // Detect ambient light for adaptive UI colors
  const { lightLevel, isMounted, toggleLightMode, isManualMode } = useAmbientLight(videoRef);

  // Update time every second (client-side only)
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];
      const date = now.getDate();
      setCurrentDate(`${dayName}, ${monthName} ${date}`);

      setIsTimeLoaded(true);
    };

    // Initial update
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle item selection and try-on
  const handleItemSelect = (item: ClothingItem) => {
    setSelectedClothingItem(item);
  };

  const handleTryOn = (item: ClothingItem) => {
    setIsTryOnActive(true);
    setSelectedClothingItem(null);
    console.log("Trying on:", item.name);
  };

  const handleCloseDetail = () => {
    setSelectedClothingItem(null);
  };

  // Handle Swipe Gesture for try-on
  React.useEffect(() => {
    if (swipeDirection === "right" && selectedClothingItem) {
      handleTryOn(selectedClothingItem);
    }
  }, [swipeDirection, selectedClothingItem]);

  // Handle Google Login Callback
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (token) {
        // Clean URL
        window.history.replaceState({}, document.title, "/");
        // Login
        login(token);
      }
    }
  }, [login]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black/90 text-white">
      <CameraFeed ref={webcamRef} deviceId={selectedCameraId} resolution={selectedResolution} />
      <VirtualTryOn videoRef={videoRef} isActive={isTryOnActive} />
      <OverlayLayer>
        {/* Top Bar */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-between items-start p-8"
        >
          <div className="flex flex-col">
            <h1 className="text-4xl font-light tracking-widest" aria-label="iWARDROBE Application">iWARDROBE</h1>
            <span className="text-sm opacity-70">Smart Mirror OS v3.0</span>
            <WeatherWidget videoRef={videoRef} />
            <WardrobeWidgets
              handPosition={handPosition}
              isPointing={isPointing}
              onItemSelect={handleItemSelect}
              swipeDirection={swipeDirection}
              videoRef={videoRef}
            />
            {gesture && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-4 px-3 py-1 bg-blue-500/50 rounded-full text-xs self-start"
              >
                Gesture: {gesture}
              </motion.div>
            )}
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="text-right">
              <div className="text-6xl font-thin" aria-label="Current Time">
                {isTimeLoaded ? currentTime : "--:--"}
              </div>
              <div className="text-xl font-light">
                {isTimeLoaded ? currentDate : "Loading..."}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-400">● {user.email}</span>
                  <button onClick={logout} className="text-xs hover:underline" aria-label="Logout">Logout</button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-500 backdrop-blur-xl ${!isMounted
                    ? 'bg-white/10 hover:bg-white/20'
                    : lightLevel === 'bright'
                      ? 'bg-gray-900/80 border border-gray-700/80 hover:bg-gray-800/90'
                      : lightLevel === 'normal'
                        ? 'bg-white/10 hover:bg-white/20'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  aria-label="Login to your account"
                >
                  Login
                </button>
              )}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={`p-2 rounded-full backdrop-blur-xl transition-all duration-500 ${!isMounted
                  ? 'bg-white/10 hover:bg-white/20'
                  : lightLevel === 'bright'
                    ? 'bg-gray-900/80 border border-gray-700/80 hover:bg-gray-800/90'
                    : lightLevel === 'normal'
                      ? 'bg-white/10 hover:bg-white/20'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                aria-label="Open Settings"
              >
                <span className="text-xl">⚙️</span>
              </button>
              <button
                onClick={toggleLightMode}
                className={`p-2 rounded-full backdrop-blur-xl transition-all duration-500 ${!isMounted
                  ? 'bg-white/10 hover:bg-white/20'
                  : lightLevel === 'bright'
                    ? 'bg-gray-900/80 border border-gray-700/80 hover:bg-gray-800/90'
                    : lightLevel === 'normal'
                      ? 'bg-white/10 hover:bg-white/20'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                aria-label="Toggle Light Mode"
                title={isManualMode ? `Manual: ${lightLevel}` : `Auto: ${lightLevel}`}
              >
                <span className="text-xl">
                  {lightLevel === 'bright' ? '☀️' : lightLevel === 'dark' ? '🌙' : '💡'}
                </span>
              </button>
            </div>

            {/* Style Widgets */}
            <HairStyleWidget videoRef={videoRef} />
            <BeardStyleWidget videoRef={videoRef} />
          </div>
        </motion.header>

        {/* Chat Interface & Avatar - Bottom Right */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-8 right-8 z-40 flex flex-col-reverse items-end gap-4"
        >
          {/* Avatar as Button */}
          <button
            onClick={() => setIsAriaListening(!isAriaListening)}
            className="relative group focus:outline-none"
            aria-label={isAriaListening ? "Stop Listening" : "Start Listening"}
          >
            <div className={`transition-transform duration-300 ${isAriaListening ? "scale-110" : "group-hover:scale-105"}`}>
              <AriaAvatar state={isAriaListening ? "listening" : "idle"} />
            </div>
            {/* Pulse effect when listening */}
            {isAriaListening && (
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse -z-10" />
            )}
          </button>

          {/* Chat Interface (Appears above) */}
          <ChatInterface
            isListening={isAriaListening}
            onToggleListening={() => setIsAriaListening(!isAriaListening)}
          />
        </motion.div>

        {/* Bottom Bar - Split Corners */}
        <motion.footer
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute bottom-0 left-0 right-0 flex justify-between items-end p-8 pointer-events-none"
        >
          {/* Bottom Left: Wardrobe */}
          <button className="p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all pointer-events-auto" aria-label="Open Wardrobe">
            <span className="text-2xl">👕</span>
          </button>

          {/* Right side is now handled by the Avatar container above */}
        </motion.footer>
      </OverlayLayer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedCameraId={selectedCameraId}
        onCameraChange={setSelectedCameraId}
        selectedMicId={selectedMicId}
        onMicChange={setSelectedMicId}
        selectedResolution={selectedResolution}
        onResolutionChange={setSelectedResolution}
      />
      {
        selectedClothingItem && (
          <ClothingDetailPanel
            item={selectedClothingItem}
            onClose={handleCloseDetail}
            onTryOn={handleTryOn}
          />
        )
      }
    </main >
  );
}
