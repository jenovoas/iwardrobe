"use client";

import { useEffect, useRef, useState } from "react";
import {
    GestureRecognizer,
    FilesetResolver,
    GestureRecognizerResult,
} from "@mediapipe/tasks-vision";

export const useHandGestures = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
    const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
    const [gesture, setGesture] = useState<string | null>(null);
    const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
    const requestRef = useRef<number>(0);
    const lastXRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

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
                const results: GestureRecognizerResult = gestureRecognizer.recognizeForVideo(
                    videoRef.current,
                    Date.now()
                );

                if (results.gestures.length > 0) {
                    const topGesture = results.gestures[0][0];
                    if (topGesture && topGesture.score > 0.5) {
                        setGesture(topGesture.categoryName);

                        // Swipe Detection Logic
                        if (topGesture.categoryName === "Open_Palm" && results.landmarks && results.landmarks.length > 0) {
                            const handLandmarks = results.landmarks[0];
                            const wrist = handLandmarks[0]; // Wrist landmark
                            const currentX = wrist.x;
                            const currentTime = Date.now();

                            if (lastXRef.current !== null) {
                                const deltaX = currentX - lastXRef.current;
                                const deltaTime = currentTime - lastTimeRef.current;
                                const velocity = deltaX / deltaTime; // Units per ms

                                // Thresholds (adjust as needed)
                                // Note: X increases from left to right (0 to 1)
                                // But in mirrored video, it might be flipped. 
                                // Usually MediaPipe returns normalized coordinates [0, 1].
                                // If mirrored: Left side of screen is x=1, Right is x=0? Or standard?
                                // Let's assume standard: 0 (left) -> 1 (right).
                                // Swipe Right: x increases.

                                if (Math.abs(deltaX) > 0.05 && deltaTime < 200) {
                                    if (deltaX < -0.05) { // Moving Left (in camera view, might be Right in mirror?)
                                        // If mirrored, moving hand right (user's right) means x decreases?
                                        // Let's test standard first.
                                        // Actually, let's just expose the direction and flip if needed in UI.
                                        // Standard: x increases -> Right.
                                        setSwipeDirection("right");
                                        setTimeout(() => setSwipeDirection(null), 1000); // Reset after 1s
                                    } else if (deltaX > 0.05) {
                                        setSwipeDirection("left");
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
                        lastXRef.current = null;
                    }
                } else {
                    setGesture(null);
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

    return { gesture, swipeDirection };
};
