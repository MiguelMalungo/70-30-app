import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang, T } from '../../context/LanguageContext';
import {
    Award,
    Sprout,
    ArrowLeft,
    ArrowRight,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
} from 'lucide-react';
import shakeImg from '../../assets/images/shake.png';
import './Auth.css';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { lang } = useLang();
    const t = (pt, en, sv) => ({ pt, en, sv }[lang] ?? en);

    // Role comes from URL param: /register?role=MENTOR or /register?role=MENTEE
    const roleFromUrl = searchParams.get('role')?.toUpperCase();
    const [selectedRole, setSelectedRole] = useState(
        ['MENTOR', 'MENTEE'].includes(roleFromUrl) ? roleFromUrl : null
    );

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const isApprentice = selectedRole === 'MENTEE';

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
        if (apiError) setApiError('');
    };

    const validate = () => {
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = t('Nome obrigatório.', 'First name required.', 'Förnamn krävs.');
        if (!form.lastName.trim()) errs.lastName = t('Apelido obrigatório.', 'Last name required.', 'Efternamn krävs.');
        if (!form.username.trim()) errs.username = t('Utilizador obrigatório.', 'Username required.', 'Användarnamn krävs.');
        else if (form.username.length < 3) errs.username = t('Mín. 3 caracteres.', 'Min. 3 characters.', 'Min. 3 tecken.');
        if (!form.email.trim()) errs.email = t('Email obrigatório.', 'Email required.', 'E-post krävs.');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t('Email inválido.', 'Invalid email.', 'Ogiltig e-post.');
        if (!form.password) errs.password = t('Palavra-passe obrigatória.', 'Password required.', 'Lösenord krävs.');
        else if (form.password.length < 8) errs.password = t('Mín. 8 caracteres.', 'Min. 8 characters.', 'Min. 8 tecken.');
        if (form.password !== form.confirmPassword)
            errs.confirmPassword = t('Palavras-passe não coincidem.', 'Passwords do not match.', 'Lösenorden matchar inte.');
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setErrors({});
        setSubmitting(true);
        try {
            await register({
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
                userType: selectedRole,
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            const data = err.response?.data;
            if (data && typeof data === 'object') {
                const fieldErrors = {};
                let general = '';
                for (const [key, value] of Object.entries(data)) {
                    const msg = Array.isArray(value) ? value.join(' ') : String(value);
                    if (['username', 'email', 'password', 'first_name', 'last_name'].includes(key)) {
                        const mapped = key === 'first_name' ? 'firstName' : key === 'last_name' ? 'lastName' : key;
                        fieldErrors[mapped] = msg;
                    } else {
                        general += msg + ' ';
                    }
                }
                if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
                if (general.trim()) setApiError(general.trim());
                if (!Object.keys(fieldErrors).length && !general.trim())
                    setApiError(t('Erro ao criar conta. Tenta novamente.', 'Registration failed. Please try again.', 'Registrering misslyckades. Försök igen.'));
            } else {
                setApiError(
                    data?.message ||
                    data?.detail ||
                    t('Erro ao criar conta. Tenta novamente.', 'Registration failed. Please try again.', 'Registrering misslyckades. Försök igen.')
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page reg-shake-bg">
            {/* Shake image background */}
            <div className="auth-shake-bg">
                <img src={shakeImg} alt="" aria-hidden="true" />
                <div className="auth-video-overlay" />
            </div>

            <div className="auth-card">

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
                            className={`reg-role-toggle-btn mentor${selectedRole === 'MENTOR' ? ' active' : ''}`}
                            onClick={() => setSelectedRole('MENTOR')}
                        >
                            <Award size={14} /> Mentor
                        </button>
                        <button
                            type="button"
                            className={`reg-role-toggle-btn mentee${selectedRole === 'MENTEE' ? ' active' : ''}`}
                            onClick={() => setSelectedRole('MENTEE')}
                        >
                            <Sprout size={14} />
                            <T pt="Aprendiz" en="Apprentice" sv="Lärling" />
                        </button>
                    </div>
                )}

                <div className="auth-step">
                    <p className="auth-step-title">
                        <T pt="Criar conta" en="Create account" sv="Skapa konto" />
                    </p>
                    <p className="auth-step-sub">
                        <T
                            pt="Preenche os teus dados para entrar na comunidade 70.30."
                            en="Fill in your details to join the 70.30 community."
                            sv="Fyll i dina uppgifter för att gå med i 70.30-communityt."
                        />
                    </p>

                    <form onSubmit={handleSubmit} noValidate>
                        {apiError && (
                            <div className="form-error">
                                <AlertCircle size={18} />
                                <span>{apiError}</span>
                            </div>
                        )}
                        {success && (
                            <div className="form-success">
                                <CheckCircle size={18} />
                                <span>
                                    <T
                                        pt="Conta criada com sucesso! A redirecionar…"
                                        en="Account created! Redirecting to sign in…"
                                        sv="Kontot skapades! Omdirigerar…"
                                    />
                                </span>
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">
                                    <T pt="Primeiro nome" en="First name" sv="Förnamn" />
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    className={`form-input${errors.firstName ? ' error' : ''}`}
                                    placeholder={t('José', 'José', 'Erik')}
                                    autoComplete="given-name"
                                    value={form.firstName}
                                    onChange={handleChange}
                                />
                                {errors.firstName && (
                                    <small style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.firstName}</small>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">
                                    <T pt="Apelido" en="Last name" sv="Efternamn" />
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    className={`form-input${errors.lastName ? ' error' : ''}`}
                                    placeholder={t('Silva', 'Silva', 'Eriksson')}
                                    autoComplete="family-name"
                                    value={form.lastName}
                                    onChange={handleChange}
                                />
                                {errors.lastName && (
                                    <small style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.lastName}</small>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="reg-username">
                                <T pt="Utilizador" en="Username" sv="Användarnamn" />
                            </label>
                            <input
                                id="reg-username"
                                name="username"
                                type="text"
                                className={`form-input${errors.username ? ' error' : ''}`}
                                placeholder="jose.silva"
                                autoComplete="username"
                                value={form.username}
                                onChange={handleChange}
                            />
                            {errors.username && (
                                <small style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.username}</small>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="reg-email">Email</label>
                            <input
                                id="reg-email"
                                name="email"
                                type="email"
                                className={`form-input${errors.email ? ' error' : ''}`}
                                placeholder="jose@email.com"
                                autoComplete="email"
                                value={form.email}
                                onChange={handleChange}
                            />
                            {errors.email && (
                                <small style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.email}</small>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="reg-password">
                                    <T pt="Palavra-passe" en="Password" sv="Lösenord" />
                                </label>
                                <div className="password-wrapper">
                                    <input
                                        id="reg-password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        className={`form-input${errors.password ? ' error' : ''}`}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        value={form.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword((p) => !p)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <small style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.password}</small>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="reg-confirm">
                                    <T pt="Confirmar" en="Confirm" sv="Bekräfta" />
                                </label>
                                <div className="password-wrapper">
                                    <input
                                        id="reg-confirm"
                                        name="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <small style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.confirmPassword}</small>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`btn-auth-submit${isApprentice ? ' apprentice-submit' : ''}`}
                            disabled={submitting || success}
                        >
                            {submitting
                                ? t('A criar conta…', 'Creating account…', 'Skapar konto…')
                                : t('Criar conta', 'Create account', 'Skapa konto')}
                            {!submitting && !success && <ArrowRight size={18} />}
                        </button>

                        {/* Social login */}
                        <div className="auth-social-divider">
                            <span><T pt="ou continuar com" en="or continue with" sv="eller fortsätt med" /></span>
                        </div>
                        <div className="auth-social-btns">
                            <button type="button" className="auth-social-btn">
                                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                Google
                            </button>
                            <button type="button" className="auth-social-btn">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                Facebook
                            </button>
                            <button type="button" className="auth-social-btn">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                X
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Below-card link — white text over dark bg */}
            <div className="auth-below-card">
                <T pt="Já tens conta?" en="Already have an account?" sv="Har du redan ett konto?" />{' '}
                <Link to="/login">
                    <T pt="Entrar" en="Sign in" sv="Logga in" />
                </Link>
            </div>
        </div>
    );
};

export default Register;
