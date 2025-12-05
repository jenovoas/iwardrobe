import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAmbientLight } from '@/hooks/useAmbientLight';
import { User } from 'lucide-react';

interface BeardStyle {
    id: string;
    name: string;
    icon: string;
}

interface BeardStyleWidgetProps {
    videoRef?: React.RefObject<HTMLVideoElement | null>;
    isFocused?: boolean;
    swipeDirection?: "left" | "right" | "up" | "down" | null;
}

const beardStyles: BeardStyle[] = [
    { id: '1', name: 'Barba Completa', icon: '🧔' },
    { id: '2', name: 'Barba Corta', icon: '🧔‍♂️' },
    { id: '3', name: 'Perilla', icon: '👨‍🦰' },
    { id: '4', name: 'Afeitado', icon: '🪒' },
];

const BeardStyleWidget: React.FC<BeardStyleWidgetProps> = ({ videoRef, isFocused = false, swipeDirection }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const { lightLevel, colorScheme, isMounted } = useAmbientLight(videoRef);

    React.useEffect(() => {
        if (!isFocused) return;
        if (swipeDirection === "right") {
            setIsExpanded(true);
        } else if (swipeDirection === "left") {
            setIsExpanded(false);
        }
    }, [swipeDirection, isFocused]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className={`w-full max-w-[220px] mt-2 transition-all duration-300 ${isFocused ? 'scale-105 ring-2 ring-white/30 rounded-xl p-2 bg-white/5' : 'opacity-80'}`}
        >
            <motion.div
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                    flex items-center justify-between p-3 rounded-xl border 
                    transition-all duration-500 cursor-pointer group relative backdrop-blur-md
                    ${!isMounted
                        ? isExpanded
                            ? 'bg-white/15 border-white/10 shadow-lg'
                            : 'bg-white/10 border-white/10 hover:bg-white/15'
                        : isExpanded
                            ? `${colorScheme.categoryExpandedBg} ${colorScheme.categoryBorder} shadow-lg`
                            : `${colorScheme.categoryBg} ${colorScheme.categoryBorder} ${colorScheme.categoryBgHover}`
                    }
                `}
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <span className={`text-2xl transition-transform block ${isExpanded ? 'scale-110' : 'group-hover:scale-105'}`}>🧔</span>
                    </motion.div>
                    <span className={`text-sm font-light ${isExpanded ? 'font-medium' : (isMounted ? colorScheme.textOpacity : 'opacity-80')}`}>
                        Estilo de Barba
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold opacity-60 ${isMounted ? colorScheme.indicatorBg : 'bg-white/10'} px-2 py-0.5 rounded-full`}>
                        {beardStyles.length}
                    </span>
                    <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-xs opacity-60"
                    >
                        ▼
                    </motion.span>
                </div>
            </motion.div>

            {/* Expanded Items */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="ml-4 mt-2 space-y-1">
                            {beardStyles.map((style) => {
                                const isSelected = selectedStyle === style.id;

                                return (
                                    <motion.div
                                        key={style.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => setSelectedStyle(style.id)}
                                        className={`
                                            flex items-center justify-between p-2 rounded-md
                                            transition-all duration-500 cursor-pointer backdrop-blur-md
                                            ${!isMounted
                                                ? isSelected
                                                    ? `${colorScheme.itemHoveredBg} border ${colorScheme.itemHoveredBorder}`
                                                    : 'bg-white/10 hover:bg-white/15'
                                                : isSelected
                                                    ? `${colorScheme.itemHoveredBg} border ${colorScheme.itemHoveredBorder}`
                                                    : `${colorScheme.itemBg} ${colorScheme.itemBgHover}`
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isSelected ? (isMounted ? colorScheme.accentColor : 'bg-white/40') : 'bg-white/20'}`} />
                                            <span className={`text-xs ${isMounted ? colorScheme.textOpacity : 'opacity-80'}`}>{style.name}</span>
                                        </div>
                                        <span className="text-xl">{style.icon}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BeardStyleWidget;
