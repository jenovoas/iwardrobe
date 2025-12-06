"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
    GestureRecognizer,
    FilesetResolver,
    GestureRecognizerResult,
} from "@mediapipe/tasks-vision";
import { throttle, measureAsync } from "@/utils/performance";
import Webcam from "react-webcam";

export interface HandPosition {
    x: number; // 0-1 normalized
    y: number; // 0-1 normalized
}

const GESTURE_CONFIG = {
    DETECTION_FPS: 30, // Target 30 FPS
    SWIPE_THRESHOLD: 0.10, // 10% of screen
    SWIPE_COOLDOWN: 400, // ms
    SWIPE_TIMEOUT: 1000, // ms before clearing swipe
    MIN_GESTURE_CONFIDENCE: 0.5,
    GPU_FALLBACK_DELAY: 1000, // ms
};

export const useHandGestures = (
    videoRef: React.RefObject<HTMLVideoElement | null> | React.RefObject<Webcam | null>
) => {
    const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
    const [gesture, setGesture] = useState<string | null>(null);
    const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | "up" | "down" | null>(null);
    const [handPosition, setHandPosition] = useState<HandPosition | null>(null);
    const [isPointing, setIsPointing] = useState(false);

    // Refs for performance optimization
    const requestRef = useRef<number>(0);
    const swipeStartPosRef = useRef<HandPosition | null>(null);
    const lastGestureRef = useRef<string | null>(null);
    const gestureCooldownRef = useRef<number>(0);
    const lastDetectionTimeRef = useRef<number>(0);
    const detectionIntervalRef = useRef<number>(1000 / GESTURE_CONFIG.DETECTION_FPS);
    const swipeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Memoized configuration
    const recognizerConfig = useMemo(() => ({
        baseOptions: {
            modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        },
        runningMode: "VIDEO" as const,
        numHands: 1,
        minHandDetectionConfidence: 0.3,
        minTrackingConfidence: 0.3,
    }), []);

    // Initialize gesture recognizer with GPU fallback
    useEffect(() => {
        const initializeRecognizer = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );

                let recognizer: GestureRecognizer | null = null;
                let delegate: "GPU" | "CPU" = "GPU";

                try {
                    recognizer = await GestureRecognizer.createFromOptions(vision, {
                        ...recognizerConfig,
                        baseOptions: {
                            ...recognizerConfig.baseOptions,
                            delegate: "GPU",
                        },
                    });
                    console.log("[MediaPipe] Gesture recognizer initialized with GPU delegate");
                } catch (gpuError) {
                    console.warn("[MediaPipe] GPU delegate failed, falling back to CPU");
                    delegate = "CPU";

                    // Small delay before fallback attempt
                    await new Promise(resolve => setTimeout(resolve, GESTURE_CONFIG.GPU_FALLBACK_DELAY));

                    recognizer = await GestureRecognizer.createFromOptions(vision, {
                        ...recognizerConfig,
                        baseOptions: {
                            ...recognizerConfig.baseOptions,
                            delegate: "CPU",
                        },
                    });
                    console.log("[MediaPipe] Gesture recognizer initialized with CPU delegate");
                }

                if (recognizer) {
                    setGestureRecognizer(recognizer);
                }
            } catch (error) {
                console.error("[MediaPipe] Failed to initialize gesture recognizer:", error);
            }
        };

        initializeRecognizer();

        return () => {
            // Cleanup
        };
    }, [recognizerConfig]);

    // Extract video element from ref
    const getVideoElement = useCallback((): HTMLVideoElement | null => {
        if (!videoRef.current) return null;
        return videoRef.current instanceof HTMLVideoElement
            ? videoRef.current
            : (videoRef.current as any)?.video || null;
    }, [videoRef]);

    // Detect swipe direction
    const detectSwipeDirection = useCallback((deltaX: number, deltaY: number): "left" | "right" | "up" | "down" | null => {
        if (Math.abs(deltaX) > GESTURE_CONFIG.SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX < -GESTURE_CONFIG.SWIPE_THRESHOLD ? "left" : deltaX > GESTURE_CONFIG.SWIPE_THRESHOLD ? "right" : null;
        } else if (Math.abs(deltaY) > GESTURE_CONFIG.SWIPE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
            return deltaY < -GESTURE_CONFIG.SWIPE_THRESHOLD ? "up" : deltaY > GESTURE_CONFIG.SWIPE_THRESHOLD ? "down" : null;
        }
        return null;
    }, []);

    // Process gesture results
    const processGestureResult = useCallback(
        (results: GestureRecognizerResult, currentTime: number) => {
            if (!results.gestures.length || !results.landmarks?.length) {
                setGesture(null);
                setHandPosition(null);
                setIsPointing(false);
                swipeStartPosRef.current = null;
                lastGestureRef.current = null;
                return;
            }

            const topGesture = results.gestures[0][0];
            const handLandmarks = results.landmarks[0];
            const indexFingerTip = handLandmarks[8];

            // Update hand position
            setHandPosition({ x: indexFingerTip.x, y: indexFingerTip.y });

            if (topGesture.score > GESTURE_CONFIG.MIN_GESTURE_CONFIDENCE) {
                setGesture(topGesture.categoryName);

                // Detect pointing gesture
                setIsPointing(topGesture.categoryName === "Pointing_Up");

                // Handle navigation gestures
                const validNavigationGestures = ["Pointing_Up", "Open_Palm"];
                if (
                    validNavigationGestures.includes(topGesture.categoryName) &&
                    currentTime > gestureCooldownRef.current
                ) {
                    const indexTip = handLandmarks[8];

                    if (!swipeStartPosRef.current || !validNavigationGestures.includes(lastGestureRef.current || "")) {
                        swipeStartPosRef.current = { x: indexTip.x, y: indexTip.y };
                    }

                    if (swipeStartPosRef.current) {
                        const deltaX = indexTip.x - swipeStartPosRef.current.x;
                        const deltaY = indexTip.y - swipeStartPosRef.current.y;
                        const direction = detectSwipeDirection(deltaX, deltaY);

                        if (direction) {
                            setSwipeDirection(direction);
                            gestureCooldownRef.current = currentTime + GESTURE_CONFIG.SWIPE_COOLDOWN;
                            swipeStartPosRef.current = null;

                            // Clear swipe direction after timeout
                            if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
                            swipeTimeoutRef.current = setTimeout(
                                () => setSwipeDirection(null),
                                GESTURE_CONFIG.SWIPE_TIMEOUT
                            );
                        }
                    }
                } else if (!validNavigationGestures.includes(topGesture.categoryName)) {
                    swipeStartPosRef.current = null;
                }

                lastGestureRef.current = topGesture.categoryName;
            } else {
                setGesture(null);
                setIsPointing(false);
                swipeStartPosRef.current = null;
                lastGestureRef.current = null;
            }
        },
        [detectSwipeDirection]
    );

    // Main detection loop with throttling
    useEffect(() => {
        if (!gestureRecognizer) return;

        const detect = () => {
            const videoEl = getVideoElement();

            if (videoEl && videoEl.readyState === 4) {
                const currentTime = performance.now();

                // Throttle detection to target FPS
                if (currentTime - lastDetectionTimeRef.current >= detectionIntervalRef.current) {
                    lastDetectionTimeRef.current = currentTime;

                    try {
                        const results = gestureRecognizer.recognizeForVideo(videoEl, currentTime);
                        processGestureResult(results, Date.now());
                    } catch (error) {
                        console.error("[MediaPipe] Gesture recognition error:", error);
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
            if (swipeTimeoutRef.current) {
                clearTimeout(swipeTimeoutRef.current);
            }
        };
    }, [gestureRecognizer, getVideoElement, processGestureResult]);

    return {
        gesture,
        swipeDirection,
        handPosition,
        isPointing,
        isModelLoading: !gestureRecognizer,
    };
};

