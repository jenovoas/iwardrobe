"use client";

import React, { useEffect, useState, forwardRef, useCallback, useRef } from "react";
import Webcam from "react-webcam";

interface CameraFeedProps {
    deviceId?: string;
    resolution?: string;
}

const CameraFeed = forwardRef<Webcam, CameraFeedProps>((props, ref) => {
    const { deviceId, resolution = "auto" } = props;
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Detect browser and optimize constraints
    const getVideoConstraints = useCallback(() => {
        let width, height;

        switch (resolution) {
            case "hd": // 720p
                width = { ideal: 1280 };
                height = { ideal: 720 };
                break;
            case "fhd": // 1080p
                width = { ideal: 1920 };
                height = { ideal: 1080 };
                break;
            case "4k": // 4K
                width = { ideal: 3840 };
                height = { ideal: 2160 };
                break;
            case "auto":
            default:
                // Request high resolution (1080p preferred, 4K if available)
                width = { min: 1280, ideal: 1920, max: 3840 };
                height = { min: 720, ideal: 1080, max: 2160 };
                break;
        }

        const constraints: MediaTrackConstraints = {
            width,
            height,
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

    // Check for camera errors by monitoring the video element
    useEffect(() => {
        if (!isClient || !ref || typeof ref === "function") return;

        const webcam = (ref as React.MutableRefObject<Webcam | null>).current;
        if (!webcam) return;

        const video = webcam.video;
        if (!video) return;

        // Set up error detection timeout (5 seconds)
        errorTimeoutRef.current = setTimeout(() => {
            // Check if video is actually playing
            if (video.readyState === 0 || video.paused) {
                setError("No se pudo acceder a la cámara. Verifica los permisos.");
            }
        }, 5000);

        const handleError = (e: Event) => {
            console.error("Video error:", e);
            const videoError = (video as HTMLVideoElement).error;
            if (videoError) {
                if (videoError.code === videoError.MEDIA_ERR_ABORTED) {
                    setError("Acceso a la cámara cancelado.");
                } else if (videoError.code === videoError.MEDIA_ERR_NETWORK) {
                    setError("Error de red al acceder a la cámara.");
                } else if (videoError.code === videoError.MEDIA_ERR_DECODE) {
                    setError("Error al decodificar el video de la cámara.");
                } else if (videoError.code === videoError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
                    setError("Formato de video no soportado.");
                } else {
                    setError("Error al acceder a la cámara.");
                }
            }
        };

        const handleLoadedMetadata = () => {
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
                errorTimeoutRef.current = null;
            }
            setError(null);
        };

        video.addEventListener("error", handleError);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }
            video.removeEventListener("error", handleError);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, [isClient, ref]);

    if (!isClient) return null;

    return (
        <div className="absolute inset-0 w-full h-full bg-black z-0 overflow-hidden">
            {error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-8 text-center z-10">
                    <div>
                        <p className="text-lg mb-4">{error}</p>
                        <button
                            onClick={() => {
                                setError(null);
                                setFacingMode(facingMode === "user" ? "environment" : "user");
                            }}
                            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            ) : (
                <Webcam
                    suppressHydrationWarning
                    key={`${deviceId}-${resolution}-${facingMode}`}
                    ref={ref}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={getVideoConstraints()}
                    onUserMedia={handleUserMedia}
                    mirrored={true}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}
        </div>
    );
});

CameraFeed.displayName = "CameraFeed";

export default CameraFeed;
