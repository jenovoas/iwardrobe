import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ===== PERFORMANCE OPTIMIZATIONS =====
  
  // Enable compression for all assets
  compress: true,
  
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache images aggressively
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // CSS optimization (Tailwind)
  experimental: {
    optimizeCss: true,
  },
  
  // Turbopack configuration (for Next.js 16)
  turbopack: {},
  
  // Enable React strict mode for development
  reactStrictMode: true,
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // ===== CACHING & CDN HEADERS =====
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // DNS prefetch for external services
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // Security headers
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=*, geolocation=*",
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache Next.js assets
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Optimized public assets
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, must-revalidate",
          },
        ],
      },
      // MediaPipe WASM module caching
      {
        source: "/wasm/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000",
          },
          {
            key: "Content-Type",
            value: "application/wasm",
          },
        ],
      },
    ];
  },
  
  // ===== REWRITES & REDIRECTS =====
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite API requests to backend
        {
          source: "/api/:path*",
          destination: process.env.NEXT_PUBLIC_API_URL
            ? `${process.env.NEXT_PUBLIC_API_URL}/:path*`
            : "http://localhost:8000/:path*",
        },
      ],
    };
  },
  
  // ===== WEBPACK OPTIMIZATION =====
  webpack: (config, { isServer }) => {
    // Optimize for client-side bundle
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            // Separate vendor chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: 10,
              reuseExistingChunk: true,
            },
            // MediaPipe library
            mediapipe: {
              test: /[\\/]node_modules[\\/]@mediapipe[\\/]/,
              name: "mediapipe",
              priority: 20,
              reuseExistingChunk: true,
            },
            // Three.js library
            three: {
              test: /[\\/]node_modules[\\/]three[\\/]/,
              name: "three",
              priority: 15,
              reuseExistingChunk: true,
            },
            // UI libraries
            ui: {
              test: /[\\/]node_modules[\\/](framer-motion|react-dom|lucide-react)[\\/]/,
              name: "ui",
              priority: 12,
              reuseExistingChunk: true,
            },
            // Common code used by multiple modules
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
              name: "common",
            },
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;
