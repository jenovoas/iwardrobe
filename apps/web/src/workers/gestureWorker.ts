/**
 * Web Worker for offloading MediaPipe gesture recognition
 * This prevents blocking the main thread during heavy ML inference
 */

let gestureRecognizer: any = null;
let isInitialized = false;

// Listen for initialization message from main thread
self.onmessage = async (event: MessageEvent) => {
    const { type, payload } = event.data;

    switch (type) {
        case "INIT":
            await initializeGestureRecognizer();
            self.postMessage({ type: "INIT_COMPLETE", isInitialized });
            break;

        case "DETECT":
            if (gestureRecognizer && payload.frameData) {
                await detectGestures(payload.frameData, payload.timestamp);
            }
            break;

        case "CLEANUP":
            cleanupWorker();
            break;

        default:
            console.warn("[Worker] Unknown message type:", type);
    }
};

async function initializeGestureRecognizer() {
    try {
        // Import MediaPipe libraries
        const { GestureRecognizer, FilesetResolver } = await import(
            "@mediapipe/tasks-vision"
        );

        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        // Try GPU first, fallback to CPU
        try {
            gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                    delegate: "GPU",
                },
                runningMode: "VIDEO",
                numHands: 1,
                minHandDetectionConfidence: 0.3,
                minTrackingConfidence: 0.3,
            });
            console.log("[Worker] Gesture recognizer initialized with GPU");
        } catch (gpuError) {
            console.warn("[Worker] GPU failed, using CPU");
            gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                    delegate: "CPU",
                },
                runningMode: "VIDEO",
                numHands: 1,
                minHandDetectionConfidence: 0.3,
                minTrackingConfidence: 0.3,
            });
        }

        isInitialized = true;
    } catch (error) {
        console.error("[Worker] Failed to initialize gesture recognizer:", error);
        isInitialized = false;
    }
}

async function detectGestures(frameData: any, timestamp: number) {
    if (!gestureRecognizer) return;

    try {
        const results = gestureRecognizer.recognizeForVideo(frameData, timestamp);

        // Send results back to main thread
        self.postMessage({
            type: "DETECTION_RESULT",
            payload: {
                gestures: results.gestures,
                landmarks: results.landmarks,
                timestamp,
            },
        });
    } catch (error) {
        console.error("[Worker] Detection error:", error);
        self.postMessage({
            type: "DETECTION_ERROR",
            payload: { error: String(error) },
        });
    }
}

function cleanupWorker() {
    if (gestureRecognizer) {
        gestureRecognizer.close();
        gestureRecognizer = null;
    }
    isInitialized = false;
}

// Export for TypeScript
export {};
