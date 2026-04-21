import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user,    setUser]    = useState(null);
    const [token,   setToken]   = useState(null);
    const [loading, setLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser  = localStorage.getItem("user");
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = useCallback((tokenValue, userData) => {
        localStorage.setItem("token", tokenValue);
        localStorage.setItem("user",  JSON.stringify(userData));
        setToken(tokenValue);
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
        try { await API.post("/auth/logout"); } catch (_) {}
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }, []);

    const checkAuth = useCallback(async () => {
        try {
            const res = await API.get("/auth/profile");
            if (res.data.success) {
                setUser(res.data.user);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                
                // ✅ UPDATE TOKEN (Fixes stale token issue)
                if (res.data.token) {
                    setToken(res.data.token);
                    localStorage.setItem("token", res.data.token);
                }
            }
        } catch (err) {
            if (err.response?.status === 401) logout();
        }
    }, [logout]);

    const isAuthenticated = Boolean(token);
    const isAdmin    = user?.role === "admin";
    const isSeller   = user?.role === "seller";
    const isDelivery = user?.role === "delivery";


    return (
        <AuthContext.Provider value={{ user, token, loading, isAuthenticated, isAdmin, isSeller, isDelivery, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
