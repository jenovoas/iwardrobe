import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Removed local useAmbientLight import
import { ColorScheme } from '@/hooks/useAmbientLight';
import { useWidgetTheme } from '@/hooks/useWidgetTheme';
import { ShoppingBag, Search, TrendingUp, Wrench } from 'lucide-react';

import { ClothingItem } from '@/data/clothingData';

interface ShoppingOption {
    id: string;
    name: string;
    icon: React.ReactNode;
    action: () => void;
}

interface ShoppingWidgetProps {
    // videoRef removed as it is not needed anymore
    isFocused?: boolean;
    swipeDirection?: "left" | "right" | "up" | "down" | null;
    selectedItem?: ClothingItem | null;
    // New props
    lightLevel: string;
    colorScheme: ColorScheme;
    isMounted: boolean;
}

const ShoppingWidget: React.FC<ShoppingWidgetProps> = ({ isFocused = false, swipeDirection, selectedItem, colorScheme, isMounted }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // Theme logic extracted to hook
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

    const handleSearchValue = () => {
        setSelectedOption('search');
        if (selectedItem) {
            const query = encodeURIComponent(`${selectedItem.brand} ${selectedItem.name} precio`);
            window.open(`https://www.google.com/search?q=${query}`, '_blank');
        } else {
            // Generic search if no item selected
            window.open('https://www.google.com/search?q=ropa+moda+hombre+precio', '_blank');
        }
    };

    const handleComparePrice = () => {
        setSelectedOption('compare');
        if (selectedItem) {
            const query = encodeURIComponent(`${selectedItem.brand} ${selectedItem.name}`);
            window.open(`https://www.google.com/search?q=${query}&tbm=shop`, '_blank');
        } else {
            // Generic shopping search
            window.open('https://www.google.com/search?q=moda+hombre&tbm=shop', '_blank');
        }
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
        { id: 'search', name: 'Buscar valor', icon: <Search className="w-5 h-5" />, action: handleSearchValue },
        { id: 'compare', name: 'Comparar precios', icon: <TrendingUp className="w-5 h-5" />, action: handleComparePrice },
        { id: 'repair', name: 'Reparar prenda', icon: <Wrench className="w-5 h-5" />, action: handleRepair },
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
                className={theme.containerClass}
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <ShoppingBag className={`w-6 h-6 transition-transform block ${isExpanded ? 'scale-110' : 'group-hover:scale-105'}`} />
                    </motion.div>
                    <span className={theme.headerTextClass}>
                        Comprar
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={theme.indicatorClass}>
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
                                // Need individual theme hook call for item specific selection style?
                                // Actually better to use the hook inside a subcomponent or just construct helper function?
                                // Let's use the helper here inline since we can't call hooks in loops

                                // To follow React rules, we really should extract Item to component or use a helper function that is not a hook.
                                // But since my hook just returns strings and uses no state (other than what's passed), it is effectively a helper function.
                                // Wait, useWidgetTheme calls hooks? No, it just takes props and returns strings.
                                // BUT it is named 'use...' so linter might complain if used in loop.
                                // Let's just inline the logic using the extracted patterns logic if possible or create a SubComponent.
                                // For simplicity and speed, let's Extract a 'ShoppingItem' component or similar.

                                return (
                                    <ShoppingOptionItem
                                        key={option.id}
                                        option={option}
                                        isSelected={isSelected}
                                        setSelectedOption={setSelectedOption}
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

// Sub-component to safely use the hook
const ShoppingOptionItem = ({ option, isSelected, setSelectedOption, colorScheme, isMounted }: any) => {
    const theme = useWidgetTheme({
        colorScheme,
        isMounted,
        isExpanded: false, // Not used for item class
        isSelected
    });

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: 4 }}
            onClick={() => {
                setSelectedOption(option.id);
                option.action();
            }}
            className={theme.itemClass}
        >
            <div className="flex items-center gap-2">
                <div className={theme.accentColorClass} />
                <span className={theme.itemTextClass}>{option.name}</span>
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
}

export default ShoppingWidget;

