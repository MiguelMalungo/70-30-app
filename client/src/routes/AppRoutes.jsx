import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoutes';

// Public Pages
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';

// Client Pages
import ClientDashboard from '../pages/client/Dashboard';
import Wizard from '../pages/client/Wizard';

// Pro Pages
import ProDashboard from '../pages/pro/Dashboard';
import Community from '../pages/pro/Community';

// Admin Page
import AdminDashboard from '../pages/admin/Dashboard';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Client Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['CLIENT']} />}>
                    <Route path="/client" element={<ClientDashboard />} />
                    <Route path="/client/wizard" element={<Wizard />} />
                </Route>

                {/* Pro Protected Routes (Master & Apprentice) */}
                <Route element={<ProtectedRoute allowedRoles={['MASTER', 'APPRENTICE']} />}>
                    <Route path="/pro" element={<ProDashboard />} />
                    <Route path="/pro/community" element={<Community />} />
                </Route>

                {/* Admin Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;
