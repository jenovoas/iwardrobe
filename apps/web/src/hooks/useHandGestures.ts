"use client";

import { useEffect, useRef, useState } from "react";
import {
    GestureRecognizer,
    FilesetResolver,
    GestureRecognizerResult,
} from "@mediapipe/tasks-vision";

export interface HandPosition {
    x: number; // 0-1 normalized
    y: number; // 0-1 normalized
}

import Webcam from "react-webcam";
export const useHandGestures = (videoRef: React.RefObject<HTMLVideoElement | null> | React.RefObject<Webcam | null>) => {
    const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
    const [gesture, setGesture] = useState<string | null>(null);
    const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | "up" | "down" | null>(null);
    const [handPosition, setHandPosition] = useState<HandPosition | null>(null);
    const [isPointing, setIsPointing] = useState(false);
    const requestRef = useRef<number>(0);
    const swipeStartPosRef = useRef<HandPosition | null>(null);
    const lastGestureRef = useRef<string | null>(null);
    const gestureCooldownRef = useRef<number>(0);
    const lastTimestampRef = useRef<number>(0);

    useEffect(() => {
        const createGestureRecognizer = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );

                // Try GPU first, fallback to CPU for better browser compatibility
                let recognizer: GestureRecognizer | null = null;
                let delegate: "GPU" | "CPU" = "GPU";

                try {
                    recognizer = await GestureRecognizer.createFromOptions(vision, {
                        baseOptions: {
                            modelAssetPath:
                                "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                            delegate: "GPU",
                        },
                        runningMode: "VIDEO",
                        numHands: 1, // Added numHands: 1 as per the provided snippet
                    });
                } catch (gpuError) {
                    console.warn("GPU delegate failed, falling back to CPU:", gpuError);
                    delegate = "CPU";
                    recognizer = await GestureRecognizer.createFromOptions(vision, {
                        baseOptions: {
                            modelAssetPath:
                                "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                            delegate: "CPU",
                        },
                        runningMode: "VIDEO",
                        numHands: 1, // Added numHands: 1 as per the provided snippet
                    });
                }

                if (recognizer) {
                    console.log(`Gesture recognizer initialized with ${delegate} delegate`);
                    setGestureRecognizer(recognizer);
                    console.log("Gesture Recognizer Loaded Successfully!");
                }
            } catch (error) {
                console.error("Error initializing gesture recognizer:", error);
            }
        };

        createGestureRecognizer();
    }, []);

    useEffect(() => {
        if (!gestureRecognizer) return;

        const detect = () => {
            const videoEl = (videoRef.current instanceof HTMLVideoElement)
                ? videoRef.current
                : (videoRef.current as any)?.video;

            // Debug video state
            if (!videoEl) {
                // console.log("Detection Loop: Video Element is null");
            } else if (videoEl.readyState !== 4) {
                // console.log("Detection Loop: Video not ready", videoEl.readyState);
            }

            if (videoEl && videoEl.readyState === 4) {
                // Use performance.now() for monotonically increasing timestamps
                const currentTimestamp = performance.now();

                // Throttle detection to ~30 FPS (every 30ms) for smoother tracking
                if (currentTimestamp - lastTimestampRef.current < 30) {
                    requestRef.current = requestAnimationFrame(detect);
                    return;
                }

                lastTimestampRef.current = currentTimestamp;

                try {
                    const results: GestureRecognizerResult = gestureRecognizer.recognizeForVideo(
                        videoEl,
                        currentTimestamp
                    );

                    const currentTime = Date.now();

                    if (results.gestures.length > 0) {
                        // Log detection for debugging
                        // console.log("Gesture detected:", results.gestures[0][0].categoryName);
                    }

                    if (results.gestures.length > 0 && results.landmarks && results.landmarks.length > 0) {
                        const topGesture = results.gestures[0][0];
                        const handLandmarks = results.landmarks[0];

                        // Track index finger tip position (landmark 8)
                        const indexFingerTip = handLandmarks[8];
                        setHandPosition({ x: indexFingerTip.x, y: indexFingerTip.y });

                        if (topGesture && topGesture.score > 0.5) {
                            setGesture(topGesture.categoryName);

                            // Detect Pointing Gesture (index finger extended)
                            if (topGesture.categoryName === "Pointing_Up") {
                                setIsPointing(true);
                            } else {
                                setIsPointing(false);
                            }

                            // Swipe Detection Logic (Accumulated Displacement)
                            if (topGesture.categoryName === "Pointing_Up" && currentTime > gestureCooldownRef.current) {
                                const indexTip = handLandmarks[8]; // Index finger tip
                                const currentX = indexTip.x;
                                const currentY = indexTip.y;

                                // Initialize start position if new gesture or just started
                                if (!swipeStartPosRef.current || lastGestureRef.current !== "Pointing_Up") {
                                    swipeStartPosRef.current = { x: currentX, y: currentY };
                                }

                                if (swipeStartPosRef.current) {
                                    const deltaX = currentX - swipeStartPosRef.current.x;
                                    const deltaY = currentY - swipeStartPosRef.current.y;

                                    // Thresholds (Displacement based)
                                    // 0.10 means moving 10% of the screen width/height
                                    const SWIPE_THRESHOLD = 0.10;

                                    // Horizontal Swipe
                                    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
                                        if (deltaX < -SWIPE_THRESHOLD) {
                                            setSwipeDirection("left");
                                            console.log("Swipe Left Detected");
                                        } else if (deltaX > SWIPE_THRESHOLD) {
                                            setSwipeDirection("right");
                                            console.log("Swipe Right Detected");
                                        }
                                        gestureCooldownRef.current = currentTime + 400; // Cooldown after successful swipe
                                        swipeStartPosRef.current = null; // Reset start position
                                        setTimeout(() => setSwipeDirection(null), 1000);
                                    }
                                    // Vertical Swipe
                                    else if (Math.abs(deltaY) > SWIPE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
                                        if (deltaY < -SWIPE_THRESHOLD) {
                                            setSwipeDirection("up");
                                            console.log("Swipe Up Detected");
                                        } else if (deltaY > SWIPE_THRESHOLD) {
                                            setSwipeDirection("down");
                                            console.log("Swipe Down Detected");
                                        }
                                        gestureCooldownRef.current = currentTime + 400;
                                        swipeStartPosRef.current = null;
                                        setTimeout(() => setSwipeDirection(null), 1000);
                                    }
                                }
                            } else {
                                // Reset if not Pointing_Up
                                if (topGesture.categoryName !== "Pointing_Up") {
                                    swipeStartPosRef.current = null;
                                }
                            }

                            lastGestureRef.current = topGesture.categoryName;
                        } else {
                            setGesture(null);
                            setIsPointing(false);
                            swipeStartPosRef.current = null;
                            lastGestureRef.current = null;
                        }
                    } else {
                        setGesture(null);
                        setHandPosition(null);
                        setIsPointing(false);
                        swipeStartPosRef.current = null;
                        lastGestureRef.current = null;
                    }
                } catch (error) {
                    console.error("Error recognizing gestures:", error);
                }
            } else {
                //  console.log("Waiting for video ready...", videoRef.current?.readyState);
            }
            requestRef.current = requestAnimationFrame(detect);
        };

        detect();

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [gestureRecognizer, videoRef]);

    return { gesture, swipeDirection, handPosition, isPointing, isModelLoading: !gestureRecognizer };
};
