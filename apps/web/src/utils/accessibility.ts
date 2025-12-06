/**
 * Accessibility utilities and helpers for iWARDROBE
 * WCAG 2.1 AA compliance helpers
 */

/**
 * Announce dynamic content changes to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  if (typeof window === 'undefined') return;

  // Create or get existing aria-live region
  let liveRegion = document.getElementById('screen-reader-announcements');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'screen-reader-announcements';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-9999px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }

  // Update live region
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.textContent = message;
};

/**
 * Generate a unique ID for accessibility relationships
 */
export const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user is using keyboard navigation
 */
export const isKeyboardUser = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  let isKeyboardUser = false;
  
  const handleMouseDown = () => {
    isKeyboardUser = false;
  };
  
  const handleKeyDown = () => {
    if (['Tab', 'Enter', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event instanceof KeyboardEvent ? event.key : '')) {
      isKeyboardUser = true;
    }
  };
  
  window.addEventListener('mousedown', handleMouseDown, { once: true });
  window.addEventListener('keydown', handleKeyDown, { once: true });
  
  return isKeyboardUser;
};

/**
 * Accessible button component helper
 */
export const createAccessibleButton = (options: {
  label: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaControls?: string;
  role?: string;
  disabled?: boolean;
  onClick: () => void;
}) => {
  return {
    role: options.role || 'button',
    'aria-label': options.ariaLabel || options.label,
    'aria-describedby': options.ariaDescribedBy,
    'aria-controls': options.ariaControls,
    'aria-disabled': options.disabled,
    disabled: options.disabled,
    onClick: options.onClick,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        options.onClick();
      }
    },
    tabIndex: options.disabled ? -1 : 0,
  };
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Save current focus to restore later
   */
  saveFocus: (): Element | null => {
    if (typeof window === 'undefined') return null;
    return document.activeElement || null;
  },

  /**
   * Restore focus to previously saved element
   */
  restoreFocus: (element: Element | null) => {
    if (element instanceof HTMLElement) {
      element.focus();
    }
  },

  /**
   * Move focus to first focusable element
   */
  focusFirst: (container: Element) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0 && focusableElements[0] instanceof HTMLElement) {
      focusableElements[0].focus();
    }
  },

  /**
   * Trap focus within a container (useful for modals)
   */
  trapFocus: (container: Element, callback?: (e: KeyboardEvent) => void) => {
    return (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
        if (callback) callback(e);
        return;
      }

      const focusableElements = container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      const activeElement = document.activeElement;

      if (e.shiftKey) {
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
  },
};

/**
 * Color contrast checker (WCAG compliance)
 */
export const checkColorContrast = (foreground: string, background: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = parseInt(color.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance <= 0.03928 ? luminance / 12.92 : Math.pow((luminance + 0.055) / 1.055, 2.4);
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return contrast;
};

/**
 * Validate WCAG contrast levels
 */
export const validateContrast = (contrast: number): {
  level: 'AAA' | 'AA' | 'FAIL';
  description: string;
} => {
  if (contrast >= 7) {
    return { level: 'AAA', description: 'Exceeds WCAG AAA (7:1)' };
  } else if (contrast >= 4.5) {
    return { level: 'AA', description: 'Meets WCAG AA (4.5:1)' };
  } else {
    return { level: 'FAIL', description: 'Below WCAG AA standard' };
  }
};

/**
 * Generate accessible color palette
 */
export const generateAccessiblePalette = (baseColor: string) => {
  return {
    base: baseColor,
    // Provide sufficient contrast options
    light: `${baseColor}40`, // 25% opacity
    lighter: `${baseColor}20`, // 12.5% opacity
    dark: `${baseColor}B3`, // 70% opacity
  };
};

/**
 * Keyboard shortcut handler
 */
export const createKeyboardShortcuts = () => {
  const shortcuts: Map<string, () => void> = new Map();

  return {
    register: (key: string, handler: () => void) => {
      shortcuts.set(key.toLowerCase(), handler);
    },

    handler: (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = `ctrl+${e.key.toLowerCase()}`;
        const handler = shortcuts.get(key);
        if (handler) {
          e.preventDefault();
          handler();
        }
      }
    },

    getShortcuts: () => Array.from(shortcuts.keys()),
  };
};

/**
 * Test accessibility of an element
 */
export const testAccessibility = (element: Element): {
  hasLabel: boolean;
  hasAriaLabel: boolean;
  hasDescription: boolean;
  isKeyboardAccessible: boolean;
  contrastRatio?: number;
} => {
  return {
    hasLabel: element.querySelector('label') !== null,
    hasAriaLabel: element.getAttribute('aria-label') !== null,
    hasDescription: element.getAttribute('aria-describedby') !== null,
    isKeyboardAccessible: element.getAttribute('tabindex') !== '-1',
  };
};

export {};
