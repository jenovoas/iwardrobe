"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

export interface User {
    email: string;
    // Add other user fields as needed
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface JwtPayload {
    sub: string;
    exp?: number;
    [key: string]: unknown;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialize auth state from localStorage
    const initializeAuth = useCallback(() => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const decoded = jwtDecode<JwtPayload>(token);
                    // Check expiration if needed
                    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                        // Token expired
                        localStorage.removeItem("token");
                        return;
                    }
                    setUser({ email: decoded.sub });
                    setIsAuthenticated(true);
                } catch (e) {
                    console.error("Invalid token", e);
                    try {
                        localStorage.removeItem("token");
                    } catch (storageError) {
                        console.error("Failed to remove token from localStorage:", storageError);
                    }
                }
            }
        } catch (error) {
            // Handle localStorage errors (e.g., private browsing mode)
            console.warn("localStorage not available:", error);
        }
    }, []);

    useEffect(() => {
        // Use setTimeout to avoid synchronous setState in effect
        const timer = setTimeout(() => {
            initializeAuth();
        }, 0);
        return () => clearTimeout(timer);
    }, [initializeAuth]);

    const login = (token: string) => {
        try {
            localStorage.setItem("token", token);
            const decoded = jwtDecode<JwtPayload>(token);
            setUser({ email: decoded.sub });
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Failed to save token to localStorage:", error);
            // Still set user state even if localStorage fails (for session-only auth)
            try {
                const decoded = jwtDecode<JwtPayload>(token);
                setUser({ email: decoded.sub });
                setIsAuthenticated(true);
            } catch (decodeError) {
                console.error("Failed to decode token:", decodeError);
            }
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem("token");
        } catch (error) {
            console.error("Failed to remove token from localStorage:", error);
        }
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
