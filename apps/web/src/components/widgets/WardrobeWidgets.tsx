"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clothingData, ClothingCategory, ClothingItem } from '@/data/clothingData';
import { HandPosition } from '@/hooks/useHandGestures';

interface WardrobeWidgetsProps {
    handPosition?: HandPosition | null;
    isPointing?: boolean;
    onItemSelect?: (item: ClothingItem) => void;
    swipeDirection?: "left" | "right" | null;
}

const WardrobeWidgets: React.FC<WardrobeWidgetsProps> = ({
    handPosition,
    isPointing,
    onItemSelect,
    swipeDirection
}) => {
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

    // Handle swipe navigation between categories
    useEffect(() => {
        if (swipeDirection === "left") {
            setSelectedCategoryIndex(prev =>
                prev < clothingData.length - 1 ? prev + 1 : 0
            );
        } else if (swipeDirection === "right") {
            setSelectedCategoryIndex(prev =>
                prev > 0 ? prev - 1 : clothingData.length - 1
            );
        }
    }, [swipeDirection]);

    // Detect hover with hand position
    useEffect(() => {
        if (!handPosition || !isPointing) {
            setHoveredItemId(null);
            return;
        }

        // Widget area is on the left side (approximately x: 0-0.25, y: 0.2-0.8)
        if (handPosition.x > 0.25) {
            setHoveredItemId(null);
            return;
        }

        // Calculate which item is being pointed at
        const widgetStartY = 0.2;
        const widgetEndY = 0.8;
        const relativeY = (handPosition.y - widgetStartY) / (widgetEndY - widgetStartY);

        if (relativeY >= 0 && relativeY <= 1) {
            if (expandedCategory) {
                // Pointing at expanded items
                const category = clothingData.find(cat => cat.name === expandedCategory);
                if (category) {
                    const itemIndex = Math.floor(relativeY * category.items.length);
                    if (itemIndex >= 0 && itemIndex < category.items.length) {
                        setHoveredItemId(category.items[itemIndex].id);
                    }
                }
            } else {
                // Pointing at categories
                const categoryIndex = Math.floor(relativeY * clothingData.length);
                if (categoryIndex >= 0 && categoryIndex < clothingData.length) {
                    setSelectedCategoryIndex(categoryIndex);
                }
            }
        }
    }, [handPosition, isPointing, expandedCategory]);

    const handleCategoryClick = (category: ClothingCategory) => {
        if (expandedCategory === category.name) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(category.name);
        }
    };

    const handleItemClick = (item: ClothingItem) => {
        if (onItemSelect) {
            onItemSelect(item);
        }
    };

    return (
        <div className="mt-4 space-y-2 w-full max-w-[280px]">
            {clothingData.map((category, index) => {
                const isSelected = index === selectedCategoryIndex;
                const isExpanded = expandedCategory === category.name;

                return (
                    <div key={category.name}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + (index * 0.1) }}
                            onClick={() => handleCategoryClick(category)}
                            className={`
                                flex items-center justify-between p-3 rounded-lg border 
                                transition-all cursor-pointer group relative
                                ${isSelected
                                    ? 'bg-blue-500/30 border-blue-400/50 shadow-lg shadow-blue-500/20'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }
                                ${isExpanded ? 'bg-white/15' : ''}
                            `}
                        >
                            {/* Selection indicator */}
                            {isSelected && (
                                <motion.div
                                    layoutId="category-selector"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-l-lg"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <div className="flex items-center gap-3 ml-2">
                                <span className={`text-2xl transition-transform ${isSelected ? 'scale-125' : 'group-hover:scale-110'}`}>
                                    {category.icon}
                                </span>
                                <span className={`text-sm font-light ${isSelected ? 'font-medium' : 'opacity-80'}`}>
                                    {category.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold opacity-60 bg-white/10 px-2 py-0.5 rounded-full">
                                    {category.items.length}
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
                                        {category.items.map((item) => {
                                            const isHovered = hoveredItemId === item.id;

                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    onClick={() => handleItemClick(item)}
                                                    className={`
                                                        flex items-center justify-between p-2 rounded-md
                                                        transition-all cursor-pointer
                                                        ${isHovered
                                                            ? 'bg-blue-500/20 border border-blue-400/30'
                                                            : 'bg-white/5 hover:bg-white/10'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${isHovered ? 'bg-blue-400' : 'bg-white/20'}`} />
                                                        <span className="text-xs opacity-80">{item.name}</span>
                                                    </div>
                                                    <span className="text-[10px] opacity-50">{item.color}</span>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}

            {/* Gesture Hint */}
            {isPointing && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-xs text-center"
                >
                    👆 Apunta para seleccionar
                </motion.div>
            )}
        </div>
    );
};

export default WardrobeWidgets;
