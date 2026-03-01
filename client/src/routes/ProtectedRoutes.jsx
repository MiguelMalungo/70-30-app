import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="placeholder-view">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If roles are specified and user role isn't included, kick them to their dashboard
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
        if (user.role === 'CLIENT') return <Navigate to="/client" replace />;
        return <Navigate to="/pro" replace />; // Masters/Apprentices
    }

    // Authorized
    return <Outlet />;
};
