import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang, T } from '../../context/LanguageContext';
import { Award, Sprout, ArrowLeft, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const { login, getRoleRedirect, devLogin } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { lang } = useLang();
    const t = (pt, en, sv) => ({ pt, en, sv }[lang] ?? en);

    // Role comes from URL param: /login?role=MENTOR or /login?role=MENTEE
    const roleFromUrl = searchParams.get('role')?.toUpperCase();
    const [selectedRole, setSelectedRole] = useState(
        ['MENTOR', 'MENTEE'].includes(roleFromUrl) ? roleFromUrl : null
    );

    const [form, setForm] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isApprentice = selectedRole === 'MENTEE';

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.username.trim() || !form.password) {
            setError(t('Preenche todos os campos.', 'Please fill in all fields.', 'Fyll i alla fält.'));
            return;
        }
        setSubmitting(true);
        try {
            await login(form.username.trim(), form.password);
            setTimeout(() => {
                const stored = localStorage.getItem('accessToken');
                if (stored) {
                    try {
                        const payload = JSON.parse(atob(stored.split('.')[1]));
                        const role = payload.user_type || 'MENTEE';
                        navigate(getRoleRedirect(role));
                    } catch {
                        navigate('/');
                    }
                }
            }, 100);
        } catch (err) {
            const msg =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                t('Credenciais inválidas. Tenta novamente.', 'Invalid credentials. Please try again.', 'Ogiltiga uppgifter. Försök igen.');
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Video background */}
            <div className="auth-video-bg">
                <video autoPlay muted loop playsInline>
                    <source src="/bg.mp4" type="video/mp4" />
                </video>
                <div className="auth-video-overlay" />
            </div>

            {/* Card */}
            <div className="auth-card" onClick={e => { if (!e.target.closest('button,input,a,form,label,select,textarea')) { flushSync(() => devLogin('CLIENT')); navigate('/client'); } }} style={{ cursor: 'pointer' }}>
                <div className="auth-step">

                    <button
                        className="auth-back-btn"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft size={15} />
                        <T pt="Voltar" en="Back" sv="Tillbaka" />
                    </button>

                    {/* Role badge when role is known; inline toggle when it's not */}
                    {selectedRole ? (
                        <div className={`auth-role-indicator ${isApprentice ? 'apprentice' : 'mentor'}`}>
                            {isApprentice ? <Sprout size={16} /> : <Award size={16} />}
                            {isApprentice ? t('Aprendiz', 'Apprentice', 'Lärling') : 'Mentor'}
                        </div>
                    ) : (
                        <div className="reg-role-toggle">
                            <button
                                type="button"
                                className="reg-role-toggle-btn mentor"
                                onClick={() => setSelectedRole('MENTOR')}
                            >
                                <Award size={14} /> Mentor
                            </button>
                            <button
                                type="button"
                                className="reg-role-toggle-btn mentee"
                                onClick={() => setSelectedRole('MENTEE')}
                            >
                                <Sprout size={14} /> <T pt="Aprendiz" en="Apprentice" sv="Lärling" />
                            </button>
                        </div>
                    )}

                    <p className="auth-step-title">
                        <T pt="Entrar na conta" en="Sign in" sv="Logga in" />
                    </p>
                    <p className="auth-step-sub">
                        <T
                            pt="Introduz as tuas credenciais para continuar."
                            en="Enter your credentials to continue."
                            sv="Ange dina uppgifter för att fortsätta."
                        />
                    </p>

                    <form onSubmit={handleSubmit} noValidate>
                        {error && (
                            <div className="form-error">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username">
                                <T pt="Utilizador" en="Username" sv="Användarnamn" />
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                className="form-input"
                                placeholder={t('o.teu.utilizador', 'your.username', 'ditt.användarnamn')}
                                autoComplete="username"
                                value={form.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                <T pt="Palavra-passe" en="Password" sv="Lösenord" />
                            </label>
                            <div className="password-wrapper">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword((p) => !p)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? t('Ocultar', 'Hide', 'Dölj') : t('Mostrar', 'Show', 'Visa')}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`btn-auth-submit${isApprentice ? ' apprentice-submit' : ''}`}
                            disabled={submitting}
                        >
                            {submitting
                                ? t('A entrar…', 'Signing in…', 'Loggar in…')
                                : t('Entrar', 'Sign in', 'Logga in')}
                            {!submitting && <ArrowRight size={18} />}
                        </button>

                        <div className="form-footer">
                            <button type="button" className="form-link">
                                <T pt="Esqueci a palavra-passe" en="Forgot password" sv="Glömt lösenordet" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Below-card link — white text over dark bg */}
            <div className="auth-below-card">
                <T pt="Ainda não tens conta?" en="Don't have an account?" sv="Har du inget konto?" />{' '}
                <Link to={selectedRole ? `/register?role=${selectedRole}` : '/register'}>
                    <T pt="Criar conta" en="Create account" sv="Skapa konto" />
                </Link>
            </div>
        </div>
    );
};

export default Login;
