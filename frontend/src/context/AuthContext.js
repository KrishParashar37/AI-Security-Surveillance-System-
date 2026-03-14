import React, { createContext, useContext, useState, useCallback } from 'react';
import API from '../api';
import { sendHelloMessage } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    const login = useCallback(async (email, password) => {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);
        const { data } = await API.post('/api/auth/login', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);

        // 🚀 NEW: Send "hello" to Firebase Database
        sendHelloMessage(email);

        // 📧 NEW: Trigger backend notification (email/SMS)
        try {
            await API.post(`/api/notifications/test?channel=email&recipient=${encodeURIComponent(email)}`);
        } catch (e) {
            console.warn("Notification trigger failed (likely missing SMTP config):", e.message);
        }

        return data;
    }, []);

    const demoLogin = useCallback(async () => {
        const { data } = await API.post('/api/auth/demo-login');
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);

        // 🚀 NEW: Send "hello" to Firebase Database for Demo login
        sendHelloMessage(data.user.email);

        // 📧 NEW: Trigger backend notification for Demo login
        try {
            await API.post(`/api/notifications/test?channel=email&recipient=${encodeURIComponent(data.user.email)}`);
        } catch (e) {
            console.warn("Notification trigger failed:", e.message);
        }

        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, demoLogin, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
