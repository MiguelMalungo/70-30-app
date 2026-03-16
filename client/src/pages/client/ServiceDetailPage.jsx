import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle, XCircle, Star,
  ShieldCheck, CalendarClock, Headphones, ArrowRight, Loader,
} from 'lucide-react';
import { T, useLang } from '../../context/LanguageContext';
import { CATEGORIES, SUBCATEGORIES, PROFESSIONALS, getLabel } from '../../data/mockData';
import { mentorSearchAPI } from '../../services/api';
import useAnalytics, { AnalyticsEvents } from '../../hooks/useAnalytics';
import './ServiceDetailPage.css';

/* Map a backend mentor-search result → frontend pro card shape */
const mapBackendPro = (item) => {
  const name = `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.username;
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return {
    id: item.user_id,
    backendId: item.user_id,
    name,
    initials,
    avatar: item.avatar || null,
    rating: 4.8,                        // backend has no rating yet — placeholder
    reviewCount: 0,
    bio: item.bio || '',
    yearsExp: item.years_of_experience || 0,
    location: item.distance_km != null ? `${item.distance_km} km` : '',
    pricePerHour: 50,                   // no price model yet — placeholder
    badge: item.proficiency === 'MASTER' ? 'MASTER' : 'EXPERT',
    verifiedSince: 2024,
    completedJobs: 0,
  };
};

const ServiceDetailPage = () => {
  const { category, sub } = useParams();
  const { lang } = useLang();
  const navigate = useNavigate();
  const { track, trackPageView } = useAnalytics();

  const cat = CATEGORIES.find(c => c.slug === category);
  const subs = SUBCATEGORIES[category] || [];
  const service = subs.find(s => s.slug === sub);

  useEffect(() => { trackPageView('service_detail'); }, []);
  useEffect(() => {
    if (category && sub) {
      track(AnalyticsEvents.SERVICE_VIEWED, { category, sub });
    }
  }, [category, sub]);

  // ── Professionals: real API with mock fallback ──
  const [availablePros, setAvailablePros] = useState([]);
  const [loadingPros, setLoadingPros] = useState(true);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await mentorSearchAPI.byCategory(category);
        const results = Array.isArray(data) ? data : data.results || [];
        if (!cancelled) {
          // De-duplicate by user_id (API may return multiple UserSkill rows per user)
          const seen = new Set();
          const unique = [];
          for (const item of results) {
            if (!seen.has(item.user_id)) {
              seen.add(item.user_id);
              unique.push(mapBackendPro(item));
            }
          }
          setAvailablePros(unique.slice(0, 4));
        }
      } catch {
        // Fallback to mock data
        if (!cancelled) {
          setAvailablePros(PROFESSIONALS.filter(p => p.skills.includes(category)).slice(0, 4));
        }
      } finally {
        if (!cancelled) setLoadingPros(false);
      }
    })();
    return () => { cancelled = true; };
  }, [category]);

  // Mock reviews for this service
  const serviceReviews = [
    {
      id: 1,
      initials: 'MF',
      name: 'Maria Fernanda',
      rating: 5,
      date: '2026-02-15',
      text: lang === 'en'
        ? 'Excellent work! Very professional and punctual. Fixed everything in less than an hour. Highly recommend!'
        : 'Trabalho excelente! Muito profissional e pontual. Resolveu tudo em menos de uma hora. Recomendo!',
    },
    {
      id: 2,
      initials: 'JR',
      name: 'João Rodrigues',
      rating: 5,
      date: '2026-01-28',
      text: lang === 'en'
        ? 'Showed up on time, had all the tools and resolved the issue immediately. Great value for money.'
        : 'Apareceu a horas, tinha todas as ferramentas e resolveu o problema imediatamente. Excelente preço.',
    },
    {
      id: 3,
      initials: 'AS',
      name: 'Ana Sousa',
      rating: 4,
      date: '2026-01-10',
      text: lang === 'en'
        ? 'Very professional service. Small delay at the start but the quality of work was impeccable.'
        : 'Serviço muito profissional. Pequeno atraso no início mas a qualidade do trabalho foi impecável.',
    },
  ];

  if (!cat || !service) {
    return (
      <div className="sdp-not-found container">
        <h2><T pt="Serviço não encontrado." en="Service not found." sv="Tjänst ej hittad." /></h2>
        <Link to={`/client/services/${category || ''}`} className="btn-primary">
          <T pt="← Voltar" en="← Back" sv="← Tillbaka" />
        </Link>
      </div>
    );
  }

  const handleBookNow = (proId) => {
    const params = new URLSearchParams({ service: sub, category, ...(proId ? { pro: proId } : {}) });
    navigate(`/client/wizard?${params.toString()}`);
  };

  return (
    <div className="service-detail-page">
      <div className="container">
        <div className="sdp-layout">
          {/* ── Main Content ── */}
          <div className="sdp-main">
            <div className="sdp-header">
              <div className="sdp-header-icon"><cat.Icon size={24} /></div>
              <div>
                <div className="sdp-category-tag">{getLabel(cat.name, lang)}</div>
                <h1>{getLabel(service.name, lang)}</h1>
              </div>
            </div>

            {/* Description */}
            <div className="sdp-section">
              <h2><T pt="Sobre este serviço" en="About this service" sv="Om denna tjänst" /></h2>
              <p className="sdp-full-desc">{getLabel(service.fullDesc, lang)}</p>
            </div>

            {/* Included */}
            <div className="sdp-section">
              <h2><T pt="O que está incluído" en="What's included" sv="Vad ingår" /></h2>
              <ul className="sdp-included-list">
                {(getLabel(service.included, lang) || []).map((item, i) => (
                  <li key={i}>
                    <CheckCircle size={16} className="sdp-check" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not included */}
            <div className="sdp-section">
              <h2><T pt="Não incluído" en="Not included" sv="Ingår ej" /></h2>
              <ul className="sdp-excluded-list">
                {(getLabel(service.notIncluded, lang) || []).map((item, i) => (
                  <li key={i}>
                    <XCircle size={16} className="sdp-x" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reviews */}
            <div className="sdp-section">
              <h2>
                <T pt="Avaliações" en="Reviews" sv="Omdömen" />
                <span className="sdp-reviews-count">
                  ({serviceReviews.length})
                </span>
              </h2>
              <div className="sdp-reviews-list">
                {serviceReviews.map(review => (
                  <div key={review.id} className="sdp-review-card">
                    <div className="sdp-review-avatar">{review.initials}</div>
                    <div className="sdp-review-body">
                      <div className="sdp-review-top">
                        <strong>{review.name}</strong>
                        <div className="sdp-review-stars">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} size={13} fill="currentColor" />
                          ))}
                        </div>
                        <span className="sdp-review-date">
                          {new Date(review.date).toLocaleDateString(
                            lang === 'en' ? 'en-GB' : lang === 'sv' ? 'sv-SE' : 'pt-PT',
                            { day: 'numeric', month: 'short', year: 'numeric' }
                          )}
                        </span>
                      </div>
                      <p className="sdp-review-text">&ldquo;{review.text}&rdquo;</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="sdp-sidebar">
            <div className="sdp-price-box">
              <div className="sdp-price-label">
                <T pt="A partir de" en="Starting from" sv="Från" />
              </div>
              <div className="sdp-price-value">€{service.price.toFixed(2)}</div>
              <div className="sdp-duration-pill">
                <Clock size={14} />
                {getLabel(service.duration, lang)}
              </div>
              <p className="sdp-price-note">
                <T
                  pt="Preço fixo. Sem surpresas. Confirmado antes de iniciar."
                  en="Fixed price. No surprises. Confirmed before starting."
                  sv="Fast pris. Inga överraskningar. Bekräftat innan start."
                />
              </p>
              <button
                className="sdp-book-btn"
                onClick={() => handleBookNow(null)}
              >
                <CalendarClock size={18} />
                <T pt="Reservar agora" en="Book now" sv="Boka nu" />
              </button>
              <div className="sdp-trust-badges">
                <div className="sdp-trust-badge">
                  <ShieldCheck size={15} />
                  <T pt="100% Verificado" en="100% Verified" sv="100% Verifierad" />
                </div>
                <div className="sdp-trust-badge">
                  <CalendarClock size={15} />
                  <T pt="Cancelamento gratuito" en="Free cancellation" sv="Gratis avbokning" />
                </div>
                <div className="sdp-trust-badge">
                  <Headphones size={15} />
                  <T pt="Suporte 24/7" en="24/7 Support" sv="Support 24/7" />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Available Professionals ── */}
        <section className="sdp-pros-section">
          <h2 className="sdp-pros-title">
            <T pt="Profissionais disponíveis" en="Available professionals" sv="Tillgängliga proffs" />
          </h2>
          {loadingPros ? (
            <div className="sdp-pros-loading">
              <Loader size={24} className="sdp-spinner" />
              <T pt="A procurar profissionais..." en="Searching professionals..." sv="Söker proffs..." />
            </div>
          ) : availablePros.length === 0 ? (
            <p className="sdp-no-pros">
              <T
                pt="Nenhum profissional disponível de momento. Tente mais tarde."
                en="No professionals available at the moment. Try again later."
                sv="Inga proffs tillgängliga just nu. Försök igen senare."
              />
            </p>
          ) : (
            <div className="sdp-pros-grid">
              {availablePros.map(pro => (
                <div key={pro.id} className="sdp-pro-card">
                  <div className="sdp-pro-avatar">
                    {pro.avatar
                      ? <img src={pro.avatar} alt={pro.name} loading="lazy" />
                      : <span>{pro.initials}</span>
                    }
                  </div>
                  <div className="sdp-pro-info">
                    <div className="sdp-pro-name">{pro.name}</div>
                    <div className="sdp-pro-location">{pro.location}</div>
                    <div className="sdp-pro-meta">
                      <span className="sdp-pro-rating">
                        <Star size={12} fill="currentColor" /> {pro.rating}
                      </span>
                      <span className="sdp-pro-reviews">({pro.reviewCount})</span>
                      <span className="sdp-pro-badge badge-{pro.badge.toLowerCase()}">
                        {pro.badge}
                      </span>
                    </div>
                    <div className="sdp-pro-price">€{pro.pricePerHour}/h</div>
                  </div>
                  <button
                    className="sdp-pro-book-btn"
                    onClick={() => handleBookNow(pro.id)}
                  >
                    <T pt="Reservar" en="Book" sv="Boka" />
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
