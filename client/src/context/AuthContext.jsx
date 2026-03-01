import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // null if logged out
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock check for existing token/session
        const storedRole = localStorage.getItem('mockRole');
        if (storedRole) {
            setUser({ role: storedRole, name: 'Mock User' });
        }
        setLoading(false);
    }, []);

    const login = (role) => {
        localStorage.setItem('mockRole', role);
        setUser({ role, name: `Mock ${role}` });
    };

    const logout = () => {
        localStorage.removeItem('mockRole');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
