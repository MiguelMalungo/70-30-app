import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoutes';
import ErrorBoundary from '../components/ui/ErrorBoundary';

// Public Pages — Home & Login eagerly loaded for fast first paint
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';

// Lazy-loaded pages
const Register = lazy(() => import('../pages/public/Register'));
const Demo = lazy(() => import('../pages/public/Demo'));
const Onboarding = lazy(() => import('../pages/public/Onboarding'));

const ClientDashboard = lazy(() => import('../pages/client/Dashboard'));
const ServicesPage = lazy(() => import('../pages/client/ServicesPage'));
const CategoryPage = lazy(() => import('../pages/client/CategoryPage'));
const ServiceDetailPage = lazy(() => import('../pages/client/ServiceDetailPage'));
const Wizard = lazy(() => import('../pages/client/Wizard'));
const MyBookingsPage = lazy(() => import('../pages/client/MyBookingsPage'));
const ProfilePage = lazy(() => import('../pages/client/ProfilePage'));
const ReviewPage = lazy(() => import('../pages/client/ReviewPage'));

const ProDashboard = lazy(() => import('../pages/pro/Dashboard'));
const Community = lazy(() => import('../pages/pro/Community'));
const Inbox = lazy(() => import('../pages/pro/Inbox'));
const Escrow = lazy(() => import('../pages/pro/Escrow'));
const Calendar = lazy(() => import('../pages/pro/Calendar'));

const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));

const Fallback = () => (
    <div className="dash-loading">
        <div className="spin" style={{ width: 20, height: 20, border: '2.5px solid var(--slate-200)', borderTopColor: 'var(--green-600)', borderRadius: '50%' }} />
        A carregar…
    </div>
);

const AppRoutes = () => {
    return (
        <ErrorBoundary>
        <Suspense fallback={<Fallback />}>
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
                        <Route path="/client/reviews" element={<ReviewPage />} />
                        <Route path="/client/escrow" element={<Escrow />} />
                    </Route>

                    {/* Pro Protected Routes (Mentor & Mentee) */}
                    <Route element={<ProtectedRoute allowedRoles={['MENTOR', 'MENTEE', 'MASTER', 'APPRENTICE']} />}>
                        <Route path="/pro" element={<ProDashboard />} />
                        <Route path="/pro/community" element={<Community />} />
                        <Route path="/pro/inbox" element={<Inbox />} />
                        <Route path="/pro/escrow" element={<Escrow />} />
                        <Route path="/pro/calendar" element={<Calendar />} />
                    </Route>

                    {/* Admin Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                </Route>
            </Routes>
        </Suspense>
        </ErrorBoundary>
    );
};

export default AppRoutes;
