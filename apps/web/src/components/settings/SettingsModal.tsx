"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCameraId: string | undefined;
    onCameraChange: (deviceId: string) => void;
    selectedMicId: string | undefined;
    onMicChange: (deviceId: string) => void;
    selectedResolution: string;
    onResolutionChange: (res: string) => void;
}

const SettingsModal = ({
    isOpen,
    onClose,
    selectedCameraId,
    onCameraChange,
    selectedMicId,
    onMicChange,
    selectedResolution,
    onResolutionChange,
}: SettingsModalProps) => {
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const [mics, setMics] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        if (isOpen) {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                setCameras(devices.filter((d) => d.kind === "videoinput"));
                setMics(devices.filter((d) => d.kind === "audioinput"));
            });
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-black/80 border border-white/20 p-8 rounded-3xl w-full max-w-md text-white"
                    >
                        <h2 className="text-2xl font-light mb-6 tracking-wider">CONFIGURACIÓN</h2>

                        <div className="space-y-6">
                            {/* Camera Selection */}
                            <div>
                                <label className="block text-sm opacity-70 mb-2">Cámara</label>
                                <select
                                    value={selectedCameraId || ""}
                                    onChange={(e) => onCameraChange(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/50 text-white"
                                >
                                    {cameras.map((camera) => (
                                        <option key={camera.deviceId} value={camera.deviceId} className="bg-black text-white">
                                            {camera.label || `Cámara ${camera.deviceId.slice(0, 5)}...`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Resolution Selection */}
                            <div>
                                <label className="block text-sm opacity-70 mb-2">Calidad de Video</label>
                                <select
                                    value={selectedResolution}
                                    onChange={(e) => onResolutionChange(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/50 text-white"
                                >
                                    <option value="auto" className="bg-black text-white">Automático (Recomendado)</option>
                                    <option value="hd" className="bg-black text-white">HD (720p)</option>
                                    <option value="fhd" className="bg-black text-white">Full HD (1080p)</option>
                                    <option value="4k" className="bg-black text-white">4K Ultra HD</option>
                                </select>
                            </div>

                            {/* Microphone Selection */}
                            <div>
                                <label className="block text-sm opacity-70 mb-2">Micrófono</label>
                                <select
                                    value={selectedMicId || ""}
                                    onChange={(e) => onMicChange(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/50 text-white"
                                >
                                    {mics.map((mic) => (
                                        <option key={mic.deviceId} value={mic.deviceId} className="bg-black text-white">
                                            {mic.label || `Micrófono ${mic.deviceId.slice(0, 5)}...`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors mt-8"
                        >
                            Listo
                        </button>

                        <button onClick={onClose} className="absolute top-4 right-4 opacity-50 hover:opacity-100">
                            ✕
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
