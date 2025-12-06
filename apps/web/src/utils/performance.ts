/**
 * Performance and optimization utilities for iWARDROBE
 */

// ===== REQUEST DEBOUNCE & THROTTLE =====

/**
 * Debounce function execution with configurable delay
 */
export function debounce<A extends unknown[], R>(
  func: (...args: A) => R,
  wait: number
): (...args: A) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: A) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function execution with configurable interval
 */
export function throttle<A extends unknown[], R>(
  func: (...args: A) => R,
  limit: number
): (...args: A) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: A) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ===== PERFORMANCE MONITORING =====

/**
 * Measure performance of async operations
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`[Performance] ${name} failed after ${(end - start).toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Measure performance of synchronous operations
 */
export function measureSync<T>(name: string, fn: () => T): T {
  const start = performance.now();
  try {
    const result = fn();
    const end = performance.now();
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`[Performance] ${name} failed after ${(end - start).toFixed(2)}ms:`, error);
    throw error;
  }
}

// ===== MEMORY OPTIMIZATION =====

/**
 * Request animation frame wrapper with performance optimization
 */
export function requestFrameOptimized(callback: (time: number) => void): number {
  return requestAnimationFrame(callback);
}

/**
 * Cleanup function for tracking references and memory
 */
export function createCleanup() {
  const callbacks: Array<() => void> = [];

  return {
    add: (fn: () => void) => {
      callbacks.push(fn);
    },
    cleanup: () => {
      callbacks.forEach(cb => cb());
      callbacks.length = 0;
    },
  };
}

// ===== RESOURCE LOADING =====

/**
 * Preload resources (images, fonts, etc.)
export function preloadResource(url: string, type: "image" | "font" | "script" | "style") {
  if (typeof document === "undefined") return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.href = url;

  switch (type) {
    case "image":
      link.as = "image";
      break;
    case "font":
      link.as = "font";
      link.crossOrigin = "anonymous";
      break;
    case "script":
      link.as = "script";
      break;
    case "style":
      link.as = "style";
      break;
  }

  document.head.appendChild(link);
}

/**
 * Prefetch URL for faster navigation
 */
export function prefetchURL(url: string) {
  if (typeof document === "undefined") return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = url;
  document.head.appendChild(link);
}

// ===== BROWSER DETECTION =====

export interface BrowserInfo {
  name: "Chrome" | "Firefox" | "Safari" | "Edge" | "Unknown";
  version: string;
  isMobile: boolean;
  supportsWebGPU: boolean;
  supportsWebGL2: boolean;
  supportsWasm: boolean;
}

/**
 * Detect browser capabilities
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === "undefined") {
    return {
      name: "Unknown",
      version: "0",
      isMobile: false,
      supportsWebGPU: false,
      supportsWebGL2: false,
      supportsWasm: false,
    };
  }

  const ua = navigator.userAgent;
  let name: BrowserInfo["name"] = "Unknown";
  let version = "0";

  if (ua.indexOf("Chrome") > -1 && ua.indexOf("Chromium") === -1) {
    name = "Chrome";
    version = ua.match(/Chrome\/(\d+)/)?.[1] || "0";
  } else if (ua.indexOf("Firefox") > -1) {
    name = "Firefox";
    version = ua.match(/Firefox\/(\d+)/)?.[1] || "0";
  } else if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) {
    name = "Safari";
    version = ua.match(/Version\/(\d+)/)?.[1] || "0";
  } else if (ua.indexOf("Edg") > -1) {
    name = "Edge";
    version = ua.match(/Edg\/(\d+)/)?.[1] || "0";
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const supportsWebGPU = "gpu" in navigator;
  const supportsWebGL2 = !!document.createElement("canvas").getContext("webgl2");
  const supportsWasm = typeof WebAssembly === "object";

  return {
    name,
    version,
    isMobile,
    supportsWebGPU,
    supportsWebGL2,
    supportsWasm,
  };
}

// ===== INTERSECTION OBSERVER HELPERS =====

/**
 * Create intersection observer for lazy loading
 */
export function createLazyLoadObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    threshold: 0.1,
    rootMargin: "50px",
    ...options,
  });
}

// ===== LOCAL STORAGE HELPERS =====

/**
 * Safe localStorage operations with error handling
 */
export const SafeStorage = {
  getItem: (key: string, defaultValue: string = ""): string => {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch {
      return defaultValue;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

// ===== REQUEST OPTIMIZATION =====

/**
 * Exponential backoff retry strategy
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, i);
      console.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error("Max retries exceeded");
}
