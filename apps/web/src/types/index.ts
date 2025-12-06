// ===== MEDIA TYPES =====
export interface MediaConstraints {
  video: MediaTrackConstraints;
  audio: boolean;
}

export interface ResolutionConfig {
  label: string;
  width: { min?: number; ideal?: number; max?: number };
  height: { min?: number; ideal?: number; max?: number };
}

// ===== GESTURE & INTERACTION TYPES =====
export type GestureType =
  | "Thumb_Up"
  | "Thumb_Down"
  | "Pointing_Up"
  | "Open_Palm"
  | "Closed_Fist"
  | "Victory"
  | "OK"
  | null;

export type SwipeDirection = "left" | "right" | "up" | "down" | null;

export interface HandPosition {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
}

// ===== PERFORMANCE METRICS =====
export interface PerformanceMetric {
  timestamp: number;
  value: number;
  label: string;
}

export interface WebVitals {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

// ===== CAMERA TYPES =====
export interface CameraDevice {
  deviceId: string;
  label: string;
  kind: "videoinput" | "audioinput";
  groupId: string;
}

// ===== ERROR TYPES =====
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: number;
}
