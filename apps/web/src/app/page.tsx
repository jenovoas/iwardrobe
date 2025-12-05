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
import { useSmartMirror } from "@/hooks/useSmartMirror";
import { motion } from "framer-motion";

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
    // @ts-ignore
    login, // We need to access login from useSmartMirror or useAuth directly
    swipeDirection,
  } = useSmartMirror();

  const [isAriaListening, setIsAriaListening] = React.useState(false);
  const [isTryOnActive, setIsTryOnActive] = React.useState(false);

  // Handle Swipe Gesture
  React.useEffect(() => {
    if (swipeDirection === "right") {
      setIsTryOnActive(true);
      // Optional: Play a sound or visual feedback
    }
  }, [swipeDirection]);

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
            <WeatherWidget />
            <WardrobeWidgets />
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
              <div className="text-6xl font-thin" aria-label="Current Time">09:41</div>
              <div className="text-xl font-light">Wednesday, Dec 4</div>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-400">● {user.email}</span>
                  <button onClick={logout} className="text-xs hover:underline" aria-label="Logout">Logout</button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-4 py-1 bg-white/10 rounded-full text-sm hover:bg-white/20 transition-all"
                  aria-label="Login to your account"
                >
                  Login
                </button>
              )}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
                aria-label="Open Settings"
              >
                <span className="text-xl">⚙️</span>
              </button>
            </div>
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
    </main>
  );
}
