"use client";

import { motion, Variants } from "framer-motion";

const AriaAvatar = ({ state = "idle" }: { state?: "idle" | "listening" | "speaking" | "thinking" }) => {
    // Simple orb animation based on state
    const variants: Variants = {
        idle: {
            scale: [1, 1.1, 1],
            opacity: 0.8,
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        },
        listening: {
            scale: [1, 1.2, 1],
            borderColor: ["#fff", "#00ff00", "#fff"],
            transition: { duration: 1.5, repeat: Infinity },
        },
        speaking: {
            scale: [1, 1.3, 0.9, 1.1, 1],
            transition: { duration: 0.5, repeat: Infinity, type: "spring" },
        },
        thinking: {
            rotate: 360,
            transition: { duration: 2, repeat: Infinity, ease: "linear" },
        },
    };

    return (
        <div className="relative flex items-center justify-center w-32 h-32">
            <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 blur-md absolute"
                animate={state}
                variants={variants}
            />
            <motion.div
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/50 z-10"
                animate={state}
                variants={variants}
            />
        </div>
    );
};

export default AriaAvatar;
