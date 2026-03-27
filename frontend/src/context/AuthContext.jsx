import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const [justLoggedIn, setJustLoggedIn] = useState(false);

    // If token exists, load user
    useEffect(() => {
        if (token) {
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setUser(res.data);
                })
                .catch((err) => {
                    console.error("Token verification failed:", err);
                    logout();
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, { email, password });
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        setJustLoggedIn(true);
        return res.data.user;
    };

    const register = async (name, email, password, role) => {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, { name, email, password, role });
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        setJustLoggedIn(true);
        return res.data.user;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    const clearCelebration = () => setJustLoggedIn(false);

    if (loading) return null; // Or a nice spinner

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, justLoggedIn, clearCelebration }}>
            {children}
        </AuthContext.Provider>
    );
};
