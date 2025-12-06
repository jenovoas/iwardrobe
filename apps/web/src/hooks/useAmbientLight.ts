import { useState, useEffect, useRef, useCallback } from 'react';

export type LightLevel = 'dark' | 'normal' | 'bright';

export interface ColorScheme {
    categoryBg: string;
    categoryBgHover: string;
    categoryBorder: string;
    categorySelectedBg: string;
    categorySelectedBorder: string;
    categoryExpandedBg: string;
    itemBg: string;
    itemBgHover: string;
    itemHoveredBg: string;
    itemHoveredBorder: string;
    accentColor: string;
    textOpacity: string;
    indicatorBg: string;
}

// Memoized color schemes for better performance
const COLOR_SCHEMES: Record<LightLevel, ColorScheme> = {
    dark: {
        categoryBg: 'bg-white/5',
        categoryBgHover: 'hover:bg-white/10',
        categoryBorder: 'border-white/5',
        categorySelectedBg: 'bg-white/15',
        categorySelectedBorder: 'border-white/20',
        categoryExpandedBg: 'bg-white/15',
        itemBg: 'bg-white/5',
        itemBgHover: 'hover:bg-white/10',
        itemHoveredBg: 'bg-white/20',
        itemHoveredBorder: 'border-white/30',
        accentColor: 'bg-white/40',
        textOpacity: 'opacity-80',
        indicatorBg: 'bg-white/10',
    },
    normal: {
        categoryBg: 'bg-white/10',
        categoryBgHover: 'hover:bg-white/20',
        categoryBorder: 'border-white/10',
        categorySelectedBg: 'bg-white/20',
        categorySelectedBorder: 'border-white/30',
        categoryExpandedBg: 'bg-white/20',
        itemBg: 'bg-white/10',
        itemBgHover: 'hover:bg-white/20',
        itemHoveredBg: 'bg-white/25',
        itemHoveredBorder: 'border-white/40',
        accentColor: 'bg-white/50',
        textOpacity: 'opacity-90',
        indicatorBg: 'bg-white/15',
    },
    bright: {
        categoryBg: 'bg-gray-900/80',
        categoryBgHover: 'hover:bg-gray-900/90',
        categoryBorder: 'border-gray-700/80',
        categorySelectedBg: 'bg-gray-800/90',
        categorySelectedBorder: 'border-gray-600/90',
        categoryExpandedBg: 'bg-gray-800/85',
        itemBg: 'bg-gray-900/70',
        itemBgHover: 'hover:bg-gray-900/85',
        itemHoveredBg: 'bg-gray-800/80',
        itemHoveredBorder: 'border-gray-600/80',
        accentColor: 'bg-gray-600',
        textOpacity: 'opacity-100',
        indicatorBg: 'bg-gray-700/60',
    },
};

// Configuration for brightness analysis
const BRIGHTNESS_CONFIG = {
    UPDATE_INTERVAL: 2000, // ms
    CANVAS_WIDTH: 80, // Reduced for faster processing
    CANVAS_HEIGHT: 60,
    BRIGHTNESS_DARK_THRESHOLD: 60,
    BRIGHTNESS_BRIGHT_THRESHOLD: 140,
};

export function useAmbientLight(videoRef?: React.RefObject<HTMLVideoElement | null>) {
    const [isMounted, setIsMounted] = useState(false);
    const [lightLevel, setLightLevel] = useState<LightLevel>('normal');
    const [manualOverride, setManualOverride] = useState<LightLevel | null>(null);
    const [colorScheme, setColorScheme] = useState<ColorScheme>(COLOR_SCHEMES.normal);

    // Performance refs
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(0);

    // Set mounted state on client side only
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    // Update color scheme when manual override or light level changes
    useEffect(() => {
        if (!isMounted) return;

        const effectiveLevel = manualOverride || lightLevel;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setColorScheme(COLOR_SCHEMES[effectiveLevel]);
    }, [lightLevel, manualOverride, isMounted]);

    // Analyze brightness with better performance
    const analyzeBrightness = useCallback(() => {
        if (!videoRef?.current || !isMounted) return;

        const video = videoRef.current;
        const now = Date.now();

        // Check update interval
        if (now - lastUpdateRef.current < BRIGHTNESS_CONFIG.UPDATE_INTERVAL) {
            return;
        }

        // Skip if video is not ready
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            return;
        }

        try {
            // Create or reuse canvas
            if (!canvasRef.current) {
                canvasRef.current = document.createElement('canvas');
                canvasRef.current.width = BRIGHTNESS_CONFIG.CANVAS_WIDTH;
                canvasRef.current.height = BRIGHTNESS_CONFIG.CANVAS_HEIGHT;
            }

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Calculate average brightness using luminance formula
            let totalBrightness = 0;
            const pixelCount = data.length / 4;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b;
            }

            const avgBrightness = totalBrightness / pixelCount;

            // Determine light level
            let newLightLevel: LightLevel;
            if (avgBrightness < BRIGHTNESS_CONFIG.BRIGHTNESS_DARK_THRESHOLD) {
                newLightLevel = 'dark';
            } else if (avgBrightness < BRIGHTNESS_CONFIG.BRIGHTNESS_BRIGHT_THRESHOLD) {
                newLightLevel = 'normal';
            } else {
                newLightLevel = 'bright';
            }

            // Update state only if changed
            if (newLightLevel !== lightLevel) {
                setLightLevel(newLightLevel);
            }

            lastUpdateRef.current = now;
        } catch (error) {
            console.error('[AmbientLight] Error analyzing brightness:', error);
        }
    }, [videoRef, lightLevel, isMounted]);

    // Set up brightness analysis loop
    useEffect(() => {
        if (!isMounted || !videoRef?.current || manualOverride) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            return;
        }

        const analyzeLoop = () => {
            analyzeBrightness();
            animationFrameRef.current = requestAnimationFrame(analyzeLoop);
        };

        analyzeLoop();

        // Cleanup
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [isMounted, videoRef, manualOverride, analyzeBrightness]);

    // Toggle light mode
    const toggleLightMode = useCallback(() => {
        setManualOverride(prev => {
            if (!prev) return 'bright';
            if (prev === 'bright') return 'normal';
            if (prev === 'normal') return 'dark';
            return null;
        });
    }, []);

    const effectiveLightLevel = manualOverride || lightLevel;

    return {
        lightLevel: effectiveLightLevel,
        colorScheme,
        isMounted,
        toggleLightMode,
        isManualMode: manualOverride !== null,
        autoDetectedLevel: lightLevel,
    };
}


