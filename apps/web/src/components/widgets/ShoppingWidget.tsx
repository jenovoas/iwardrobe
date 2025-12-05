import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAmbientLight } from '@/hooks/useAmbientLight';
import { ShoppingBag, Search, TrendingUp, Wrench } from 'lucide-react';

interface ShoppingOption {
    id: string;
    name: string;
    icon: string;
    action: () => void;
}

interface ShoppingWidgetProps {
    videoRef?: React.RefObject<HTMLVideoElement | null>;
    isFocused?: boolean;
    swipeDirection?: "left" | "right" | "up" | "down" | null;
}

const ShoppingWidget: React.FC<ShoppingWidgetProps> = ({ videoRef, isFocused = false, swipeDirection }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const { lightLevel, colorScheme, isMounted } = useAmbientLight(videoRef);

    React.useEffect(() => {
        if (!isFocused) return;
        if (swipeDirection === "right") {
            setIsExpanded(true);
        } else if (swipeDirection === "left") {
            setIsExpanded(false);
        }
    }, [swipeDirection, isFocused]);

    const handleSearchValue = () => {
        setSelectedOption('search');
        // TODO: Implement search garment value functionality
        console.log('Buscar valor de la prenda');
    };

    const handleComparePrice = () => {
        setSelectedOption('compare');
        // TODO: Implement compare store prices functionality
        console.log('Comparar valor en el comercio');
    };

    const handleRepair = () => {
        setSelectedOption('repair');

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // Search for seamstresses near user location
                    const searchQuery = `costurera cerca de mi`;
                    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}/@${latitude},${longitude},15z`;
                    window.open(mapsUrl, '_blank');
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // Fallback: open generic search
                    window.open('https://www.google.com/maps/search/costurera', '_blank');
                }
            );
        } else {
            // Fallback if geolocation is not available
            window.open('https://www.google.com/maps/search/costurera', '_blank');
        }
    };

    const shoppingOptions: ShoppingOption[] = [
        { id: 'search', name: 'Buscar valor', icon: '🔍', action: handleSearchValue },
        { id: 'compare', name: 'Comparar precios', icon: '⚖️', action: handleComparePrice },
        { id: 'repair', name: 'Reparar prenda', icon: '🧵', action: handleRepair },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
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
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <span className={`text-2xl transition-transform block ${isExpanded ? 'scale-110' : 'group-hover:scale-105'}`}>🛍️</span>
                    </motion.div>
                    <span className={`text-sm font-light ${isExpanded ? 'font-medium' : (isMounted ? colorScheme.textOpacity : 'opacity-80')}`}>
                        Comprar
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold opacity-60 ${isMounted ? colorScheme.indicatorBg : 'bg-white/10'} px-2 py-0.5 rounded-full`}>
                        {shoppingOptions.length}
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
                            {shoppingOptions.map((option) => {
                                const isSelected = selectedOption === option.id;

                                return (
                                    <motion.div
                                        key={option.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{ x: 4 }}
                                        onClick={() => {
                                            setSelectedOption(option.id);
                                            option.action();
                                        }}
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
                                            <span className={`text-xs ${isMounted ? colorScheme.textOpacity : 'opacity-80'}`}>{option.name}</span>
                                        </div>
                                        <motion.div
                                            whileHover={{ scale: 1.2, rotate: 10 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                            className="text-xl"
                                        >
                                            {option.icon}
                                        </motion.div>
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

export default ShoppingWidget;
