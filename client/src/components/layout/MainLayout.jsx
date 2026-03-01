import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Home, User } from 'lucide-react';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="page-container">
            {/* Mock Navbar */}
            <header style={navStyle}>
                <div style={logoStyle}>
                    <Link to="/" style={{ color: 'white' }}>70-30 Engine</Link>
                </div>

                <nav style={navLinksStyle}>
                    {!user ? (
                        <>
                            <Link to="/login" style={linkStyle}>Login</Link>
                            <Link to="/register" style={linkStyle}>Register</Link>
                        </>
                    ) : (
                        <>
                            <span style={{ color: 'var(--color-text-muted)' }}>
                                {user.role} Dashboard:
                            </span>

                            {user.role === 'CLIENT' && (
                                <>
                                    <Link to="/client" style={linkStyle}>Dashboard</Link>
                                    <Link to="/client/wizard" style={linkStyle}>Book Service</Link>
                                </>
                            )}

                            {(user.role === 'MASTER' || user.role === 'APPRENTICE') && (
                                <>
                                    <Link to="/pro" style={linkStyle}>Jobs</Link>
                                    <Link to="/pro/community" style={linkStyle}>Community</Link>
                                </>
                            )}

                            {user.role === 'ADMIN' && (
                                <Link to="/admin" style={linkStyle}>Admin Panel</Link>
                            )}

                            <button onClick={handleLogout} style={logoutBtnStyle} title="Logout">
                                <LogOut size={18} />
                            </button>
                        </>
                    )}
                </nav>
            </header>

            {/* Main Content Area */}
            <main style={{ flex: 1, backgroundColor: 'var(--color-base)' }}>
                <Outlet />
            </main>

            {/* Mock Footer */}
            <footer style={footerStyle}>
                <p>&copy; 2026 70-30 Social Platform POC</p>
            </footer>
        </div>
    );
};

// Inline styles for the placeholder layout only (will be moved to CSS later or Tailwind)
const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-surface)'
};

const logoStyle = {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    letterSpacing: '1px'
};

const navLinksStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
};

const linkStyle = {
    color: 'var(--color-surface)',
    fontWeight: '500',
    opacity: 0.9
};

const logoutBtnStyle = {
    backgroundColor: 'transparent',
    color: 'var(--color-danger)',
    display: 'flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px'
};

const footerStyle = {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-muted)',
    borderTop: '1px solid var(--color-border)'
};

export default MainLayout;
