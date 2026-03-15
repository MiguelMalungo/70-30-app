import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoutes';

// Public Pages
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import Demo from '../pages/public/Demo';
import Onboarding from '../pages/public/Onboarding';

// Client Pages
import ClientDashboard from '../pages/client/Dashboard';
import ServicesPage from '../pages/client/ServicesPage';
import CategoryPage from '../pages/client/CategoryPage';
import ServiceDetailPage from '../pages/client/ServiceDetailPage';
import Wizard from '../pages/client/Wizard';
import MyBookingsPage from '../pages/client/MyBookingsPage';
import ProfilePage from '../pages/client/ProfilePage';

// Pro Pages (Mentor & Mentee / Apprentice)
import ProDashboard from '../pages/pro/Dashboard';
import Community from '../pages/pro/Community';
import Inbox from '../pages/pro/Inbox';

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
                <Route path="/demo" element={<Demo />} />
                <Route path="/onboarding" element={<Onboarding />} />

                {/* Client Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['CLIENT', 'MENTEE', 'APPRENTICE']} />}>
                    <Route path="/client" element={<ClientDashboard />} />
                    <Route path="/client/services" element={<ServicesPage />} />
                    <Route path="/client/services/:category" element={<CategoryPage />} />
                    <Route path="/client/services/:category/:sub" element={<ServiceDetailPage />} />
                    <Route path="/client/wizard" element={<Wizard />} />
                    <Route path="/client/bookings" element={<MyBookingsPage />} />
                    <Route path="/client/profile" element={<ProfilePage />} />
                </Route>

                {/* Pro Protected Routes (Mentor & Mentee) */}
                <Route element={<ProtectedRoute allowedRoles={['MENTOR', 'MENTEE', 'MASTER', 'APPRENTICE']} />}>
                    <Route path="/pro" element={<ProDashboard />} />
                    <Route path="/pro/community" element={<Community />} />
                    <Route path="/pro/inbox" element={<Inbox />} />
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
