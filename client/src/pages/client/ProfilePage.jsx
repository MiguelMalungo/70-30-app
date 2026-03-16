import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { T, useLang } from '../../context/LanguageContext';
import {
  User, Mail, MapPin, Edit2, Check, X, Loader,
  AlertCircle, CheckCircle, Shield, CalendarDays, AtSign, Star,
} from 'lucide-react';
import { reviewsAPI } from '../../services/api';
import shakeImg from '../../assets/images/shake.webp';
import PageMeta from '../../components/ui/PageMeta';
import './ProfilePage.css';

/* ── Helpers ─────────────────────────────────────────────── */
const ROLE_LABELS = {
  CLIENT:     { pt: 'Cliente',         en: 'Client',         sv: 'Kund' },
  MENTEE:     { pt: 'Cliente',         en: 'Client',         sv: 'Kund' },
  APPRENTICE: { pt: 'Aprendiz',        en: 'Apprentice',     sv: 'Lärling' },
  MENTOR:     { pt: 'Mentor',          en: 'Mentor',         sv: 'Mentor' },
  MASTER:     { pt: 'Mestre',          en: 'Master',         sv: 'Mästare' },
  ADMIN:      { pt: 'Administrador',   en: 'Administrator',  sv: 'Administratör' },
};

/* ── Component ───────────────────────────────────────────── */
const ProfilePage = () => {
  const { user, updateProfile, updateLocation } = useAuth();
  const { lang } = useLang();

  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [locating, setLocating] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg }
  const [reviews, setReviews]   = useState([]);

  useEffect(() => {
    reviewsAPI.list().then(({ data }) => {
      const results = Array.isArray(data) ? data : data.results || [];
      setReviews(results);
    }).catch(() => {
      // No reviews or API unavailable
    });
  }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const [form, setForm] = useState({
    first_name: user?.firstName || '',
    last_name:  user?.lastName  || '',
    email:      user?.email     || '',
    bio:        user?.bio       || '',
  });

  /* ── Derived display values ── */
  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean).join('').toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U';

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || '—';

  const roleLabel = (ROLE_LABELS[user?.role] || { pt: user?.role, en: user?.role, sv: user?.role })[lang]
    ?? (ROLE_LABELS[user?.role] || {}).en
    ?? user?.role;

  /* ── Handlers ── */
  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await updateProfile(form);
      setFeedback({
        type: 'success',
        msg: { pt: 'Perfil actualizado com sucesso!', en: 'Profile updated successfully!', sv: 'Profil uppdaterad!' },
      });
      setEditing(false);
    } catch {
      setFeedback({
        type: 'error',
        msg: { pt: 'Erro ao guardar. Tenta novamente.', en: 'Error saving. Please try again.', sv: 'Fel vid sparande. Försök igen.' },
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      first_name: user?.firstName || '',
      last_name:  user?.lastName  || '',
      email:      user?.email     || '',
      bio:        user?.bio       || '',
    });
    setEditing(false);
    setFeedback(null);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setFeedback({
        type: 'error',
        msg: { pt: 'O teu browser não suporta geolocalização.', en: 'Your browser does not support geolocation.', sv: 'Din webbläsare stöder inte geolokalisering.' },
      });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await updateLocation(coords.latitude, coords.longitude);
          setFeedback({
            type: 'success',
            msg: { pt: 'Localização actualizada!', en: 'Location updated!', sv: 'Plats uppdaterad!' },
          });
        } catch {
          setFeedback({
            type: 'error',
            msg: { pt: 'Erro ao actualizar localização.', en: 'Error updating location.', sv: 'Fel vid uppdatering av plats.' },
          });
        } finally {
          setLocating(false);
        }
      },
      () => {
        setFeedback({
          type: 'error',
          msg: { pt: 'Não foi possível obter a localização.', en: 'Could not get your location.', sv: 'Kunde inte hämta plats.' },
        });
        setLocating(false);
      }
    );
  };

  /* ── Render ── */
  return (
    <div className="profile-page">
      <PageMeta title={lang === 'pt' ? 'Perfil' : lang === 'sv' ? 'Profil' : 'Profile'} />

      {/* ── Hero ── */}
      <section className="pp-hero">
        <img src={shakeImg} alt="" className="pp-hero-img" aria-hidden="true" loading="lazy" />
        <div className="pp-hero-overlay" />
        <div className="container pp-hero-inner">
          <div className="pp-avatar-wrap">
            {user?.avatar
              ? <img src={user.avatar} alt={fullName} className="pp-avatar-img" loading="lazy" />
              : <div className="pp-avatar-initials">{initials}</div>
            }
          </div>
          <div className="pp-hero-text">
            <h1 className="pp-hero-name">{fullName}</h1>
            <span className="pp-hero-role">{roleLabel}</span>
            <p className="pp-hero-username">@{user?.username}</p>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="container pp-content">

        {/* Feedback banner */}
        {feedback && (
          <div className={`pp-feedback pp-feedback-${feedback.type}`}>
            {feedback.type === 'success'
              ? <CheckCircle size={16} />
              : <AlertCircle size={16} />
            }
            <span>{feedback.msg[lang] || feedback.msg.en}</span>
            <button onClick={() => setFeedback(null)} className="pp-feedback-close" aria-label={lang === 'pt' ? 'Fechar' : lang === 'sv' ? 'Stäng' : 'Close'}>
              <X size={14} />
            </button>
          </div>
        )}

        <div className="pp-grid">

          {/* ── Left: Personal info ── */}
          <div className="pp-card pp-info-card">
            <div className="pp-card-header">
              <h2 className="pp-card-title">
                <T pt="Informações pessoais" en="Personal information" sv="Personlig information" />
              </h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="pp-edit-btn">
                  <Edit2 size={14} />
                  <T pt="Editar" en="Edit" sv="Redigera" />
                </button>
              )}
            </div>

            {editing ? (
              /* ── Edit form ── */
              <div className="pp-form">
                <div className="pp-form-row">
                  <div className="pp-form-group">
                    <label className="pp-form-label" htmlFor="pp-first-name">
                      <T pt="Primeiro nome" en="First name" sv="Förnamn" />
                    </label>
                    <input
                      id="pp-first-name"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="pp-input"
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="pp-form-group">
                    <label className="pp-form-label" htmlFor="pp-last-name">
                      <T pt="Apelido" en="Last name" sv="Efternamn" />
                    </label>
                    <input
                      id="pp-last-name"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className="pp-input"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="pp-form-group">
                  <label className="pp-form-label" htmlFor="pp-email">Email</label>
                  <input
                    id="pp-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="pp-input"
                    autoComplete="email"
                  />
                </div>

                <div className="pp-form-group">
                  <label className="pp-form-label" htmlFor="pp-bio">
                    <T pt="Sobre mim" en="About me" sv="Om mig" />
                  </label>
                  <textarea
                    id="pp-bio"
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    className="pp-textarea"
                    rows={4}
                    placeholder={
                      lang === 'pt' ? 'Conta-nos um pouco sobre ti…' :
                      lang === 'sv' ? 'Berätta lite om dig…' :
                      'Tell us a little about you…'
                    }
                  />
                </div>

                <div className="pp-form-actions">
                  <button onClick={handleCancel} className="pp-btn-cancel" disabled={saving}>
                    <X size={15} />
                    <T pt="Cancelar" en="Cancel" sv="Avbryt" />
                  </button>
                  <button onClick={handleSave} className="pp-btn-save" disabled={saving}>
                    {saving
                      ? <Loader size={15} className="pp-spin" />
                      : <Check size={15} />
                    }
                    <T pt={saving ? 'A guardar…' : 'Guardar'} en={saving ? 'Saving…' : 'Save changes'} sv={saving ? 'Sparar…' : 'Spara' } />
                  </button>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <div className="pp-info-list">
                <div className="pp-info-row">
                  <User size={16} className="pp-info-icon" />
                  <div className="pp-info-text">
                    <span className="pp-info-label">
                      <T pt="Nome completo" en="Full name" sv="Fullständigt namn" />
                    </span>
                    <span className="pp-info-value">{fullName}</span>
                  </div>
                </div>

                <div className="pp-info-row">
                  <AtSign size={16} className="pp-info-icon" />
                  <div className="pp-info-text">
                    <span className="pp-info-label">
                      <T pt="Utilizador" en="Username" sv="Användarnamn" />
                    </span>
                    <span className="pp-info-value">@{user?.username}</span>
                  </div>
                </div>

                <div className="pp-info-row">
                  <Mail size={16} className="pp-info-icon" />
                  <div className="pp-info-text">
                    <span className="pp-info-label">Email</span>
                    <span className="pp-info-value">{user?.email || '—'}</span>
                  </div>
                </div>

                {user?.bio ? (
                  <div className="pp-bio-block">
                    <span className="pp-info-label">
                      <T pt="Sobre mim" en="About me" sv="Om mig" />
                    </span>
                    <p className="pp-bio-text">{user.bio}</p>
                  </div>
                ) : (
                  <button onClick={() => setEditing(true)} className="pp-add-bio-hint">
                    + <T pt="Adiciona uma bio" en="Add a bio" sv="Lägg till en bio" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="pp-right-col">

            {/* Account card */}
            <div className="pp-card pp-account-card">
              <div className="pp-card-header">
                <h2 className="pp-card-title">
                  <T pt="Detalhes da conta" en="Account details" sv="Kontodetaljer" />
                </h2>
              </div>
              <div className="pp-account-list">
                <div className="pp-account-row">
                  <div className="pp-account-label-wrap">
                    <Shield size={14} className="pp-account-icon" />
                    <span className="pp-account-label">
                      <T pt="Tipo de conta" en="Account type" sv="Kontotyp" />
                    </span>
                  </div>
                  <span className={`pp-role-pill role-${(user?.role || 'CLIENT').toLowerCase()}`}>
                    {roleLabel}
                  </span>
                </div>

                <div className="pp-account-row">
                  <div className="pp-account-label-wrap">
                    <CalendarDays size={14} className="pp-account-icon" />
                    <span className="pp-account-label">
                      <T pt="Estado" en="Status" sv="Status" />
                    </span>
                  </div>
                  <span className="pp-account-active">
                    <CheckCircle size={13} />
                    <T pt="Activo" en="Active" sv="Aktiv" />
                  </span>
                </div>
              </div>

              <div className="pp-account-actions">
                <Link to="/client/bookings" className="pp-account-link">
                  <T pt="Ver as minhas reservas" en="View my bookings" sv="Visa mina bokningar" />
                </Link>
              </div>
            </div>

            {/* Location card */}
            <div className="pp-card pp-location-card">
              <div className="pp-card-header">
                <h2 className="pp-card-title">
                  <T pt="Localização" en="Location" sv="Plats" />
                </h2>
              </div>
              <div className="pp-location-body">
                <div className="pp-location-status">
                  <div className={`pp-loc-dot ${user?.location ? 'active' : ''}`} />
                  <span className="pp-loc-label">
                    {user?.location
                      ? <T pt="Localização definida" en="Location set" sv="Plats angiven" />
                      : <T pt="Sem localização definida" en="No location set" sv="Ingen plats angiven" />
                    }
                  </span>
                </div>
                <p className="pp-location-hint">
                  <T
                    pt="Permite que encontremos profissionais próximos de ti."
                    en="Allows us to find professionals near you."
                    sv="Gör det möjligt att hitta proffs nära dig."
                  />
                </p>
                <button
                  onClick={handleUseLocation}
                  className="pp-location-btn"
                  disabled={locating}
                >
                  {locating
                    ? <><Loader size={14} className="pp-spin" /><T pt="A obter localização…" en="Getting location…" sv="Hämtar plats…" /></>
                    : <><MapPin size={14} /><T pt="Usar localização actual" en="Use current location" sv="Använd aktuell plats" /></>
                  }
                </button>
              </div>
            </div>

            {/* Reviews card */}
            {reviews.length > 0 && (
              <div className="pp-card pp-reviews-card">
                <div className="pp-card-header">
                  <h2 className="pp-card-title"><T pt="As minhas avaliações" en="My reviews" sv="Mina omdömen" /></h2>
                </div>
                <div className="pp-reviews-summary">
                  <div className="pp-reviews-avg">
                    <Star size={28} fill="currentColor" className="pp-star-icon" />
                    <span className="pp-avg-number">{avgRating}</span>
                  </div>
                  <p className="pp-reviews-count">
                    {reviews.length} <T pt="avaliações recebidas" en="reviews received" sv="omdömen mottagna" />
                  </p>
                  <div className="pp-star-bars">
                    {[5,4,3,2,1].map(n => {
                      const count = reviews.filter(r => r.rating === n).length;
                      const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={n} className="pp-star-bar-row">
                          <span className="pp-star-label">{n}★</span>
                          <div className="pp-star-bar-track"><div className="pp-star-bar-fill" style={{ width: `${pct}%` }} /></div>
                          <span className="pp-star-bar-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="pp-reviews-list">
                  {reviews.slice(0, 3).map((r, i) => (
                    <div key={i} className="pp-review-item">
                      <div className="pp-review-header">
                        <span className="pp-review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        <span className="pp-review-author">{r.author_name || 'Cliente'}</span>
                      </div>
                      {r.comment && <p className="pp-review-text">&ldquo;{r.comment}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>{/* /pp-right-col */}
        </div>{/* /pp-grid */}
      </div>{/* /container */}
    </div>
  );
};

export default ProfilePage;
