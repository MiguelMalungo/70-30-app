import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import stepSchedule from '../../assets/images/step-schedule.png';
import {
  Calendar, Clock, MapPin, Star, X, ChevronRight,
  CheckCircle, XCircle, AlertCircle, Hourglass, MessageSquare, Loader,
} from 'lucide-react';
import { T, useLang } from '../../context/LanguageContext';
import { bookingsAPI, reviewsAPI } from '../../services/api';
import { MOCK_BOOKINGS, CATEGORIES, getLabel } from '../../data/mockData';
import './MyBookingsPage.css';

/* ── Tab definitions ── */
const TABS = [
  { key: 'ALL',       pt: 'Todos',     en: 'All',       sv: 'Alla' },
  { key: 'PENDING',   pt: 'Pendentes', en: 'Pending',   sv: 'Väntande' },
  { key: 'ACCEPTED',  pt: 'Próximas',  en: 'Upcoming',  sv: 'Kommande' },
  { key: 'COMPLETED', pt: 'Concluídas', en: 'Completed', sv: 'Slutförda' },
  { key: 'CANCELLED', pt: 'Canceladas', en: 'Cancelled', sv: 'Avbokade' },
];

/* ── Status config ── */
const STATUS_CONFIG = {
  PENDING:   { icon: Hourglass,    cls: 'status-pending',   pt: 'Pendente',  en: 'Pending',   sv: 'Väntande' },
  ACCEPTED:  { icon: Calendar,     cls: 'status-upcoming',  pt: 'Confirmada', en: 'Confirmed', sv: 'Bekräftad' },
  COMPLETED: { icon: CheckCircle,  cls: 'status-completed', pt: 'Concluída', en: 'Completed', sv: 'Slutförd' },
  CANCELLED: { icon: XCircle,      cls: 'status-cancelled', pt: 'Cancelada', en: 'Cancelled', sv: 'Avbokad' },
  REJECTED:  { icon: XCircle,      cls: 'status-cancelled', pt: 'Rejeitada', en: 'Rejected',  sv: 'Avvisad' },
};

/** Map a backend booking object → frontend card shape */
const mapBackendBooking = (b) => {
  const start = new Date(b.start_time);
  const name = b.mentor_name || 'Professional';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return {
    id: b.id,
    serviceLabel: { pt: b.skill_name || 'Serviço', en: b.skill_name || 'Service', sv: b.skill_name || 'Tjänst' },
    categoryLabel: { pt: b.category_name || 'Categoria', en: b.category_name || 'Category', sv: b.category_name || 'Kategori' },
    categorySlug: b.category_slug || '',
    professionalName: name,
    professionalAvatar: null,
    professionalInitials: initials,
    date: start.toISOString().split('T')[0],
    time: start.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    address: b.address || '',
    note: b.note || '',
    price: parseFloat(b.price) || 0,
    status: b.status,
    canReview: b.status === 'COMPLETED',
    reviewed: false,
  };
};

const MyBookingsPage = () => {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState('ALL');
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of booking being acted on

  // Fetch real bookings from API, fall back to mock data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await bookingsAPI.list();
        if (!cancelled) {
          const results = Array.isArray(data) ? data : data.results || [];
          setBookings(results.map(mapBackendBooking));
        }
      } catch {
        if (!cancelled) setBookings(MOCK_BOOKINGS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = activeTab === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === activeTab);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(
      lang === 'en' ? 'en-GB' : lang === 'sv' ? 'sv-SE' : 'pt-PT',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    );
  };

  const handleCancelBooking = async (id) => {
    setActionLoading(id);
    try {
      await bookingsAPI.cancel(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
    } catch {
      // If API fails (e.g. backend not running), still update locally
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
    } finally {
      setActionLoading(null);
      setCancelConfirm(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating) return;
    setActionLoading(reviewBooking.id);
    try {
      await reviewsAPI.create({
        booking: reviewBooking.id,
        rating: reviewRating,
        comment: reviewText,
      });
    } catch {
      // If API fails, still update UI locally
    } finally {
      setReviewedIds(prev => new Set([...prev, reviewBooking.id]));
      setBookings(prev => prev.map(b =>
        b.id === reviewBooking.id ? { ...b, canReview: false, reviewed: true } : b
      ));
      setActionLoading(null);
      setReviewBooking(null);
      setReviewRating(0);
      setReviewText('');
    }
  };

  const getCatIcon = (slug) => {
    const cat = CATEGORIES.find(c => c.slug === slug);
    return cat ? cat.Icon : null;
  };

  return (
    <div className="bookings-page">
      {/* Hero */}
      <div className="mbp-hero">
        <img src={stepSchedule} alt="" className="mbp-hero-img" aria-hidden="true" />
        <div className="mbp-hero-overlay" />
        <div className="mbp-hero-content container">
          <h1 className="mbp-hero-title"><T pt="As minhas reservas" en="My bookings" sv="Mina bokningar" /></h1>
          <p className="mbp-hero-sub">
            <T pt="Gere e acompanha todos os teus serviços agendados." en="Manage and track all your scheduled services." sv="Hantera och spåra alla dina schemalagda tjänster." />
          </p>
          <Link to="/client/services" className="mbp-hero-btn">
            <T pt="+ Nova reserva" en="+ New booking" sv="+ Ny bokning" />
          </Link>
        </div>
      </div>

      <div className="container">

        {/* Tabs */}
        <div className="mbp-tabs">
          {TABS.map(tab => {
            const count = tab.key === 'ALL'
              ? bookings.length
              : bookings.filter(b => b.status === tab.key).length;
            return (
              <button
                key={tab.key}
                className={`mbp-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab[lang] || tab.en}
                {count > 0 && <span className="mbp-tab-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Booking list */}
        {loading ? (
          <div className="mbp-empty">
            <Loader size={32} className="spin" />
            <h3><T pt="A carregar reservas…" en="Loading bookings…" sv="Laddar bokningar…" /></h3>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mbp-empty">
            <Calendar size={48} strokeWidth={1.5} />
            <h3><T pt="Nenhuma reserva encontrada" en="No bookings found" sv="Inga bokningar hittades" /></h3>
            <p>
              <T
                pt="Ainda não tens reservas nesta categoria."
                en="You don't have any bookings in this category."
                sv="Du har inga bokningar i den här kategorin."
              />
            </p>
            <Link to="/client/services" className="btn-primary">
              <T pt="Explorar serviços" en="Browse services" sv="Utforska tjänster" />
            </Link>
          </div>
        ) : (
          <div className="mbp-list">
            {filtered.map(booking => {
              const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = cfg.icon;
              const CatIcon = getCatIcon(booking.categorySlug);
              const isReviewed = booking.reviewed || reviewedIds.has(booking.id);

              return (
                <div key={booking.id} className={`mbp-card ${booking.status.toLowerCase()}`}>
                  {/* Card header */}
                  <div className="mbp-card-header">
                    <div className="mbp-cat-icon">
                      {CatIcon && <CatIcon size={20} />}
                    </div>
                    <div className="mbp-card-info">
                      <span className="mbp-service-name">{getLabel(booking.serviceLabel, lang)}</span>
                      <span className="mbp-cat-name">{getLabel(booking.categoryLabel, lang)}</span>
                    </div>
                    <div className={`mbp-status-badge ${cfg.cls}`}>
                      <StatusIcon size={13} />
                      {cfg[lang] || cfg.en}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="mbp-card-body">
                    <div className="mbp-pro-row">
                      <div className="mbp-pro-avatar">
                        {booking.professionalAvatar
                          ? <img src={booking.professionalAvatar} alt={booking.professionalName} />
                          : <span>{booking.professionalInitials}</span>
                        }
                      </div>
                      <span className="mbp-pro-name">{booking.professionalName}</span>
                    </div>

                    <div className="mbp-meta-grid">
                      <div className="mbp-meta-item">
                        <Calendar size={14} />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="mbp-meta-item">
                        <Clock size={14} />
                        <span>{booking.time}</span>
                      </div>
                      <div className="mbp-meta-item">
                        <MapPin size={14} />
                        <span>{booking.address}</span>
                      </div>
                    </div>

                    {booking.note && (
                      <p className="mbp-note">&ldquo;{booking.note}&rdquo;</p>
                    )}
                  </div>

                  {/* Card footer */}
                  <div className="mbp-card-footer">
                    <span className="mbp-price">€{booking.price.toFixed(2)}</span>
                    <div className="mbp-actions">
                      {booking.status === 'PENDING' && (
                        <button
                          className="mbp-btn-cancel"
                          onClick={() => setCancelConfirm(booking)}
                        >
                          <X size={14} />
                          <T pt="Cancelar" en="Cancel" sv="Avboka" />
                        </button>
                      )}
                      {booking.status === 'COMPLETED' && !isReviewed && booking.canReview && (
                        <button
                          className="mbp-btn-review"
                          onClick={() => { setReviewBooking(booking); setReviewRating(0); setReviewText(''); }}
                        >
                          <Star size={14} />
                          <T pt="Avaliar" en="Leave review" sv="Lämna omdöme" />
                        </button>
                      )}
                      {booking.status === 'COMPLETED' && isReviewed && (
                        <span className="mbp-reviewed-badge">
                          <CheckCircle size={13} />
                          <T pt="Avaliado" en="Reviewed" sv="Omdöme lämnat" />
                        </span>
                      )}
                      <Link
                        to={`/client/services/${booking.categorySlug}`}
                        className="mbp-btn-rebook"
                      >
                        <T pt="Reservar de novo" en="Book again" sv="Boka igen" />
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Cancel Confirm Modal ── */}
      {cancelConfirm && (
        <div className="mbp-modal-overlay" onClick={() => setCancelConfirm(null)}>
          <div className="mbp-modal" onClick={e => e.stopPropagation()}>
            <div className="mbp-modal-icon warn"><AlertCircle size={32} /></div>
            <h3><T pt="Cancelar reserva?" en="Cancel booking?" sv="Avboka bokning?" /></h3>
            <p>
              <T
                pt="Tens a certeza que queres cancelar esta reserva? Esta ação não pode ser desfeita."
                en="Are you sure you want to cancel this booking? This action cannot be undone."
                sv="Är du säker på att du vill avboka denna bokning? Åtgärden kan inte ångras."
              />
            </p>
            <div className="mbp-modal-service">
              {getLabel(cancelConfirm.serviceLabel, lang)} · {cancelConfirm.date} {cancelConfirm.time}
            </div>
            <div className="mbp-modal-actions">
              <button className="mbp-modal-btn-secondary" onClick={() => setCancelConfirm(null)}>
                <T pt="Voltar" en="Go back" sv="Tillbaka" />
              </button>
              <button
                className="mbp-modal-btn-danger"
                onClick={() => handleCancelBooking(cancelConfirm.id)}
                disabled={actionLoading === cancelConfirm.id}
              >
                {actionLoading === cancelConfirm.id
                  ? <Loader size={15} className="spin" />
                  : <X size={15} />}
                <T pt="Confirmar cancelamento" en="Confirm cancellation" sv="Bekräfta avbokning" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Review Modal ── */}
      {reviewBooking && (
        <div className="mbp-modal-overlay" onClick={() => setReviewBooking(null)}>
          <div className="mbp-modal" onClick={e => e.stopPropagation()}>
            <div className="mbp-modal-icon success"><MessageSquare size={28} /></div>
            <h3><T pt="Avaliar serviço" en="Review service" sv="Betygsätt tjänst" /></h3>
            <p className="mbp-modal-service">
              {getLabel(reviewBooking.serviceLabel, lang)} · {reviewBooking.professionalName}
            </p>

            {/* Star selector */}
            <div className="mbp-star-row">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  className={`mbp-star-btn ${n <= (reviewHover || reviewRating) ? 'lit' : ''}`}
                  onMouseEnter={() => setReviewHover(n)}
                  onMouseLeave={() => setReviewHover(0)}
                  onClick={() => setReviewRating(n)}
                >
                  <Star size={28} fill={n <= (reviewHover || reviewRating) ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            {reviewRating > 0 && (
              <p className="mbp-star-label">
                {reviewRating === 5 ? <T pt="Excelente!" en="Excellent!" sv="Utmärkt!" />
                  : reviewRating === 4 ? <T pt="Muito bom" en="Very good" sv="Mycket bra" />
                  : reviewRating === 3 ? <T pt="Satisfatório" en="Satisfactory" sv="Tillfredsställande" />
                  : reviewRating === 2 ? <T pt="Razoável" en="Fair" sv="Okej" />
                  : <T pt="Mau" en="Poor" sv="Dåligt" />}
              </p>
            )}

            <textarea
              className="mbp-review-textarea"
              rows={4}
              placeholder={
                lang === 'en'
                  ? 'Share your experience with this professional...'
                  : lang === 'sv'
                  ? 'Dela din erfarenhet av detta proffs...'
                  : 'Partilha a tua experiência com este profissional...'
              }
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
            />

            <div className="mbp-modal-actions">
              <button className="mbp-modal-btn-secondary" onClick={() => setReviewBooking(null)}>
                <T pt="Cancelar" en="Cancel" sv="Avbryt" />
              </button>
              <button
                className="mbp-modal-btn-primary"
                disabled={!reviewRating || !!actionLoading}
                onClick={handleSubmitReview}
              >
                {actionLoading
                  ? <Loader size={15} className="spin" />
                  : <Star size={15} />}
                <T pt="Submeter avaliação" en="Submit review" sv="Skicka omdöme" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
