import React from 'react';
import { motion } from 'framer-motion';

const categories = [
    { name: "Camisas", count: 12, icon: "👕" },
    { name: "Pantalones", count: 8, icon: "👖" },
    { name: "Zapatos", count: 5, icon: "👟" },
    { name: "Abrigos", count: 3, icon: "🧥" },
    { name: "Accesorios", count: 4, icon: "🧢" },
];

const WardrobeWidgets = () => {
    return (
        <div className="mt-4 space-y-2 w-full max-w-[200px]">
            {categories.map((cat, index) => (
                <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (index * 0.1) }}
                    className="flex items-center justify-between bg-white/5 backdrop-blur-sm p-2 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                        <span className="text-sm font-light opacity-80">{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold opacity-60 bg-white/10 px-2 py-0.5 rounded-full">{cat.count}</span>
                </motion.div>
            ))}
        </div>
    );
};

export default WardrobeWidgets;
