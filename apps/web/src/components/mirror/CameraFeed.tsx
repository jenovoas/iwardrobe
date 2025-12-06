"use client";

import React, { useEffect, useState, forwardRef, useCallback, useRef, useMemo } from "react";
import Webcam from "react-webcam";

interface CameraFeedProps {
    deviceId?: string;
    resolution?: string;
}

// Resolution configurations for different screen sizes
const RESOLUTION_CONFIGS = {
    hd: { label: "720p", width: { ideal: 1280 }, height: { ideal: 720 } },
    fhd: { label: "1080p", width: { ideal: 1920 }, height: { ideal: 1080 } },
    "4k": { label: "4K", width: { ideal: 3840 }, height: { ideal: 2160 } },
    auto: { 
        label: "Auto", 
        width: { min: 1280, ideal: 1920, max: 3840 }, 
        height: { min: 720, ideal: 1080, max: 2160 } 
    },
};

const CameraFeed = forwardRef<Webcam, CameraFeedProps>((props, ref) => {
    const { deviceId, resolution = "auto" } = props;
    const [isClient, setIsClient] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [facingMode] = useState<"user" | "environment">("user");
    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Set client flag for hydration
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsClient(true);
    }, []);

    // Memoized video constraints to prevent unnecessary re-renders
    const videoConstraints = useMemo(() => {
        const config = RESOLUTION_CONFIGS[resolution as keyof typeof RESOLUTION_CONFIGS] || RESOLUTION_CONFIGS.auto;
        
        const constraints: MediaTrackConstraints = {
            width: config.width,
            height: config.height,
            aspectRatio: { ideal: 16 / 9 },
        };

        if (deviceId) {
            constraints.deviceId = { exact: deviceId };
        } else {
            constraints.facingMode = facingMode;
        }

        return constraints;
    }, [facingMode, deviceId, resolution]);

    // Handle successful media access
    const handleUserMedia = useCallback(() => {
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = null;
        }
        setError(null);
    }, []);

    // Handle media errors with proper type handling
    const handleMediaError = useCallback((error: DOMException | string) => {
        const errorMsg = typeof error === 'string' ? error : error.message;
        console.error("[CameraFeed] Media error:", errorMsg);
        
        setError(errorMsg);

        // Auto-clear error after timeout
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = setTimeout(() => setError(null), 5000);
    }, []);

    // Show loading state during hydration
    if (!isClient) {
        return (
            <div className="w-full h-full bg-black/90 flex items-center justify-center">
                <div className="animate-pulse text-white text-sm">Initializing camera...</div>
            </div>
        );
    }

    return (
        <>
            <Webcam
                ref={ref}
                audio={false}
                videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleMediaError}
                className="w-full h-full object-cover"
                mirrored={facingMode === "user"}
                screenshotFormat="image/jpeg"
            />

            {/* Error message display with auto-dismiss */}
            {error && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm">
                    <div className="bg-red-900/90 text-white px-6 py-4 rounded-lg max-w-sm border border-red-700/50">
                        <p className="font-semibold text-sm">Camera Error</p>
                        <p className="text-xs mt-2 opacity-90 leading-relaxed">{error}</p>
                    </div>
                </div>
            )}
        </>
    );
});

CameraFeed.displayName = "CameraFeed";

export default CameraFeed;
