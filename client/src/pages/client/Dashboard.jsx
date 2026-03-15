import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { T, useLang } from '../../context/LanguageContext';
import {
  Search, CalendarClock, User, ArrowRight, Star,
  Clock, CheckCircle, AlertCircle, ChevronRight, Sparkles, Loader,
} from 'lucide-react';
import { bookingsAPI } from '../../services/api';
import { CATEGORIES, MOCK_BOOKINGS, getLabel } from '../../data/mockData';
import stepReceiveImg from '../../assets/images/step-receive.webp';
import PageMeta from '../../components/ui/PageMeta';
import './Dashboard.css';

const STATUS_CONFIG = {
  PENDING: { label: { pt: 'Pendente', en: 'Pending' }, color: 'warning', Icon: AlertCircle },
  ACCEPTED: { label: { pt: 'Confirmado', en: 'Confirmed' }, color: 'success', Icon: CheckCircle },
  COMPLETED: { label: { pt: 'Concluído', en: 'Completed' }, color: 'muted', Icon: CheckCircle },
  CANCELLED: { label: { pt: 'Cancelado', en: 'Cancelled' }, color: 'danger', Icon: AlertCircle },
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

const Dashboard = () => {
  const { user } = useAuth();
  const { lang } = useLang();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const firstName = user?.firstName || user?.username || 'Cliente';
  const topCategories = CATEGORIES.slice(0, 8);

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
        // API unavailable → fall back to mock data so UI still works
        if (!cancelled) setBookings(MOCK_BOOKINGS);
      } finally {
        if (!cancelled) setLoadingBookings(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const upcomingBookings = bookings.filter(b => ['PENDING', 'ACCEPTED'].includes(b.status));

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'sv' ? 'sv-SE' : lang === 'en' ? 'en-GB' : 'pt-PT', {
      weekday: 'short', day: 'numeric', month: 'short',
    });
  };

  return (
    <div className="dashboard-page">
      <PageMeta title={lang === 'pt' ? 'Painel' : lang === 'sv' ? 'Instrumentpanel' : 'Dashboard'} />
      {/* ── Welcome Banner ── */}
      <section className="dash-hero">
        <img src={stepReceiveImg} alt="" className="dash-hero-img" aria-hidden="true" loading="lazy" />
        <div className="dash-hero-overlay" />
        <div className="container dash-hero-container">
          <div className="dash-hero-inner">
            <div className="dash-hero-text">
              <div className="dash-overline">
                <T pt="Bem-vindo de volta" en="Welcome back" sv="Välkommen tillbaka" />
              </div>
              <h1>
                <T pt={`Olá, ${firstName}`} en={`Hello, ${firstName}`} sv={`Hej, ${firstName}`} />
                <Sparkles size={22} className="dash-greeting-icon" />
              </h1>
              <p>
                <T
                  pt="O que precisas hoje? Temos mais de 200 serviços disponíveis perto de ti."
                  en="What do you need today? We have over 200 services available near you."
                  sv="Vad behöver du idag? Vi har över 200 tjänster tillgängliga nära dig."
                />
              </p>
            </div>
            <div className="dash-hero-stats">
              <div className="dash-stat">
                <strong>200+</strong>
                <span><T pt="Serviços disponíveis" en="Services available" sv="Tjänster tillgängliga" /></span>
              </div>
              <div className="dash-stat">
                <strong>4.8 ★</strong>
                <span><T pt="Avaliação média" en="Average rating" sv="Genomsnittsbetyg" /></span>
              </div>
              <div className="dash-stat">
                <strong>163</strong>
                <span><T pt="Profissionais activos" en="Active professionals" sv="Aktiva proffs" /></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="dash-actions-section">
        <div className="container">
          <div className="dash-quick-actions">
            <Link to="/client/services" className="dash-action-card primary">
              <div className="dash-action-icon"><Search size={28} /></div>
              <div className="dash-action-text">
                <h3><T pt="Pedir um serviço" en="Request a service" sv="Begär en tjänst" /></h3>
                <p><T pt="Explora 12 categorias de serviços" en="Browse 12 service categories" sv="Bläddra bland 12 tjänstkategorier" /></p>
              </div>
              <ArrowRight size={20} className="dash-action-arrow" />
            </Link>
            <Link to="/client/bookings" className="dash-action-card">
              <div className="dash-action-icon"><CalendarClock size={28} /></div>
              <div className="dash-action-text">
                <h3><T pt="As minhas marcações" en="My bookings" sv="Mina bokningar" /></h3>
                <p><T pt="Ver o historial e estado das marcações" en="View booking history and status" sv="Visa bokningshistorik och status" /></p>
              </div>
              <ArrowRight size={20} className="dash-action-arrow" />
            </Link>
            <Link to="/client/profile" className="dash-action-card">
              <div className="dash-action-icon"><User size={28} /></div>
              <div className="dash-action-text">
                <h3><T pt="O meu perfil" en="My profile" sv="Min profil" /></h3>
                <p><T pt="Actualiza os teus dados e preferências" en="Update your details and preferences" sv="Uppdatera dina uppgifter" /></p>
              </div>
              <ArrowRight size={20} className="dash-action-arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Upcoming Bookings ── */}
      {loadingBookings ? (
        <section className="dash-bookings-section">
          <div className="container">
            <div className="dash-loading">
              <Loader size={24} className="spin" />
              <T pt="A carregar reservas…" en="Loading bookings…" sv="Laddar bokningar…" />
            </div>
          </div>
        </section>
      ) : upcomingBookings.length > 0 && (
        <section className="dash-bookings-section">
          <div className="container">
            <div className="dash-section-header">
              <h2><T pt="Próximas marcações" en="Upcoming bookings" sv="Kommande bokningar" /></h2>
              <Link to="/client/bookings" className="dash-see-all">
                <T pt="Ver todas" en="See all" sv="Se alla" /> <ChevronRight size={16} />
              </Link>
            </div>
            <div className="dash-bookings-list">
              {upcomingBookings.map(booking => {
                const cfg = STATUS_CONFIG[booking.status];
                return (
                  <div key={booking.id} className="dash-booking-card">
                    <div className="dash-booking-avatar">
                      {booking.professionalAvatar
                        ? <img src={booking.professionalAvatar} alt={booking.professionalName} loading="lazy" />
                        : <span>{booking.professionalInitials}</span>
                      }
                    </div>
                    <div className="dash-booking-info">
                      <div className="dash-booking-service">
                        {getLabel(booking.serviceLabel, lang)}
                      </div>
                      <div className="dash-booking-pro">
                        {booking.professionalName} · {getLabel(booking.categoryLabel, lang)}
                      </div>
                      <div className="dash-booking-meta">
                        <Clock size={13} />
                        <span>{formatDate(booking.date)} · {booking.time}</span>
                      </div>
                    </div>
                    <div className="dash-booking-right">
                      <div className={`dash-status-badge status-${cfg.color}`}>
                        <cfg.Icon size={12} />
                        {getLabel(cfg.label, lang)}
                      </div>
                      <div className="dash-booking-price">€{booking.price.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Categories Grid ── */}
      <section className="dash-categories-section">
        <div className="container">
          <div className="dash-section-header">
            <h2><T pt="Categorias populares" en="Popular categories" sv="Populära kategorier" /></h2>
            <Link to="/client/services" className="dash-see-all">
              <T pt="Ver todas" en="See all" sv="Se alla" /> <ChevronRight size={16} />
            </Link>
          </div>
          <div className="dash-categories-grid">
            {topCategories.map(cat => (
              <Link
                key={cat.slug}
                to={`/client/services/${cat.slug}`}
                className="dash-cat-card"
              >
                <div className="dash-cat-img">
                  <img src={cat.image} alt={getLabel(cat.name, lang)} loading="lazy" />
                  <div className="dash-cat-overlay" />
                </div>
                <div className="dash-cat-icon"><cat.Icon size={20} /></div>
                <div className="dash-cat-info">
                  <span className="dash-cat-name">{getLabel(cat.name, lang)}</span>
                  <span className="dash-cat-price">
                    <T pt="A partir de" en="From" sv="Från" /> €{cat.startingFrom.toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section className="dash-trust-strip">
        <div className="container">
          <div className="dash-trust-items">
            <div className="dash-trust-item">
              <Star size={18} fill="currentColor" />
              <span><T pt="4.8 de avaliação média" en="4.8 average rating" sv="4.8 genomsnittsbetyg" /></span>
            </div>
            <div className="dash-trust-divider" />
            <div className="dash-trust-item">
              <CheckCircle size={18} />
              <span><T pt="Profissionais 100% verificados" en="100% verified professionals" sv="100% verifierade proffs" /></span>
            </div>
            <div className="dash-trust-divider" />
            <div className="dash-trust-item">
              <AlertCircle size={18} />
              <span><T pt="Cancelamento gratuito até 24h" en="Free cancellation up to 24h" sv="Gratis avbokning upp till 24h" /></span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
