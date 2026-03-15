import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang, T } from '../../context/LanguageContext';
import { LogOut, Menu, X, ShoppingCart, ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../ui/NotificationBell';
import logoImg from '../../assets/images/logo7030.png';
import './MainLayout.css';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const { lang, setLang } = useLang();
    const { dark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartCount] = useState(0);

    const pagesWithHero = ['/', '/login', '/register'];
    const isHome = pagesWithHero.includes(location.pathname);
    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    // Reset synchronously BEFORE paint so the nav never flickers into scrolled state
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
        setScrolled(false);
        setMobileOpen(false);
    }, [location.pathname]);

    // Keep scroll listener alive for the current page
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeMobile = () => setMobileOpen(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navClass = `nav ${scrolled ? 'scrolled' : ''}`;

    return (
        <div className="page-container">
            {/* Navigation */}
            <nav className={navClass}>
                <div className="nav-inner">
                    <Link to="/" className="nav-logo">
                        <img src={logoImg} alt="70.30" />
                    </Link>

                    {/* Desktop: role badge + logout right after logo */}
                    {user && (
                        <div className="nav-user-info">
                            <span className="nav-role-badge">{user.role}</span>
                            <NotificationBell />
                            <button onClick={handleLogout} className="nav-logout-btn" title="Logout">
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}

                    <ul className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
                        {!user ? (
                            <>
                                {!isAuthPage && (
                                    <>
                                        <li><a href="#how" onClick={closeMobile}><T pt="Como funciona" en="How it works" sv="Hur det fungerar" /></a></li>
                                        <li><a href="#services" onClick={closeMobile}><T pt="Serviços" en="Services" sv="Tjänster" /></a></li>
                                        <li><a href="#reviews" onClick={closeMobile}><T pt="Avaliações" en="Reviews" sv="Omdömen" /></a></li>
                                        <li><a href="#cities" onClick={closeMobile}><T pt="Cidades" en="Cities" sv="Städer" /></a></li>
                                        <li><a href="#faq" onClick={closeMobile}>FAQ</a></li>
                                    </>
                                )}

                                <li className="nav-actions-wrapper">
                                    <div className="nav-top-row">
                                        {isAuthPage && (
                                            <button onClick={() => navigate('/')} className="nav-back-btn">
                                                <ArrowLeft size={15} />
                                                <T pt="Voltar" en="Back" sv="Tillbaka" />
                                            </button>
                                        )}
                                        <div className="nav-lang">
                                            <button onClick={() => setLang('pt')} className={lang === 'pt' ? 'active' : ''}>PT</button>
                                            <button onClick={() => setLang('en')} className={lang === 'en' ? 'active' : ''}>EN</button>
                                            <button onClick={() => setLang('sv')} className={lang === 'sv' ? 'active' : ''}>SV</button>
                                        </div>
                                        <button onClick={toggleTheme} className="nav-theme-btn" title={dark ? 'Light mode' : 'Dark mode'}>
                                            {dark ? <Sun size={18} /> : <Moon size={18} />}
                                        </button>
                                        {!isAuthPage && (
                                            <button className="nav-cart-btn" title="Cart">
                                                <ShoppingCart size={18} />
                                                <span className={`cart-badge ${cartCount === 0 ? 'empty' : ''}`}>{cartCount}</span>
                                            </button>
                                        )}
                                    </div>
                                </li>
                            </>
                        ) : (
                            <>
                                {/* Mobile-only: role badge + logout grouped + right-aligned */}
                                <li className="nav-user-info-mobile">
                                    <span className="nav-role-badge">{user.role}</span>
                                    <button onClick={handleLogout} className="nav-logout-btn" title="Logout">
                                        <LogOut size={18} />
                                    </button>
                                </li>

                                {['CLIENT', 'MENTEE', 'APPRENTICE'].includes(user.role) && (
                                    <>
                                        <li><Link to="/client" onClick={closeMobile}><T pt="Início" en="Home" sv="Hem" /></Link></li>
                                        <li><Link to="/client/services" onClick={closeMobile}><T pt="Serviços" en="Services" sv="Tjänster" /></Link></li>
                                        <li><Link to="/client/bookings" onClick={closeMobile}><T pt="As minhas reservas" en="My Bookings" sv="Mina bokningar" /></Link></li>
                                        <li><Link to="/client/profile" onClick={closeMobile}><T pt="O meu perfil" en="My Profile" sv="Min profil" /></Link></li>
                                    </>
                                )}

                                {(['MASTER', 'MENTOR', 'APPRENTICE'].includes(user.role)) && (
                                    <>
                                        <li><Link to="/pro" onClick={closeMobile}><T pt="Os meus gigs" en="My Gigs" sv="Mina jobb" /></Link></li>
                                        <li><Link to="/pro/community" onClick={closeMobile}><T pt="Comunidade" en="Community" sv="Gemenskap" /></Link></li>
                                        <li><Link to="/pro/inbox" onClick={closeMobile}><T pt="Mensagens" en="Messages" sv="Meddelanden" /></Link></li>
                                    </>
                                )}

                                {user.role === 'ADMIN' && (
                                    <li><Link to="/admin" onClick={closeMobile}>Admin Panel</Link></li>
                                )}

                                <li className="nav-actions-wrapper">
                                    <div className="nav-top-row">
                                        <div className="nav-lang">
                                            <button onClick={() => setLang('pt')} className={lang === 'pt' ? 'active' : ''}>PT</button>
                                            <button onClick={() => setLang('en')} className={lang === 'en' ? 'active' : ''}>EN</button>
                                            <button onClick={() => setLang('sv')} className={lang === 'sv' ? 'active' : ''}>SV</button>
                                        </div>
                                        <button onClick={toggleTheme} className="nav-theme-btn" title={dark ? 'Light mode' : 'Dark mode'}>
                                            {dark ? <Sun size={18} /> : <Moon size={18} />}
                                        </button>
                                    </div>
                                </li>
                            </>
                        )}
                    </ul>

                    {!isAuthPage && (
                        <button
                            className="nav-mobile-toggle"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Menu"
                        >
                            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-inner">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <Link to="/" className="footer-logo">
                                <img src={logoImg} alt="70.30" />
                            </Link>
                            <p><T pt="O serviço que precisas, sempre perto de ti. A plataforma que une gerações." en="The service you need, always near you. Bridging generations through skilled service and mentorship." sv="Tjänsten du behöver, alltid nära dig. Broar mellan generationer." /></p>
                        </div>
                        <div className="footer-col">
                            <h4><T pt="Plataforma" en="Platform" sv="Plattform" /></h4>
                            <ul className="footer-links">
                                <li><a href="#how"><T pt="Como funciona" en="How it Works" sv="Hur det fungerar" /></a></li>
                                <li><a href="#services"><T pt="Serviços" en="Services" sv="Tjänster" /></a></li>
                                <li><a href="#reviews"><T pt="Avaliações" en="Reviews" sv="Omdömen" /></a></li>
                                <li><a href="#cities"><T pt="Cidades" en="Cities" sv="Städer" /></a></li>
                                <li><a href="#faq">FAQ</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4><T pt="Acesso" en="Access" sv="Åtkomst" /></h4>
                            <ul className="footer-links">
                                <li><Link to="/login"><T pt="Entrar" en="Sign In" sv="Logga in" /></Link></li>
                                <li><Link to="/login"><T pt="Entrar como Mentor" en="Join as Mentor" sv="Gå med som Mentor" /></Link></li>
                                <li><Link to="/login"><T pt="Entrar como Aprendiz" en="Join as Apprentice" sv="Gå med som Lärling" /></Link></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4><T pt="Legal" en="Legal" sv="Juridiskt" /></h4>
                            <ul className="footer-links">
                                <li><Link to="#"><T pt="Termos de Serviço" en="Terms of Service" sv="Användarvillkor" /></Link></li>
                                <li><Link to="#"><T pt="Política de Privacidade" en="Privacy Policy" sv="Integritetspolicy" /></Link></li>
                                <li><Link to="#"><T pt="Centro de Ajuda" en="Help Center" sv="Hjälpcenter" /></Link></li>
                                <li><Link to="#"><T pt="Contacto" en="Contact Us" sv="Kontakta oss" /></Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2026 70.30 — <T pt="Serviços Domésticos de Confiança." en="Trusted Home Services." sv="Pålitliga Hemtjänster." /> <T pt="Todos os direitos reservados." en="All rights reserved." sv="Alla rättigheter förbehållna." /></p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
