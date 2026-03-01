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

            {/* Comprehensive Footer */}
            <footer style={footerStyle}>
                <div style={footerGridStyle}>
                    <div style={footerColStyle}>
                        <h4 style={footerColTitleStyle}>70-30 Engine</h4>
                        <p style={footerColTextStyle}>Bridging generations through skilled service and meaningful mentorship.</p>
                    </div>
                    <div style={footerColStyle}>
                        <h4 style={footerColTitleStyle}>Company</h4>
                        <Link to="#" style={footerLinkStyle}>About Us</Link>
                        <Link to="#" style={footerLinkStyle}>How it Works</Link>
                        <Link to="#" style={footerLinkStyle}>Trust & Safety</Link>
                    </div>
                    <div style={footerColStyle}>
                        <h4 style={footerColTitleStyle}>Support</h4>
                        <Link to="#" style={footerLinkStyle}>Help Center</Link>
                        <Link to="#" style={footerLinkStyle}>Q&A / FAQs</Link>
                        <Link to="#" style={footerLinkStyle}>Contact Us</Link>
                    </div>
                    <div style={footerColStyle}>
                        <h4 style={footerColTitleStyle}>Legal</h4>
                        <Link to="#" style={footerLinkStyle}>Terms of Service</Link>
                        <Link to="#" style={footerLinkStyle}>Privacy Policy</Link>
                    </div>
                </div>
                <div style={footerBottomStyle}>
                    <p>&copy; 2026 70-30 Social Platform POC. All rights reserved.</p>
                </div>
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
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    padding: '4rem 2rem 2rem 2rem',
    marginTop: 'auto'
};

const footerGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '3rem',
    maxWidth: '1200px',
    margin: '0 auto',
    marginBottom: '3rem'
};

const footerColStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
};

const footerColTitleStyle = {
    fontFamily: 'var(--font-family-display)',
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
    color: 'white'
};

const footerColTextStyle = {
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
    fontSize: '0.95rem'
};

const footerLinkStyle = {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'color var(--transition-speed)'
};

const footerBottomStyle = {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    paddingTop: '2rem',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.85rem'
};

export default MainLayout;
