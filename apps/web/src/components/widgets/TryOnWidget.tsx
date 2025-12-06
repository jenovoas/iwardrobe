"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClothingItem } from '@/data/clothingData';
import { useAmbientLight } from '@/hooks/useAmbientLight';
import { ShoppingBag, X } from 'lucide-react';

export interface OutfitState {
    head?: ClothingItem | null;
    top?: ClothingItem | null;
    bottom?: ClothingItem | null;
    feet?: ClothingItem | null;
    accessories?: ClothingItem | null;
}

interface TryOnWidgetProps {
    outfit: OutfitState;
    onRemoveItem: (slot: keyof OutfitState) => void;
    onClearOutfit: () => void;
    onClose?: () => void;
    isVisible: boolean;
    videoRef?: React.RefObject<HTMLVideoElement | null>;
}

const TryOnWidget: React.FC<TryOnWidgetProps> = ({
    outfit,
    onRemoveItem,
    onClearOutfit,
    onClose,
    isVisible,
    videoRef
}) => {
    const { colorScheme, isMounted, lightLevel } = useAmbientLight(videoRef);

    // Calculate total items
    const itemCount = Object.values(outfit).filter(Boolean).length;

    // Helper to render an item slot
    const renderSlot = (slot: keyof OutfitState, label: string, item: ClothingItem | null | undefined, zIndex: number) => {
        return (
            <div className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${item ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-white/5 border-dashed'}`} style={{ zIndex }}>
                {item ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative w-full aspect-square flex flex-col items-center justify-center"
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveItem(slot);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
                        >
                            <X size={12} />
                        </button>
                        <div className="text-4xl mb-2">
                            {item.category === "Camisas" && "👕"}
                            {item.category === "Pantalones" && "👖"}
                            {item.category === "Zapatos" && "👟"}
                            {item.category === "Abrigos" && "🧥"}
                            {item.category === "Accesorios" && "🧢"}
                        </div>
                        <span className="text-[10px] text-center font-medium opacity-90 truncate w-full px-1">{item.name}</span>
                        <span className="text-[9px] text-center opacity-60 truncate w-full">{item.brand}</span>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full opacity-30">
                        <span className="text-xs font-light">{label}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`fixed right-8 top-24 bottom-24 w-80 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col
                        ${isMounted ? 'bg-black/40' : 'bg-black/60'}
                    `}
                >
                    {/* Header */}
                    <div className={`p-4 border-b border-white/10 flex items-center justify-between ${isMounted ? (lightLevel === 'bright' ? 'bg-gray-100/90' : 'bg-white/5') : 'bg-white/5'}`}>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🤵</span>
                            <h2 className={`font-light text-lg ${isMounted ? colorScheme.textOpacity : 'text-white'}`}>Probador</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {itemCount > 0 && (
                                <button
                                    onClick={onClearOutfit}
                                    className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-red-500/20 hover:text-red-200 transition-colors"
                                >
                                    Limpiar
                                </button>
                            )}
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Outfit Display (Avatar Representation) */}
                    <div className="flex-1 p-6 relative flex flex-col gap-4 overflow-y-auto">

                        {/* Avatar Silhouette Background */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                            <svg viewBox="0 0 100 200" className="h-4/5 w-auto fill-current text-white">
                                <path d="M50 0 C30 0 20 20 20 30 C20 40 30 45 30 50 L10 60 L10 120 L30 120 L30 190 L45 190 L45 130 L55 130 L55 190 L70 190 L70 120 L90 120 L90 60 L70 50 C70 45 80 40 80 30 C80 20 70 0 50 0 Z" />
                            </svg>
                        </div>

                        {/* Slots */}
                        <div className="grid grid-cols-2 gap-4 h-full z-10">
                            {/* Head / Accessories */}
                            <div className="col-span-2 h-24">
                                {renderSlot('accessories', 'Accesorios / Cabeza', outfit.accessories || outfit.head, 50)}
                            </div>

                            {/* Top / Outerwear */}
                            <div className="col-span-2 h-40">
                                {renderSlot('top', 'Superior', outfit.top, 40)}
                            </div>

                            {/* Bottom */}
                            <div className="col-span-2 h-40">
                                {renderSlot('bottom', 'Inferior', outfit.bottom, 30)}
                            </div>

                            {/* Shoes */}
                            <div className="col-span-2 h-24">
                                {renderSlot('feet', 'Calzado', outfit.feet, 20)}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Summary */}
                    <div className="p-4 border-t border-white/10 bg-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs opacity-60">Prendas seleccionadas</span>
                            <span className="text-xs font-bold">{itemCount} / 4</span>
                        </div>

                        {itemCount > 0 ? (
                            <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-medium shadow-lg shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
                                <ShoppingBag size={16} />
                                <span>Verificar Disponibilidad</span>
                            </button>
                        ) : (
                            <div className="text-center py-2 text-xs opacity-40">
                                Selecciona prendas del armario para probar
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TryOnWidget;
