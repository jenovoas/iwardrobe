import { useState, useEffect, useRef } from 'react';

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

const COLOR_SCHEMES: Record<LightLevel, ColorScheme> = {
    dark: {
        categoryBg: 'bg-white/5',
        categoryBgHover: 'hover:bg-white/10',
        categoryBorder: 'border-white/5',
        categorySelectedBg: 'bg-blue-500/30',
        categorySelectedBorder: 'border-blue-400/50',
        categoryExpandedBg: 'bg-white/15',
        itemBg: 'bg-white/5',
        itemBgHover: 'hover:bg-white/10',
        itemHoveredBg: 'bg-blue-500/20',
        itemHoveredBorder: 'border-blue-400/30',
        accentColor: 'bg-blue-400',
        textOpacity: 'opacity-80',
        indicatorBg: 'bg-white/10',
    },
    normal: {
        categoryBg: 'bg-white/10',
        categoryBgHover: 'hover:bg-white/20',
        categoryBorder: 'border-white/10',
        categorySelectedBg: 'bg-blue-500/40',
        categorySelectedBorder: 'border-blue-400/60',
        categoryExpandedBg: 'bg-white/20',
        itemBg: 'bg-white/10',
        itemBgHover: 'hover:bg-white/20',
        itemHoveredBg: 'bg-blue-500/30',
        itemHoveredBorder: 'border-blue-400/40',
        accentColor: 'bg-blue-400',
        textOpacity: 'opacity-90',
        indicatorBg: 'bg-white/15',
    },
    bright: {
        categoryBg: 'bg-gray-900/80',
        categoryBgHover: 'hover:bg-gray-900/90',
        categoryBorder: 'border-gray-700/80',
        categorySelectedBg: 'bg-blue-600/70',
        categorySelectedBorder: 'border-blue-500/90',
        categoryExpandedBg: 'bg-gray-800/85',
        itemBg: 'bg-gray-900/70',
        itemBgHover: 'hover:bg-gray-900/85',
        itemHoveredBg: 'bg-blue-600/60',
        itemHoveredBorder: 'border-blue-500/80',
        accentColor: 'bg-blue-500',
        textOpacity: 'opacity-100',
        indicatorBg: 'bg-gray-700/60',
    },
};

export function useAmbientLight(videoRef?: React.RefObject<HTMLVideoElement | null>) {
    const [isMounted, setIsMounted] = useState(false);
    const [lightLevel, setLightLevel] = useState<LightLevel>('normal');
    const [manualOverride, setManualOverride] = useState<LightLevel | null>(null);
    // Always start with normal scheme to match SSR
    const [colorScheme, setColorScheme] = useState<ColorScheme>(COLOR_SCHEMES.normal);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(0);

    // Set mounted state on client side only
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Update color scheme when manual override or light level changes
    // Only update after component is mounted to avoid hydration mismatch
    useEffect(() => {
        if (!isMounted) return;

        const effectiveLevel = manualOverride || lightLevel;
        setColorScheme(COLOR_SCHEMES[effectiveLevel]);
    }, [lightLevel, manualOverride, isMounted]);

    useEffect(() => {
        // Don't run until mounted on client or if manual override is active
        if (!isMounted || !videoRef?.current || manualOverride) {
            return;
        }

        // Create a canvas for analyzing video brightness
        if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
            canvasRef.current.width = 160;
            canvasRef.current.height = 120;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) return;

        const analyzeBrightness = () => {
            const video = videoRef.current;
            const now = Date.now();

            // Only update every 2 seconds to avoid rapid changes
            if (now - lastUpdateRef.current < 2000) {
                animationFrameRef.current = requestAnimationFrame(analyzeBrightness);
                return;
            }

            if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
                try {
                    // Draw the current video frame to canvas
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // Get image data
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Calculate average brightness
                    let totalBrightness = 0;
                    const pixelCount = data.length / 4;

                    for (let i = 0; i < data.length; i += 4) {
                        // Calculate perceived brightness using luminance formula
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
                        totalBrightness += brightness;
                    }

                    const avgBrightness = totalBrightness / pixelCount;

                    // Determine light level based on brightness thresholds
                    let newLightLevel: LightLevel;
                    if (avgBrightness < 60) {
                        newLightLevel = 'dark';
                    } else if (avgBrightness < 140) {
                        newLightLevel = 'normal';
                    } else {
                        newLightLevel = 'bright';
                    }

                    // Only update if the level changed
                    if (newLightLevel !== lightLevel) {
                        setLightLevel(newLightLevel);
                    }

                    lastUpdateRef.current = now;
                } catch (error) {
                    console.error('Error analyzing brightness:', error);
                }
            }

            animationFrameRef.current = requestAnimationFrame(analyzeBrightness);
        };

        // Start analyzing
        analyzeBrightness();

        // Cleanup
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isMounted, videoRef, lightLevel, manualOverride]);

    const toggleLightMode = () => {
        if (!manualOverride) {
            // Start with bright mode when enabling manual override
            setManualOverride('bright');
        } else if (manualOverride === 'bright') {
            setManualOverride('normal');
        } else if (manualOverride === 'normal') {
            setManualOverride('dark');
        } else {
            // Return to auto mode
            setManualOverride(null);
        }
    };

    const effectiveLightLevel = manualOverride || lightLevel;

    return {
        lightLevel: effectiveLightLevel,
        colorScheme,
        isMounted,
        toggleLightMode,
        isManualMode: manualOverride !== null,
        autoDetectedLevel: lightLevel
    };
}

