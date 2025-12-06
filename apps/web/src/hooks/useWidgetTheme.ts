import { ColorScheme } from './useAmbientLight';

interface UseWidgetThemeProps {
    colorScheme: ColorScheme;
    isMounted: boolean;
    isExpanded: boolean;
    isSelected?: boolean;
}

export function useWidgetTheme({ colorScheme, isMounted, isExpanded, isSelected = false }: UseWidgetThemeProps) {

    const getContainerClass = () => `
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
    `;

    const getItemClass = () => `
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
    `;

    const getIndicatorClass = () => `
        text-xs font-bold opacity-60 ${isMounted ? colorScheme.indicatorBg : 'bg-white/10'} px-2 py-0.5 rounded-full
    `;

    const getTextColor = (isHeader: boolean = false) => {
        if (isHeader) {
            return `text-sm font-light ${isExpanded ? 'font-medium' : (isMounted ? colorScheme.textOpacity : 'opacity-80')}`;
        }
        return `text-xs ${isMounted ? colorScheme.textOpacity : 'opacity-80'}`;
    };

    const getAccentColor = () => {
        return `w-2 h-2 rounded-full transition-colors duration-500 ${isSelected ? (isMounted ? colorScheme.accentColor : 'bg-white/40') : 'bg-white/20'}`;
    };

    return {
        containerClass: getContainerClass(),
        itemClass: getItemClass(),
        indicatorClass: getIndicatorClass(),
        headerTextClass: getTextColor(true),
        itemTextClass: getTextColor(false),
        accentColorClass: getAccentColor()
    };
}
