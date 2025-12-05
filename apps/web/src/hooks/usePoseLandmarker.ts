"use client";

import { useEffect, useRef, useState } from "react";
import {
    PoseLandmarker,
    FilesetResolver,
    PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

export const usePoseLandmarker = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
    const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
    const [landmarks, setLandmarks] = useState<PoseLandmarkerResult | null>(null);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        const createPoseLandmarker = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );
                
                // Try GPU first, fallback to CPU for better browser compatibility
                let landmarker: PoseLandmarker | null = null;
                let delegate: "GPU" | "CPU" = "GPU";
                
                try {
                    landmarker = await PoseLandmarker.createFromOptions(vision, {
                        baseOptions: {
                            modelAssetPath:
                                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
                            delegate: "GPU",
                        },
                        runningMode: "VIDEO",
                    });
                } catch (gpuError) {
                    console.warn("GPU delegate failed, falling back to CPU:", gpuError);
                    delegate = "CPU";
                    landmarker = await PoseLandmarker.createFromOptions(vision, {
                        baseOptions: {
                            modelAssetPath:
                                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
                            delegate: "CPU",
                        },
                        runningMode: "VIDEO",
                    });
                }
                
                if (landmarker) {
                    console.log(`Pose landmarker initialized with ${delegate} delegate`);
                    setPoseLandmarker(landmarker);
                }
            } catch (error) {
                console.error("Failed to create pose landmarker:", error);
            }
        };

        createPoseLandmarker();
    }, []);

    useEffect(() => {
        if (!poseLandmarker || !videoRef.current) return;

        const detect = () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                const results = poseLandmarker.detectForVideo(
                    videoRef.current,
                    Date.now()
                );
                setLandmarks(results);
            }
            requestRef.current = requestAnimationFrame(detect);
        };

        detect();

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [poseLandmarker, videoRef]);

    return { landmarks };
};
