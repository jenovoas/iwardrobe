"use client";

import React, { useCallback } from "react";
import dynamic from 'next/dynamic';
import CameraFeed from "@/components/mirror/CameraFeed";
import OverlayLayer from "@/components/mirror/OverlayLayer";
import AriaAvatar from "@/components/aria/AriaAvatar";
import ChatInterface from "@/components/aria/ChatInterface";
import { WidgetMenuItem } from "@/components/home/WidgetMenuItem";

// Dynamic imports for heavy components
const LoginModal = dynamic(() => import("@/components/auth/LoginModal"), { ssr: false });
const SettingsModal = dynamic(() => import("@/components/settings/SettingsModal"), { ssr: false });
const VirtualTryOn = dynamic(() => import("@/components/mirror/VirtualTryOn"), { ssr: false });

import WeatherWidget from "@/components/widgets/WeatherWidget";
import WardrobeWidgets from "@/components/widgets/WardrobeWidgets";
import ClothingDetailPanel from "@/components/widgets/ClothingDetailPanel";
import HairStyleWidget from "@/components/widgets/HairStyleWidget";
import BeardStyleWidget from "@/components/widgets/BeardStyleWidget";
import ShoppingWidget from "@/components/widgets/ShoppingWidget";
import TryOnWidget, { OutfitState } from "@/components/widgets/TryOnWidget";
import Clock from "@/components/common/Clock";
import { useSmartMirror } from "@/hooks/useSmartMirror";
import { ClothingItem } from "@/data/clothingData";
import { motion } from "framer-motion";
import { useAmbientLight } from "@/hooks/useAmbientLight";
import { Settings, Sun, Moon, Lightbulb } from "lucide-react";

const WIDGET_CONFIG = [
  { label: 'Wardrobe', type: 'wardrobe' as const },
  { label: 'Hair Style', type: 'hair' as const },
  { label: 'Beard Style', type: 'beard' as const },
  { label: 'Shopping', type: 'shopping' as const },
] as const;

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
    isModelLoading,
  } = useSmartMirror();

  const [isAriaListening, setIsAriaListening] = React.useState(false);
  const [isTryOnActive, setIsTryOnActive] = React.useState(false);
  const [selectedClothingItem, setSelectedClothingItem] = React.useState<ClothingItem | null>(null);
  const [outfit, setOutfit] = React.useState<OutfitState>({});

  const [activeView, setActiveView] = React.useState<'menu' | 'wardrobe' | 'hair' | 'beard' | 'shopping'>('menu');
  const [focusedWidgetIndex, setFocusedWidgetIndex] = React.useState(0);

  const { lightLevel, isMounted, toggleLightMode, isManualMode, colorScheme } = useAmbientLight(videoRef);

  React.useEffect(() => {
    if (!swipeDirection) return;

    if (activeView === 'menu') {
      if (swipeDirection === "up") {
        setFocusedWidgetIndex((prev) => (prev > 0 ? prev - 1 : WIDGET_CONFIG.length - 1));
      } else if (swipeDirection === "down") {
        setFocusedWidgetIndex((prev) => (prev < WIDGET_CONFIG.length - 1 ? prev + 1 : 0));
      } else if (swipeDirection === "right") {
        setActiveView(WIDGET_CONFIG[focusedWidgetIndex].type);
      }
    }
  }, [swipeDirection, activeView, focusedWidgetIndex]);

  React.useEffect(() => {
    if (activeView !== 'menu' && gesture === 'Closed_Fist') {
      setActiveView('menu');
    }

    if (activeView === 'menu' && gesture === 'Thumb_Up') {
      setActiveView(WIDGET_CONFIG[focusedWidgetIndex].type);
    }
  }, [gesture, activeView, focusedWidgetIndex]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (token) {
        window.history.replaceState({}, document.title, "/");
        login(token);
      }
    }
  }, [login]);

  const handleItemSelect = useCallback((item: ClothingItem) => {
    setSelectedClothingItem(item);
  }, []);

  const handleTryOn = useCallback((item: ClothingItem) => {
    let slot: keyof OutfitState | undefined;
    if (item.category === "Camisas" || item.category === "Abrigos") slot = "top";
    else if (item.category === "Pantalones") slot = "bottom";
    else if (item.category === "Zapatos") slot = "feet";
    else if (item.category === "Accesorios") slot = "accessories";

    if (slot) {
      setOutfit(prev => ({ ...prev, [slot]: item }));
    }

    setIsTryOnActive(true);
    setSelectedClothingItem(null);
  }, []);

  const handleRemoveItem = (slot: keyof OutfitState) => {
    setOutfit(prev => {
      const newOutfit = { ...prev };
      delete newOutfit[slot];
      return newOutfit;
    });
  };

  const handleClearOutfit = () => {
    setOutfit({});
  };

  const handleCloseDetail = () => {
    setSelectedClothingItem(null);
  };

  React.useEffect(() => {
    if (swipeDirection === "right" && selectedClothingItem) {
      handleTryOn(selectedClothingItem);
    }
  }, [swipeDirection, selectedClothingItem, handleTryOn]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black/90 text-white">
      <CameraFeed ref={webcamRef} deviceId={selectedCameraId} resolution={selectedResolution} />
      <VirtualTryOn videoRef={videoRef} isActive={isTryOnActive} />
      <OverlayLayer>
        {gesture && (
          <div className="absolute top-4 right-1/2 translate-x-1/2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 text-sm z-50 flex items-center gap-2">
            <span>🤚 {gesture}</span>
            {swipeDirection && <span className="font-bold text-green-400">→ {swipeDirection.toUpperCase()}</span>}
            {activeView === 'menu' && <span className="text-white ml-2 text-xs">(Select: 👍 Thumb Up / 👉 Right)</span>}
            {activeView !== 'menu' && <span className="text-white ml-2 text-xs">(Back: ✊ Fist)</span>}
          </div>
        )}

        {(gesture === "Pointing_Up" || gesture === "Open_Palm") && handPosition && (
          <div
            className="absolute w-8 h-8 border-2 border-white rounded-full bg-white/20 pointer-events-none z-50 transition-all duration-75 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            style={{
              left: `${(1 - handPosition.x) * 100}%`,
              top: `${handPosition.y * 100}%`,
            }}
          />
        )}

        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-between items-start p-8 h-full pointer-events-none"
        >
          <div className="flex flex-col h-full justify-between pointer-events-auto">
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-xl backdrop-blur-md bg-black/10 w-fit relative">
                <h1 className="text-4xl font-bold tracking-widest text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" aria-label="iWARDROBE Application">iWARDROBE</h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-90 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">Smart Mirror OS v3.0</span>
                  {isModelLoading && (
                    <span className="text-xs text-yellow-400 animate-pulse bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
                      Inicializando IA...
                    </span>
                  )}
                </div>
              </div>
              <WeatherWidget videoRef={videoRef} />
            </div>

            <div className="flex-1 flex items-center ml-8 pointer-events-auto">
              {activeView === 'menu' && (
                <div className="flex flex-col gap-4 w-64 pointer-events-auto">
                  {WIDGET_CONFIG.map((config, index) => (
                    <WidgetMenuItem
                      key={config.type}
                      label={config.label}
                      index={index}
                      type={config.type}
                      isFocused={focusedWidgetIndex === index}
                      onClick={() => {
                        setActiveView(config.type);
                        setFocusedWidgetIndex(index);
                      }}
                    />
                  ))}
                </div>
              )}

              {activeView === 'wardrobe' && (
                <WardrobeWidgets
                  handPosition={handPosition}
                  isPointing={isPointing}
                  onItemSelect={handleItemSelect}
                  swipeDirection={swipeDirection}
                  videoRef={videoRef}
                  isFocused={true}
                />
              )}
            </div>

            {gesture && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`mt-4 px-3 py-1 rounded-full text-xs self-start transition-all duration-500 backdrop-blur-md ${!isMounted
                  ? 'bg-white/20 border border-white/30'
                  : lightLevel === 'bright'
                    ? 'bg-gray-900/80 border border-gray-700/80'
                    : 'bg-white/20 border border-white/30'
                  }`}
              >
                Gesture: {gesture}
              </motion.div>
            )}
          </div>

          <div className="flex flex-col items-end gap-4 h-full pointer-events-auto">
            <Clock />

            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-400">● {user.email}</span>
                  <button onClick={logout} className="text-xs hover:underline" aria-label="Logout">Logout</button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-500 backdrop-blur-md ${!isMounted
                    ? 'bg-white/10 hover:bg-white/20'
                    : lightLevel === 'bright'
                      ? 'bg-gray-900/80 border border-gray-700/80 hover:bg-gray-800/90'
                      : 'bg-white/10 hover:bg-white/20'
                    }`}
                  aria-label="Login to your account"
                >
                  Login
                </button>
              )}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={`p-2 rounded-full backdrop-blur-md transition-all duration-500 ${!isMounted
                  ? 'bg-white/10 hover:bg-white/20'
                  : lightLevel === 'bright'
                    ? 'bg-gray-900/80 border border-gray-700/80 hover:bg-gray-800/90'
                    : 'bg-white/10 hover:bg-white/20'
                  }`}
                aria-label="Open Settings"
              >
                <motion.div
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Settings className="w-5 h-5" />
                </motion.div>
              </button>
              <button
                onClick={toggleLightMode}
                className={`p-2 rounded-full backdrop-blur-md transition-all duration-500 ${!isMounted
                  ? 'bg-white/10 hover:bg-white/20'
                  : lightLevel === 'bright'
                    ? 'bg-gray-900/80 border border-gray-700/80 hover:bg-gray-800/90'
                    : 'bg-white/10 hover:bg-white/20'
                  }`}
                aria-label="Toggle Light Mode"
                title={isManualMode ? `Manual: ${lightLevel}` : `Auto: ${lightLevel}`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {lightLevel === 'bright' ? <Sun className="w-5 h-5" /> : lightLevel === 'dark' ? <Moon className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
                </motion.div>
              </button>
            </div>

            {activeView === 'hair' && (
              <HairStyleWidget
                isFocused={true}
                swipeDirection={swipeDirection}
                lightLevel={lightLevel}
                colorScheme={colorScheme}
                isMounted={isMounted}
              />
            )}
            {activeView === 'beard' && (
              <BeardStyleWidget
                isFocused={true}
                swipeDirection={swipeDirection}
                lightLevel={lightLevel}
                colorScheme={colorScheme}
                isMounted={isMounted}
              />
            )}
            {activeView === 'shopping' && (
              <ShoppingWidget
                isFocused={true}
                swipeDirection={swipeDirection}
                selectedItem={selectedClothingItem}
                lightLevel={lightLevel}
                colorScheme={colorScheme}
                isMounted={isMounted}
              />
            )}
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-8 right-8 z-40 flex flex-col-reverse items-end gap-4 pointer-events-auto"
        >
          <button
            onClick={() => setIsAriaListening(!isAriaListening)}
            className="relative group focus:outline-none"
            aria-label={isAriaListening ? "Stop Listening" : "Start Listening"}
          >
            <div className={`transition-transform duration-300 ${isAriaListening ? "scale-110" : "group-hover:scale-105"}`}>
              <AriaAvatar state={isAriaListening ? "listening" : "idle"} />
            </div>
            {isAriaListening && (
              <div className={`absolute inset-0 rounded-full blur-xl animate-pulse -z-10 transition-all duration-500 ${!isMounted
                ? 'bg-white/20'
                : lightLevel === 'bright'
                  ? 'bg-gray-700/30'
                  : 'bg-white/20'
                }`} />
            )}
          </button>

          <ChatInterface
            isListening={isAriaListening}
          />
        </motion.div>

        {activeView !== 'menu' && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-8 left-8 pointer-events-auto"
          >
            <button
              onClick={() => setActiveView('menu')}
              className="flex items-center gap-2 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:bg-black/60 hover:text-white transition-all cursor-pointer"
            >
              <span className="text-xl">Back</span>
              <span className="text-sm font-medium">Back to Menu</span>
              <span className="text-xs opacity-50 border-l border-white/20 pl-2 ml-1">Closed Fist</span>
            </button>
          </motion.div>
        )}
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
      {selectedClothingItem && (
        <ClothingDetailPanel
          item={selectedClothingItem}
          onClose={handleCloseDetail}
          onTryOn={handleTryOn}
        />
      )}
      <TryOnWidget
        outfit={outfit}
        onRemoveItem={handleRemoveItem}
        onClearOutfit={handleClearOutfit}
        onClose={() => setIsTryOnActive(false)}
        isVisible={isTryOnActive}
        videoRef={videoRef}
      />
    </main>
  );
}
