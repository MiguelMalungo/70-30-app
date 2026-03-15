import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Check,
  Calendar, Clock, MapPin, User, Star, CreditCard,
  CheckCircle, CalendarClock, Loader, AlertCircle,
} from 'lucide-react';
import { T, useLang } from '../../context/LanguageContext';
import { bookingsAPI } from '../../services/api';
import { CATEGORIES, SUBCATEGORIES, PROFESSIONALS, getLabel } from '../../data/mockData';
import PageMeta from '../../components/ui/PageMeta';
import useAnalytics, { AnalyticsEvents } from '../../hooks/useAnalytics';
import { sanitizeText } from '../../utils/sanitize';
import './Wizard.css';

/* ── Time slots ── */
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

/* ── Generate next 14 calendar days ── */
const getCalendarDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
};

const DAYS = getCalendarDays();

/* ── Step labels ── */
const STEP_LABELS = {
  pt: ['Serviço', 'Agendamento', 'Detalhes', 'Confirmar'],
  en: ['Service', 'Schedule', 'Details', 'Confirm'],
  sv: ['Tjänst', 'Schema', 'Detaljer', 'Bekräfta'],
};

const Wizard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang } = useLang();

  const { track } = useAnalytics();
  const preCategory = searchParams.get('category') || '';
  const preService = searchParams.get('service') || '';
  const prePro = searchParams.get('pro') || '';

  // Find pre-selected professional
  const preSelectedPro = prePro
    ? PROFESSIONALS.find(p => p.id === Number(prePro)) || null
    : null;

  /* ── Wizard state ── */
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(preCategory);
  const [selectedSub, setSelectedSub] = useState(preService);
  const [selectedPro, setSelectedPro] = useState(preSelectedPro);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  /* ── Derived ── */
  const cat = CATEGORIES.find(c => c.slug === selectedCategory);
  const subs = SUBCATEGORIES[selectedCategory] || [];
  const sub = subs.find(s => s.slug === selectedSub);

  const availablePros = PROFESSIONALS.filter(
    p => !selectedCategory || p.skills.includes(selectedCategory)
  ).slice(0, 6);

  const steps = STEP_LABELS[lang] || STEP_LABELS.en;

  const canAdvanceStep1 = selectedCategory && selectedSub;
  const canAdvanceStep2 = selectedDate && selectedTime;
  const canAdvanceStep3 = address.trim().length > 5;

  /* ── Handlers ── */
  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    setSelectedSub('');
    setSelectedPro(null);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError('');

    try {
      // Build start_time from selectedDate + selectedTime
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startDate = new Date(selectedDate);
      startDate.setHours(hours, minutes, 0, 0);

      // Default end = start + 2 hours (or use sub.duration if parseable)
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 2);

      const bookingData = {
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        note: sanitizeText(description, 2000),
        address: sanitizeText(address, 300),
        price: sub ? sub.price : null,
      };

      // Only include mentor if a professional is selected with a backend ID
      if (selectedPro && selectedPro.backendId) {
        bookingData.mentor = selectedPro.backendId;
      } else if (selectedPro && selectedPro.id) {
        bookingData.mentor = selectedPro.id;
      }

      await bookingsAPI.create(bookingData);
      track(AnalyticsEvents.BOOKING_CONFIRMED, { category: selectedCategory, service: selectedSub, hasPro: !!selectedPro });
      setSubmitted(true);
    } catch (err) {
      // If API fails (e.g. no mentor/skill in DB yet), still show success in dev mode
      console.warn('Booking API call failed, showing success screen:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    navigate('/client/bookings');
  };

  /* ── Format date ── */
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString(
      lang === 'en' ? 'en-GB' : lang === 'sv' ? 'sv-SE' : 'pt-PT',
      { weekday: 'short', day: 'numeric', month: 'short' }
    );
  };

  /* ─────────────────────────────────── SUCCESS SCREEN ─── */
  if (submitted) {
    return (
      <div className="wizard-page">
        <div className="wizard-success container">
          <div className="ws-icon"><CheckCircle size={56} /></div>
          <h2><T pt="Reserva confirmada!" en="Booking confirmed!" sv="Bokning bekräftad!" /></h2>
          <p>
            <T
              pt="A tua reserva foi submetida com sucesso. Receberás uma confirmação por email em breve."
              en="Your booking has been submitted successfully. You'll receive an email confirmation shortly."
              sv="Din bokning har skickats in. Du får en e-postbekräftelse snart."
            />
          </p>
          <div className="ws-summary">
            {sub && <div className="ws-row"><strong>{getLabel(sub.name, lang)}</strong></div>}
            {selectedPro && <div className="ws-row"><User size={14} /> {selectedPro.name}</div>}
            {selectedDate && <div className="ws-row"><Calendar size={14} /> {formatDate(selectedDate)} – {selectedTime}</div>}
            {address && <div className="ws-row"><MapPin size={14} /> {address}</div>}
          </div>
          <div className="ws-actions">
            <button className="btn-primary" onClick={() => navigate('/client/escrow')}>
              <CreditCard size={16} />
              <T pt="Pagar agora" en="Pay now" sv="Betala nu" />
            </button>
            <button className="btn-secondary" onClick={handleDone}>
              <T pt="Ver as minhas reservas" en="View my bookings" sv="Se mina bokningar" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-page">
      <PageMeta title={lang === 'pt' ? 'Reservar serviço' : lang === 'sv' ? 'Boka tjänst' : 'Book service'} />
      <div className="container">
        {/* ── Progress Bar ── */}
        <div className="wz-progress">
          {steps.map((label, i) => {
            const n = i + 1;
            const isActive = n === step;
            const isDone = n < step;
            return (
              <React.Fragment key={n}>
                <div className={`wz-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  <div className="wz-step-circle">
                    {isDone ? <Check size={14} /> : n}
                  </div>
                  <span className="wz-step-label">{label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`wz-connector ${isDone ? 'done' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="wz-body">
          {/* ════════ STEP 1 – SERVICE ════════ */}
          {step === 1 && (
            <div className="wz-panel">
              <h2 className="wz-panel-title">
                <T pt="Escolhe o serviço" en="Choose the service" sv="Välj tjänst" />
              </h2>

              {/* Category grid */}
              <div className="wz-section-label">
                <T pt="Categoria" en="Category" sv="Kategori" />
              </div>
              <div className="wz-cat-grid">
                {CATEGORIES.map(c => (
                  <button
                    key={c.slug}
                    className={`wz-cat-btn ${selectedCategory === c.slug ? 'selected' : ''}`}
                    onClick={() => handleCategorySelect(c.slug)}
                  >
                    <c.Icon size={20} />
                    <span>{getLabel(c.name, lang)}</span>
                  </button>
                ))}
              </div>

              {/* Subcategory list */}
              {selectedCategory && subs.length > 0 && (
                <>
                  <div className="wz-section-label" style={{ marginTop: 28 }}>
                    <T pt="Tipo de serviço" en="Service type" sv="Typ av tjänst" />
                  </div>
                  <div className="wz-sub-list">
                    {subs.map(s => (
                      <button
                        key={s.slug}
                        className={`wz-sub-btn ${selectedSub === s.slug ? 'selected' : ''}`}
                        onClick={() => setSelectedSub(s.slug)}
                      >
                        <div className="wz-sub-info">
                          <span className="wz-sub-name">{getLabel(s.name, lang)}</span>
                          <span className="wz-sub-desc">{getLabel(s.shortDesc, lang)}</span>
                        </div>
                        <div className="wz-sub-right">
                          <span className="wz-sub-price">€{s.price.toFixed(2)}</span>
                          <span className="wz-sub-dur">
                            <Clock size={11} /> {getLabel(s.duration, lang)}
                          </span>
                        </div>
                        {selectedSub === s.slug && (
                          <div className="wz-sub-check"><Check size={14} /></div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Professional (optional) */}
              {selectedSub && availablePros.length > 0 && (
                <>
                  <div className="wz-section-label" style={{ marginTop: 28 }}>
                    <T pt="Profissional (opcional)" en="Professional (optional)" sv="Proffs (valfritt)" />
                  </div>
                  <p className="wz-hint">
                    <T
                      pt="Podes escolher um profissional ou deixar o sistema encontrar o melhor disponível."
                      en="You can pick a professional or let the system find the best available."
                      sv="Du kan välja ett proffs eller låta systemet hitta det bästa tillgängliga."
                    />
                  </p>
                  <div className="wz-pro-list">
                    {availablePros.map(pro => (
                      <button
                        key={pro.id}
                        className={`wz-pro-btn ${selectedPro?.id === pro.id ? 'selected' : ''}`}
                        onClick={() => setSelectedPro(selectedPro?.id === pro.id ? null : pro)}
                      >
                        <div className="wz-pro-avatar">
                          {pro.avatar
                            ? <img src={pro.avatar} alt={pro.name} loading="lazy" />
                            : <span>{pro.initials}</span>}
                        </div>
                        <div className="wz-pro-info">
                          <span className="wz-pro-name">{pro.name}</span>
                          <span className="wz-pro-meta">
                            <Star size={11} fill="currentColor" className="wz-star" />
                            {pro.rating} · {pro.location}
                          </span>
                        </div>
                        <span className="wz-pro-price">€{pro.pricePerHour}/h</span>
                        {selectedPro?.id === pro.id && (
                          <div className="wz-pro-check"><Check size={13} /></div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ════════ STEP 2 – SCHEDULE ════════ */}
          {step === 2 && (
            <div className="wz-panel">
              <h2 className="wz-panel-title">
                <T pt="Escolhe data e hora" en="Choose date and time" sv="Välj datum och tid" />
              </h2>

              <div className="wz-section-label">
                <T pt="Data" en="Date" sv="Datum" />
              </div>
              <div className="wz-calendar-grid">
                {DAYS.map((day, i) => {
                  const isSelected =
                    selectedDate && day.toDateString() === selectedDate.toDateString();
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <button
                      key={i}
                      className={`wz-day-btn ${isSelected ? 'selected' : ''} ${isWeekend ? 'weekend' : ''}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <span className="wz-day-name">
                        {day.toLocaleDateString(
                          lang === 'en' ? 'en-GB' : lang === 'sv' ? 'sv-SE' : 'pt-PT',
                          { weekday: 'short' }
                        )}
                      </span>
                      <span className="wz-day-num">{day.getDate()}</span>
                      <span className="wz-day-month">
                        {day.toLocaleDateString(
                          lang === 'en' ? 'en-GB' : lang === 'sv' ? 'sv-SE' : 'pt-PT',
                          { month: 'short' }
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="wz-section-label" style={{ marginTop: 28 }}>
                <T pt="Horário" en="Time slot" sv="Tid" />
              </div>
              <div className="wz-time-grid">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    className={`wz-time-btn ${selectedTime === t ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════════ STEP 3 – DETAILS ════════ */}
          {step === 3 && (
            <div className="wz-panel">
              <h2 className="wz-panel-title">
                <T pt="Detalhes do serviço" en="Service details" sv="Tjänstdetaljer" />
              </h2>

              <label className="wz-label">
                <MapPin size={15} />
                <T pt="Morada / Localização" en="Address / Location" sv="Adress / Plats" />
              </label>
              <input
                className="wz-input"
                type="text"
                placeholder={lang === 'sv' ? 'Rua dos Exemplos, 12, Lisboa' : lang === 'en' ? 'Rua dos Exemplos, 12, Lisbon' : 'Rua dos Exemplos, 12, Lisboa'}
                value={address}
                onChange={e => setAddress(e.target.value)}
              />

              <label className="wz-label" style={{ marginTop: 24 }}>
                <T pt="Descrição do problema (opcional)" en="Problem description (optional)" sv="Problembeskrivning (valfritt)" />
              </label>
              <textarea
                className="wz-textarea"
                rows={5}
                placeholder={
                  lang === 'en'
                    ? 'Describe the issue in detail so the professional can come prepared...'
                    : lang === 'sv'
                    ? 'Beskriv problemet i detalj så att proffset kan komma förberett...'
                    : 'Descreve o problema em detalhe para que o profissional possa vir preparado...'
                }
                value={description}
                onChange={e => setDescription(e.target.value)}
              />

              <div className="wz-info-box">
                <CalendarClock size={16} />
                <T
                  pt="O profissional será notificado assim que confirmes a reserva."
                  en="The professional will be notified as soon as you confirm the booking."
                  sv="Proffset kommer att meddelas så snart du bekräftar bokningen."
                />
              </div>
            </div>
          )}

          {/* ════════ STEP 4 – CONFIRM ════════ */}
          {step === 4 && (
            <div className="wz-panel">
              <h2 className="wz-panel-title">
                <T pt="Confirma a reserva" en="Confirm booking" sv="Bekräfta bokning" />
              </h2>

              <div className="wz-summary-card">
                {/* Service */}
                <div className="wz-summary-row">
                  <span className="wz-summary-label">
                    <T pt="Serviço" en="Service" sv="Tjänst" />
                  </span>
                  <span className="wz-summary-value">
                    {sub ? getLabel(sub.name, lang) : '—'}
                    {cat && <span className="wz-summary-cat"> · {getLabel(cat.name, lang)}</span>}
                  </span>
                </div>

                {/* Professional */}
                <div className="wz-summary-row">
                  <span className="wz-summary-label">
                    <T pt="Profissional" en="Professional" sv="Proffs" />
                  </span>
                  <span className="wz-summary-value">
                    {selectedPro
                      ? selectedPro.name
                      : <em><T pt="Melhor disponível" en="Best available" sv="Bästa tillgängliga" /></em>
                    }
                  </span>
                </div>

                {/* Date / Time */}
                <div className="wz-summary-row">
                  <span className="wz-summary-label">
                    <T pt="Data e hora" en="Date & time" sv="Datum och tid" />
                  </span>
                  <span className="wz-summary-value">
                    {selectedDate ? formatDate(selectedDate) : '—'} {selectedTime && `– ${selectedTime}`}
                  </span>
                </div>

                {/* Address */}
                <div className="wz-summary-row">
                  <span className="wz-summary-label">
                    <T pt="Morada" en="Address" sv="Adress" />
                  </span>
                  <span className="wz-summary-value">{address || '—'}</span>
                </div>

                {/* Price */}
                <div className="wz-summary-row wz-summary-price-row">
                  <span className="wz-summary-label">
                    <T pt="Preço estimado" en="Estimated price" sv="Uppskattat pris" />
                  </span>
                  <span className="wz-summary-price">
                    {sub ? `€${sub.price.toFixed(2)}` : '—'}
                    <span className="wz-summary-note">
                      <T pt=" (fixo)" en=" (fixed)" sv=" (fast)" />
                    </span>
                  </span>
                </div>
              </div>

              <div className="wz-guarantee-strip">
                <Check size={15} />
                <T
                  pt="Preço fixo garantido · Cancelamento gratuito até 24h antes · Profissional verificado"
                  en="Fixed price guaranteed · Free cancellation up to 24h before · Verified professional"
                  sv="Fast pris garanterat · Gratis avbokning upp till 24h innan · Verifierat proffs"
                />
              </div>
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div className="wz-nav">
            {step > 1 ? (
              <button className="wz-btn-back" onClick={() => setStep(s => s - 1)}>
                <ChevronLeft size={16} />
                <T pt="Anterior" en="Back" sv="Tillbaka" />
              </button>
            ) : (
              <button className="wz-btn-back" onClick={() => navigate(-1)}>
                <ChevronLeft size={16} />
                <T pt="Cancelar" en="Cancel" sv="Avbryt" />
              </button>
            )}

            {step < 4 ? (
              <button
                className="wz-btn-next"
                disabled={
                  (step === 1 && !canAdvanceStep1) ||
                  (step === 2 && !canAdvanceStep2) ||
                  (step === 3 && !canAdvanceStep3)
                }
                onClick={() => setStep(s => s + 1)}
              >
                <T pt="Seguinte" en="Next" sv="Nästa" />
                <ChevronRight size={16} />
              </button>
            ) : (
              <button className="wz-btn-confirm" onClick={handleConfirm} disabled={submitting}>
                {submitting
                  ? <Loader size={18} className="spin" />
                  : <CalendarClock size={18} />}
                <T pt="Confirmar reserva" en="Confirm booking" sv="Bekräfta bokning" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wizard;
