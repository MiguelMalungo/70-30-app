import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, profileAPI, setTokens, clearTokens, getAccessToken, getRefreshToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch the current user profile from the backend
    const fetchUser = useCallback(async () => {
        const token = getAccessToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const { data } = await profileAPI.getMe();
            setUser({
                username: data.username,
                email: data.email,
                firstName: data.first_name,
                lastName: data.last_name,
                role: data.user_type || 'MENTEE',
                bio: data.bio,
                avatar: data.avatar,
                yearsOfExperience: data.years_of_experience,
                location: data.location,
            });
        } catch {
            // Token invalid / expired and refresh also failed → clear
            clearTokens();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // On mount: check if we have tokens and load user
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // ── Login ──────────────────────────────────────────────────
    const login = async (username, password) => {
        const { data } = await authAPI.login({ username, password });
        setTokens(data.access, data.refresh);
        await fetchUser();
        return data;
    };

    // ── Register ───────────────────────────────────────────────
    const register = async ({ username, email, password, userType, firstName, lastName }) => {
        const { data } = await authAPI.register({
            username,
            email,
            password,
            user_type: userType,
            first_name: firstName,
            last_name: lastName,
        });
        return data;
    };

    // ── Logout ─────────────────────────────────────────────────
    const logout = async () => {
        const refresh = getRefreshToken();
        try {
            if (refresh) {
                await authAPI.logout(refresh);
            }
        } catch {
            // Ignore logout errors — we clear tokens regardless
        } finally {
            clearTokens();
            setUser(null);
        }
    };

    // ── Update profile ─────────────────────────────────────────
    const updateProfile = async (profileData) => {
        const { data } = await profileAPI.updateMe(profileData);
        await fetchUser(); // re-fetch to sync state
        return data;
    };

    // ── Update location ────────────────────────────────────────
    const updateLocation = async (latitude, longitude) => {
        const { data } = await profileAPI.updateLocation(latitude, longitude);
        await fetchUser();
        return data;
    };

    // ── Dev bypass ─────────────────────────────────────────────
    const devLogin = (role = 'CLIENT') => {
        setUser({ username: 'dev', firstName: 'Dev', lastName: 'User', role, email: 'dev@dev.com' });
    };

    // ── Helper: map backend user_type to frontend route prefix ─
    const getRoleRedirect = (role) => {
        const r = (role || '').toUpperCase();
        if (r === 'ADMIN') return '/admin';
        if (['CLIENT', 'MENTEE', 'APPRENTICE'].includes(r)) return '/client';
        return '/pro'; // MENTOR, MASTER
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                updateProfile,
                updateLocation,
                fetchUser,
                getRoleRedirect,
                devLogin,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
