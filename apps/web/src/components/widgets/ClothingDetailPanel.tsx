"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClothingItem } from '@/data/clothingData';

interface ClothingDetailPanelProps {
    item: ClothingItem | null;
    onClose: () => void;
    onTryOn: (item: ClothingItem) => void;
}

const ClothingDetailPanel: React.FC<ClothingDetailPanelProps> = ({ item, onClose, onTryOn }) => {
    if (!item) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Nunca';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-w-md w-full overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center"
                            aria-label="Close"
                        >
                            <span className="text-white text-xl">×</span>
                        </button>

                        {/* Placeholder for clothing image */}
                        <div className="text-8xl opacity-80">
                            {item.category === "Camisas" && "👕"}
                            {item.category === "Pantalones" && "👖"}
                            {item.category === "Zapatos" && "👟"}
                            {item.category === "Abrigos" && "🧥"}
                            {item.category === "Accesorios" && "🧢"}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {/* Title */}
                        <div>
                            <h2 className="text-2xl font-light text-white mb-1">{item.name}</h2>
                            <p className="text-sm text-blue-400">{item.brand}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-xs text-white/50 mb-1">Color</p>
                                <p className="text-sm font-medium text-white">{item.color}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-xs text-white/50 mb-1">Talla</p>
                                <p className="text-sm font-medium text-white">{item.size}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-xs text-white/50 mb-1">Categoría</p>
                                <p className="text-sm font-medium text-white">{item.category}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-xs text-white/50 mb-1">Último uso</p>
                                <p className="text-sm font-medium text-white">{formatDate(item.lastWorn)}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => onTryOn(item)}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
                            >
                                ✨ Probar
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-white/80 hover:text-white"
                            >
                                Cerrar
                            </button>
                        </div>

                        {/* Gesture Hint */}
                        <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3 text-center">
                            <p className="text-xs text-blue-300">
                                💡 Desliza a la derecha para probar esta prenda
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ClothingDetailPanel;
