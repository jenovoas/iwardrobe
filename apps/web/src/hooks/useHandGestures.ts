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

export const useHandGestures = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
    const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
    const [gesture, setGesture] = useState<string | null>(null);
    const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
    const [handPosition, setHandPosition] = useState<HandPosition | null>(null);
    const [isPointing, setIsPointing] = useState(false);
    const requestRef = useRef<number>(0);
    const lastXRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
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
                    });
                }

                if (recognizer) {
                    console.log(`Gesture recognizer initialized with ${delegate} delegate`);
                    setGestureRecognizer(recognizer);
                }
            } catch (error) {
                console.error("Failed to create gesture recognizer:", error);
            }
        };

        createGestureRecognizer();
    }, []);

    useEffect(() => {
        if (!gestureRecognizer || !videoRef.current) return;

        const detect = () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                // Use performance.now() for monotonically increasing timestamps
                const currentTimestamp = performance.now();

                // Ensure timestamp is always increasing
                if (currentTimestamp <= lastTimestampRef.current) {
                    requestRef.current = requestAnimationFrame(detect);
                    return;
                }

                const results: GestureRecognizerResult = gestureRecognizer.recognizeForVideo(
                    videoRef.current,
                    currentTimestamp
                );
                lastTimestampRef.current = currentTimestamp;

                const currentTime = Date.now();

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

                        // Swipe Detection Logic
                        if (topGesture.categoryName === "Open_Palm" && currentTime > gestureCooldownRef.current) {
                            const wrist = handLandmarks[0]; // Wrist landmark
                            const currentX = wrist.x;

                            if (lastXRef.current !== null) {
                                const deltaX = currentX - lastXRef.current;
                                const deltaTime = currentTime - lastTimeRef.current;
                                const velocity = deltaX / deltaTime; // Units per ms

                                // Thresholds for swipe detection
                                if (Math.abs(deltaX) > 0.15 && deltaTime < 300) {
                                    if (deltaX < -0.15) {
                                        setSwipeDirection("left");
                                        gestureCooldownRef.current = currentTime + 1000; // 1s cooldown
                                        setTimeout(() => setSwipeDirection(null), 1000);
                                    } else if (deltaX > 0.15) {
                                        setSwipeDirection("right");
                                        gestureCooldownRef.current = currentTime + 1000;
                                        setTimeout(() => setSwipeDirection(null), 1000);
                                    }
                                }
                            }

                            lastXRef.current = currentX;
                            lastTimeRef.current = currentTime;
                        } else {
                            lastXRef.current = null;
                        }
                    } else {
                        setGesture(null);
                        setIsPointing(false);
                        lastXRef.current = null;
                    }
                } else {
                    setGesture(null);
                    setHandPosition(null);
                    setIsPointing(false);
                    lastXRef.current = null;
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
    }, [gestureRecognizer, videoRef]);

    return { gesture, swipeDirection, handPosition, isPointing };
};
