import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Backend uses MENTOR/MENTEE; frontend routes previously used MASTER/APPRENTICE.
// This helper normalizes so both conventions work.
const normalizeRole = (role) => {
    const r = (role || '').toUpperCase();
    if (r === 'MASTER') return 'MENTOR';
    if (r === 'APPRENTICE') return 'MENTEE';
    return r;
};

export const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user, loading, getRoleRedirect } = useAuth();

    if (loading) {
        return <div className="placeholder-view">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = normalizeRole(user.role);
    const allowed = allowedRoles.map(normalizeRole);

    // If roles are specified and user role isn't included, redirect to their dashboard
    if (allowed.length > 0 && !allowed.includes(userRole)) {
        return <Navigate to={getRoleRedirect(userRole)} replace />;
    }

    return <Outlet />;
};
