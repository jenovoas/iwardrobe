import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ColorScheme } from '@/hooks/useAmbientLight';
import { useWidgetTheme } from '@/hooks/useWidgetTheme';
import { Scissors, User } from 'lucide-react';

interface HairStyle {
    id: string;
    name: string;
    icon: React.ReactNode;
}

interface HairStyleWidgetProps {
    isFocused?: boolean;
    swipeDirection?: "left" | "right" | "up" | "down" | null;
    lightLevel: string;
    colorScheme: ColorScheme;
    isMounted: boolean;
}

const hairStyles: HairStyle[] = [
    { id: '1', name: 'Corte Clásico', icon: <Scissors className="w-5 h-5" /> },
    { id: '2', name: 'Fade Moderno', icon: <Scissors className="w-5 h-5 rotate-90" /> },
    { id: '3', name: 'Cabello Largo', icon: <User className="w-5 h-5" /> },
    { id: '4', name: 'Buzz Cut', icon: <Scissors className="w-5 h-5 -rotate-45" /> },
    { id: '5', name: 'Pompadour', icon: <User className="w-5 h-5 scale-110" /> },
    { id: '6', name: 'Flequillo', icon: <User className="w-5 h-5 -rotate-12" /> },
    { id: '7', name: 'Undercut', icon: <Scissors className="w-5 h-5 rotate-180" /> },
];

const HairStyleWidget: React.FC<HairStyleWidgetProps> = ({ isFocused = false, swipeDirection, colorScheme, isMounted }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

    const theme = useWidgetTheme({
        colorScheme,
        isMounted,
        isExpanded
    });

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
            transition={{ delay: 0.6 }}
            className={`w-full max-w-[220px] mt-6 transition-all duration-300 ${isFocused ? 'scale-105 ring-2 ring-white/30 rounded-xl p-2 bg-white/5' : 'opacity-80'}`}
        >
            <motion.div
                onClick={() => setIsExpanded(!isExpanded)}
                className={theme.containerClass}
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: -15 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Scissors className={`w-6 h-6 transition-transform block ${isExpanded ? 'scale-110' : 'group-hover:scale-105'}`} />
                    </motion.div>
                    <span className={theme.headerTextClass}>
                        Estilo de Cabello
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={theme.indicatorClass}>
                        {hairStyles.length}
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
                            {hairStyles.map((style) => {
                                const isSelected = selectedStyle === style.id;

                                return (
                                    <HairStyleItem
                                        key={style.id}
                                        style={style}
                                        isSelected={isSelected}
                                        setSelectedStyle={setSelectedStyle}
                                        colorScheme={colorScheme}
                                        isMounted={isMounted}
                                    />
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

interface HairStyleItemProps {
    style: HairStyle;
    isSelected: boolean;
    setSelectedStyle: React.Dispatch<React.SetStateAction<string | null>>;
    colorScheme: ColorScheme;
    isMounted: boolean;
}

const HairStyleItem = ({ style, isSelected, setSelectedStyle, colorScheme, isMounted }: HairStyleItemProps) => {
    const theme = useWidgetTheme({
        colorScheme,
        isMounted,
        isExpanded: false,
        isSelected
    });

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedStyle(style.id)}
            className={theme.itemClass}
        >
            <div className="flex items-center gap-2">
                <div className={theme.accentColorClass} />
                <span className={theme.itemTextClass}>{style.name}</span>
            </div>
            <span className="text-xl">{style.icon}</span>
        </motion.div>
    );
}

export default HairStyleWidget;

