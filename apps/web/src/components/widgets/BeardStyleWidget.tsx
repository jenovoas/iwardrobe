import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ColorScheme } from '@/hooks/useAmbientLight';
import { useWidgetTheme } from '@/hooks/useWidgetTheme';
import { User } from 'lucide-react';

interface BeardStyle {
    id: string;
    name: string;
    icon: React.ReactNode;
}

interface BeardStyleWidgetProps {
    isFocused?: boolean;
    swipeDirection?: "left" | "right" | "up" | "down" | null;
    lightLevel: string;
    colorScheme: ColorScheme;
    isMounted: boolean;
}

const beardStyles: BeardStyle[] = [
    { id: '1', name: 'Barba Completa', icon: <User className="w-5 h-5" /> },
    { id: '2', name: 'Candado', icon: <User className="w-5 h-5 opacity-80" /> },
    { id: '3', name: 'Afeitado', icon: <User className="w-5 h-5 opacity-60" /> },
    { id: '4', name: 'Barba de 3 Días', icon: <User className="w-5 h-5 opacity-70" /> },
    { id: '5', name: 'Bigote', icon: <User className="w-5 h-5" style={{ clipPath: 'inset(50% 0 0 0)' }} /> }, // Stylized
    { id: '6', name: 'Perilla', icon: <User className="w-5 h-5" /> },
    { id: '7', name: 'Van Dyke', icon: <User className="w-5 h-5" /> },
];

const BeardStyleWidget: React.FC<BeardStyleWidgetProps> = ({ isFocused = false, swipeDirection, colorScheme, isMounted }) => {
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
            transition={{ delay: 0.7 }}
            className={`w-full max-w-[220px] mt-2 transition-all duration-300 ${isFocused ? 'scale-105 ring-2 ring-white/30 rounded-xl p-2 bg-white/5' : 'opacity-80'}`}
        >
            <motion.div
                onClick={() => setIsExpanded(!isExpanded)}
                className={theme.containerClass}
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <User className={`w-6 h-6 transition-transform block ${isExpanded ? 'scale-110' : 'group-hover:scale-105'}`} />
                    </motion.div>
                    <span className={theme.headerTextClass}>
                        Estilo de Barba
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={theme.indicatorClass}>
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
                                    <BeardStyleItem
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

const BeardStyleItem = ({ style, isSelected, setSelectedStyle, colorScheme, isMounted }: any) => {
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

export default BeardStyleWidget;

