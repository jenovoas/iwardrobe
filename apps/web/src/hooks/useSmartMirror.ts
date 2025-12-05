"use client";

import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useHandGestures } from "@/hooks/useHandGestures";
import { useAuth } from "@/context/AuthContext";

export const useSmartMirror = () => {
    const webcamRef = useRef<Webcam>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>(undefined);
    const [selectedMicId, setSelectedMicId] = useState<string | undefined>(undefined);
    const [selectedResolution, setSelectedResolution] = useState<string>("auto");
    const { user, login, logout } = useAuth();

    // Sync videoRef with webcamRef - optimized for Firefox and Chrome
    useEffect(() => {
        const syncVideo = () => {
            if (webcamRef.current?.video) {
                videoRef.current = webcamRef.current.video;
            }
        };

        // Initial sync with a small delay to ensure video element is ready
        const initialTimeout = setTimeout(syncVideo, 100);

        // Use MutationObserver for better cross-browser compatibility
        let observer: MutationObserver | null = null;
        const videoElement = webcamRef.current?.video;

        if (videoElement) {
            observer = new MutationObserver(syncVideo);
            observer.observe(videoElement, {
                attributes: true,
                attributeFilter: ["src", "srcObject"],
                childList: false,
                subtree: false,
            });

            // Also listen for loadedmetadata event (better for Firefox)
            videoElement.addEventListener("loadedmetadata", syncVideo, { once: false });
            videoElement.addEventListener("canplay", syncVideo, { once: false });
        }

        // Polling fallback for browsers that don't support MutationObserver well
        const pollInterval = setInterval(() => {
            if (webcamRef.current?.video && !videoRef.current) {
                syncVideo();
            }
        }, 500);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(pollInterval);
            if (observer) {
                observer.disconnect();
            }
            if (videoElement) {
                videoElement.removeEventListener("loadedmetadata", syncVideo);
                videoElement.removeEventListener("canplay", syncVideo);
            }
        };
    }, []); // Empty deps - we want this to run once and monitor the ref

    const { gesture, swipeDirection, handPosition, isPointing } = useHandGestures(videoRef);

    const toggleLoginModal = () => setIsLoginOpen((prev) => !prev);
    const toggleSettingsModal = () => setIsSettingsOpen((prev) => !prev);

    // Gesture Actions
    useEffect(() => {
        if (!gesture) return;

        switch (gesture) {
            case "Thumb_Up":
                if (!user && !isLoginOpen && !isSettingsOpen) {
                    setIsLoginOpen(true);
                }
                break;
            case "Closed_Fist":
                if (isLoginOpen) setIsLoginOpen(false);
                if (isSettingsOpen) setIsSettingsOpen(false);
                break;
            case "Open_Palm":
                // Potential "Wave" action
                break;
        }
    }, [gesture, user, isLoginOpen, isSettingsOpen]);

    return {
        webcamRef,
        videoRef,
        gesture,
        user,
        login,
        logout,
        isLoginOpen,
        setIsLoginOpen,
        toggleLoginModal,
        isSettingsOpen,
        setIsSettingsOpen,
        toggleSettingsModal,
        selectedCameraId,
        setSelectedCameraId,
        selectedMicId,
        setSelectedMicId,
        selectedResolution,
        setSelectedResolution,
        swipeDirection,
        handPosition,
        isPointing,
    };
};
