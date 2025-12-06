import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap", // Use font-display: swap for better performance
  preload: true,
});

// Configure viewport for mobile optimization
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "dark light",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "iWARDROBE Smart Mirror",
  description: "AI Lifestyle Platform - Personalized fashion and styling recommendations",
  
  // PWA metadata
  applicationName: "iWARDROBE",
  manifest: "/manifest.json",
  
  // Icons
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-512.png",
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    url: "https://iwardrobe.app",
    title: "iWARDROBE Smart Mirror",
    description: "AI Lifestyle Platform - Personalized fashion and styling recommendations",
    siteName: "iWARDROBE",
    locale: "en_US",
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "iWARDROBE Smart Mirror",
    description: "AI Lifestyle Platform - Personalized fashion and styling recommendations",
  },
  
  // Additional metadata
  keywords: [
    "smart mirror",
    "fashion",
    "ai",
    "virtual try-on",
    "wardrobe",
    "styling",
    "recommendations",
  ],
  
  // Mobile app metadata
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "iWARDROBE",
    startupImage: "/icons/icon-512.png",
  },
  
  // Alternate links for different formats
  alternates: {
    canonical: "https://iwardrobe.app",
    languages: {
      "es": "https://iwardrobe.app/es",
      "pt": "https://iwardrobe.app/pt",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA meta tags */}
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="iWARDROBE" />
        
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://storage.googleapis.com" />
        <link rel="preconnect" href="https://storage.googleapis.com" crossOrigin="anonymous" />
        
        {/* MediaPipe WASM preload */}
        <link 
          rel="preload" 
          href="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm" 
          as="fetch" 
          crossOrigin="anonymous"
        />
        
        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && 'caches' in window) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(reg => {
                    console.log('[PWA] Service Worker registered');
                  }).catch(err => {
                    console.warn('[PWA] Service Worker registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

