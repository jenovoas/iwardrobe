"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
    PoseLandmarker,
    FilesetResolver,
    PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

const POSE_CONFIG = {
    DETECTION_FPS: 24, // Target 24 FPS for pose detection (less intensive)
    GPU_FALLBACK_DELAY: 1000, // ms
};

export const usePoseLandmarker = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
    const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
    const [landmarks, setLandmarks] = useState<PoseLandmarkerResult | null>(null);
    
    // Performance refs
    const requestRef = useRef<number>(0);
    const lastDetectionTimeRef = useRef<number>(0);
    const detectionIntervalRef = useRef<number>(1000 / POSE_CONFIG.DETECTION_FPS);

    // Memoized configuration
    const landmarkerConfig = useMemo(() => ({
        modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        runningMode: "VIDEO" as const,
    }), []);

    // Initialize pose landmarker with GPU fallback
    useEffect(() => {
        const initializeLandmarker = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );

                let landmarker: PoseLandmarker | null = null;
                let delegate: "GPU" | "CPU" = "GPU";

                try {
                    landmarker = await PoseLandmarker.createFromOptions(vision, {
                        baseOptions: {
                            ...landmarkerConfig,
                            delegate: "GPU",
                        },
                        runningMode: "VIDEO",
                    });
                    console.log("[MediaPipe] Pose landmarker initialized with GPU delegate");
                } catch (gpuError) {
                    console.warn("[MediaPipe] GPU delegate failed for pose, falling back to CPU");
                    delegate = "CPU";

                    // Small delay before fallback attempt
                    await new Promise(resolve => setTimeout(resolve, POSE_CONFIG.GPU_FALLBACK_DELAY));

                    landmarker = await PoseLandmarker.createFromOptions(vision, {
                        baseOptions: {
                            ...landmarkerConfig,
                            delegate: "CPU",
                        },
                        runningMode: "VIDEO",
                    });
                    console.log("[MediaPipe] Pose landmarker initialized with CPU delegate");
                }

                if (landmarker) {
                    setPoseLandmarker(landmarker);
                }
            } catch (error) {
                console.error("[MediaPipe] Failed to create pose landmarker:", error);
            }
        };

        initializeLandmarker();

        return () => {
            // Cleanup if needed
        };
    }, [landmarkerConfig]);

    // Main detection loop with throttling
    useEffect(() => {
        if (!poseLandmarker || !videoRef.current) return;

        const detect = () => {
            const videoEl = videoRef.current;

            if (videoEl && videoEl.readyState === 4) {
                const currentTime = performance.now();

                // Throttle detection to target FPS
                if (currentTime - lastDetectionTimeRef.current >= detectionIntervalRef.current) {
                    lastDetectionTimeRef.current = currentTime;

                    try {
                        const results = poseLandmarker.detectForVideo(videoEl, currentTime);
                        setLandmarks(results);
                    } catch (error) {
                        console.error("[MediaPipe] Pose detection error:", error);
                    }
                }
            }

            requestRef.current = requestAnimationFrame(detect);
        };

        detect();

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [poseLandmarker]);

    return { landmarks };
};

