'use client';

import { motion } from 'framer-motion';
import { Shirt, Scissors, User, ShoppingBag, LucideIcon } from 'lucide-react';

interface WidgetMenuItemProps {
  label: string;
  isFocused: boolean;
  onClick: () => void;
  type: 'wardrobe' | 'hair' | 'beard' | 'shopping';
}

const iconMap: Record<string, typeof Shirt> = {
  wardrobe: Shirt,
  hair: Scissors,
  beard: User,
  shopping: ShoppingBag,
};

export const WidgetMenuItem = ({
  label,
  isFocused,
  onClick,
  type,
}: WidgetMenuItemProps) => {
  const IconComponent = iconMap[type] as LucideIcon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: isFocused ? 1.05 : 1,
        backgroundColor: isFocused
          ? 'rgba(255,255,255,0.2)'
          : 'rgba(255,255,255,0.05)',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={isFocused}
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`p-4 rounded-xl backdrop-blur-md border border-white/10 flex items-center gap-4 transition-all duration-300 cursor-pointer hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/70 ${
        isFocused ? 'ring-2 ring-white/50 shadow-lg' : ''
      }`}
    >
      <span className="flex items-center">
        <IconComponent className="w-6 h-6" />
      </span>
      <span
        className={`text-lg font-medium ${
          isFocused ? 'text-white' : 'text-white/70'
        }`}
      >
        {label}
      </span>
    </motion.div>
  );
};
