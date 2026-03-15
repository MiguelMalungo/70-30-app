import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { T, useLang } from '../../context/LanguageContext';
import {
  Briefcase, CheckCircle, XCircle, Euro,
  MapPin, Calendar, ChevronRight, Loader,
  AlertCircle, Hourglass, Banknote, TrendingUp, X,
} from 'lucide-react';
import { bookingsAPI } from '../../services/api';
import imgMentor from '../../assets/images/cat-eletricidade.png';
import imgApprentice from '../../assets/images/aprentice.png';
import './Dashboard.css';

const STATUS_CONFIG = {
  PENDING:   { icon: Hourglass,   cls: 'pro-status-pending',   pt: 'Pendente',  en: 'Pending',   sv: 'Väntande' },
  ACCEPTED:  { icon: Calendar,    cls: 'pro-status-active',    pt: 'Activo',    en: 'Active',    sv: 'Aktivt' },
  COMPLETED: { icon: CheckCircle, cls: 'pro-status-done',      pt: 'Concluído', en: 'Completed', sv: 'Slutfört' },
  CANCELLED: { icon: XCircle,     cls: 'pro-status-cancelled', pt: 'Cancelado', en: 'Cancelled', sv: 'Avbokat' },
  REJECTED:  { icon: XCircle,     cls: 'pro-status-cancelled', pt: 'Rejeitado', en: 'Rejected',  sv: 'Avvisat' },
};

const PLATFORM_CUT = 0.50;
const MENTOR_CUT   = 0.25;
const MENTEE_CUT   = 0.25;

const mapBooking = (b) => {
  const start = new Date(b.start_time);
  const client = b.mentee_name || b.client_name || 'Cliente';
  const initials = client.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const price = parseFloat(b.price) || 80;
  return {
    id: b.id, clientName: client, clientInitials: initials,
    service: b.skill_name || 'Serviço', category: b.category_name || '',
    categorySlug: b.category_slug || '',
    date: start.toISOString().split('T')[0],
    time: start.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    address: b.address || '', note: b.note || '',
    price, myPayout: price * MENTOR_CUT, status: b.status,
  };
};

const MOCK_GIGS = [
  { id: 101, clientName: 'Mariana Silva', clientInitials: 'MS', service: 'Reparação de torneira', category: 'Canalização', categorySlug: 'canalizacao', date: '2026-03-18', time: '10:00', address: 'Rua Augusta 22, Lisboa', note: 'Torneira a pingar há 3 dias.', price: 80, myPayout: 20, status: 'PENDING' },
  { id: 102, clientName: 'Carlos Fonseca', clientInitials: 'CF', service: 'Instalação de tomadas', category: 'Eletricidade', categorySlug: 'eletricidade', date: '2026-03-20', time: '14:00', address: 'Av. da Liberdade 100, Lisboa', note: '', price: 120, myPayout: 30, status: 'PENDING' },
  { id: 103, clientName: 'Ana Rodrigues', clientInitials: 'AR', service: 'Montagem de móveis IKEA', category: 'Montagem', categorySlug: 'montagem', date: '2026-03-16', time: '09:00', address: 'Rua de Santa Catarina 5, Porto', note: 'Mesa e 2 cadeiras.', price: 60, myPayout: 15, status: 'ACCEPTED' },
  { id: 104, clientName: 'Pedro Matos', clientInitials: 'PM', service: 'Pintura de quarto', category: 'Pintura', categorySlug: 'pintura', date: '2026-03-10', time: '08:00', address: 'Rua do Carmo 14, Lisboa', note: '', price: 180, myPayout: 45, status: 'COMPLETED' },
  { id: 105, clientName: 'Sofia Torres', clientInitials: 'ST', service: 'Corte de relva', category: 'Jardim', categorySlug: 'jardim', date: '2026-03-08', time: '11:00', address: 'Rua das Flores 8, Cascais', note: '', price: 50, myPayout: 12.5, status: 'COMPLETED' },
];

const COLUMNS = [
  { key: 'PENDING',   pt: 'Oportunidades', en: 'Opportunities', sv: 'Möjligheter', color: 'orange' },
  { key: 'ACCEPTED',  pt: 'Em curso',       en: 'In Progress',   sv: 'Pågående',    color: 'blue' },
  { key: 'COMPLETED', pt: 'Histórico',      en: 'History',       sv: 'Historik',    color: 'green' },
];

const JobDetailsModal = ({ booking, onClose, onAccept, onReject, actionLoading, lang }) => {
  if (!booking) return null;
  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  return (
    <motion.div className="pro-modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="pro-modal" onClick={e => e.stopPropagation()} initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}>
        <button className="pro-modal-close" onClick={onClose}><X size={18} /></button>
        <div className="pro-modal-header">
          <div className="pro-modal-avatar">{booking.clientInitials}</div>
          <div className="pro-modal-header-info">
            <h3 className="pro-modal-client">{booking.clientName}</h3>
            <p className="pro-modal-service">{booking.service}</p>
          </div>
          <div className={`pro-status-badge ${cfg.cls}`}>
            <StatusIcon size={12} />{cfg[lang] || cfg.en}
          </div>
        </div>
        <div className="pro-modal-details">
          <div className="pro-modal-detail-row"><Calendar size={15} /><span>{booking.date} · {booking.time}</span></div>
          {booking.address && <div className="pro-modal-detail-row"><MapPin size={15} /><span>{booking.address}</span></div>}
          {booking.note && <div className="pro-modal-detail-row"><AlertCircle size={15} /><span>&ldquo;{booking.note}&rdquo;</span></div>}
        </div>
        <div className="pro-modal-payout">
          <h4 className="pro-modal-payout-title"><Banknote size={15} /><T pt="Divisão de pagamento" en="Payment split" sv="Betalningsdelning" /></h4>
          <div className="pro-modal-payout-row"><span><T pt="Valor total" en="Total value" sv="Totalvärde" /></span><strong>€{booking.price.toFixed(2)}</strong></div>
          <div className="pro-modal-payout-row muted"><span><T pt="Plataforma (50%)" en="Platform (50%)" sv="Plattform (50%)" /></span><span>−€{(booking.price * PLATFORM_CUT).toFixed(2)}</span></div>
          <div className="pro-modal-payout-row muted"><span><T pt="Aprendiz (25%)" en="Apprentice (25%)" sv="Lärling (25%)" /></span><span>−€{(booking.price * MENTEE_CUT).toFixed(2)}</span></div>
          <div className="pro-modal-payout-row highlight"><span><T pt="O teu ganho (25%)" en="Your payout (25%)" sv="Din utbetalning (25%)" /></span><strong>€{booking.myPayout.toFixed(2)}</strong></div>
        </div>
        {booking.status === 'PENDING' && (
          <div className="pro-modal-actions">
            <button className="pro-modal-btn-reject" onClick={() => onReject(booking.id)} disabled={!!actionLoading}>
              {actionLoading === `reject-${booking.id}` ? <Loader size={15} className="spin" /> : <XCircle size={15} />}
              <T pt="Recusar" en="Decline" sv="Avvisa" />
            </button>
            <button className="pro-modal-btn-accept" onClick={() => onAccept(booking.id)} disabled={!!actionLoading}>
              {actionLoading === `accept-${booking.id}` ? <Loader size={15} className="spin" /> : <CheckCircle size={15} />}
              <T pt="Aceitar gig" en="Accept gig" sv="Acceptera jobb" />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const ProDashboard = () => {
  const { user } = useAuth();
  const { lang } = useLang();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const firstName = user?.firstName || user?.username || 'Pro';
  const heroImg = user?.role === 'APPRENTICE' ? imgApprentice : imgMentor;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await bookingsAPI.list();
        if (!cancelled) {
          const results = Array.isArray(data) ? data : data.results || [];
          setBookings(results.map(mapBooking));
        }
      } catch {
        if (!cancelled) setBookings(MOCK_GIGS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleAccept = async (id) => {
    setActionLoading(`accept-${id}`);
    try { await bookingsAPI.accept(id); } catch { /* fall through */ }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'ACCEPTED' } : b));
    setActionLoading(null);
    setSelectedBooking(null);
  };

  const handleReject = async (id) => {
    setActionLoading(`reject-${id}`);
    try { await bookingsAPI.reject(id); } catch { /* fall through */ }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'REJECTED' } : b));
    setActionLoading(null);
    setSelectedBooking(null);
  };

  const totalEarned  = bookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + b.myPayout, 0);
  const activeCount  = bookings.filter(b => b.status === 'ACCEPTED').length;
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const doneCount    = bookings.filter(b => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status)).length;

  return (
    <div className="pro-dashboard">
      <div className="pro-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(25,55,48,0.88) 0%, rgba(13,43,34,0.75) 60%, rgba(25,55,48,0.88) 100%), url(${heroImg})`, backgroundPosition: 'top' }}>
        <div className="container pro-hero-inner">
          <div className="pro-hero-text">
            <p className="pro-hero-overline"><T pt="Painel profissional" en="Professional panel" sv="Professionell panel" /></p>
            <h1><T pt={`Olá, ${firstName}`} en={`Hello, ${firstName}`} sv={`Hej, ${firstName}`} /></h1>
            <p className="pro-hero-sub"><T pt="Gere os teus gigs, aceita novas oportunidades e acompanha os teus ganhos." en="Manage your gigs, accept new opportunities and track your earnings." sv="Hantera dina jobb, acceptera nya möjligheter och följ dina intäkter." /></p>
          </div>
          <div className="pro-hero-stats">
            <div className="pro-stat"><Hourglass size={20} /><strong>{pendingCount}</strong><span><T pt="Pendentes" en="Pending" sv="Väntande" /></span></div>
            <div className="pro-stat"><Briefcase size={20} /><strong>{activeCount}</strong><span><T pt="Em curso" en="Active" sv="Aktiva" /></span></div>
            <div className="pro-stat"><TrendingUp size={20} /><strong>{doneCount}</strong><span><T pt="Concluídos" en="Done" sv="Klara" /></span></div>
            <div className="pro-stat highlight"><Euro size={20} /><strong>€{totalEarned.toFixed(0)}</strong><span><T pt="Ganhos totais" en="Total earned" sv="Totalt" /></span></div>
          </div>
        </div>
      </div>

      <div className="container pro-kanban-container">
        {loading ? (
          <div className="pro-loading"><Loader size={32} className="spin" /><span><T pt="A carregar gigs…" en="Loading gigs…" sv="Laddar jobb…" /></span></div>
        ) : (
          <div className="pro-kanban">
            {COLUMNS.map(col => {
              const colItems = bookings.filter(b =>
                col.key === 'COMPLETED'
                  ? ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status)
                  : b.status === col.key
              );
              return (
                <div key={col.key} className={`pro-col pro-col-${col.color}`}>
                  <div className="pro-col-header">
                    <span className="pro-col-title">{col[lang] || col.en}</span>
                    <span className="pro-col-count">{colItems.length}</span>
                  </div>
                  <div className="pro-col-body">
                    {colItems.length === 0 ? (
                      <div className="pro-col-empty">
                        {col.key === 'PENDING' ? <T pt="Sem oportunidades de momento" en="No opportunities right now" sv="Inga möjligheter" />
                          : col.key === 'ACCEPTED' ? <T pt="Nenhum gig activo" en="No active gigs" sv="Inga aktiva jobb" />
                          : <T pt="Sem histórico ainda" en="No history yet" sv="Ingen historik än" />}
                      </div>
                    ) : colItems.map((booking, i) => (
                      <motion.div
                        key={booking.id}
                        className="pro-gig-card"
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedBooking(booking)}
                        onKeyDown={e => e.key === 'Enter' && setSelectedBooking(booking)}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.25 }}
                        whileHover={{ y: -2 }}
                      >
                        <div className="pro-gig-header">
                          <div className="pro-gig-avatar">{booking.clientInitials}</div>
                          <div className="pro-gig-info">
                            <span className="pro-gig-client">{booking.clientName}</span>
                            <span className="pro-gig-service">{booking.service}</span>
                          </div>
                          <ChevronRight size={16} className="pro-gig-arrow" />
                        </div>
                        <div className="pro-gig-meta">
                          <div className="pro-gig-meta-item"><Calendar size={12} /><span>{booking.date}</span></div>
                          {booking.address && <div className="pro-gig-meta-item"><MapPin size={12} /><span>{booking.address.split(',')[0]}</span></div>}
                        </div>
                        <div className="pro-gig-footer">
                          <span className="pro-gig-payout"><Banknote size={13} />€{booking.myPayout.toFixed(2)}</span>
                          {col.key === 'PENDING' && (
                            <div className="pro-gig-quick-actions">
                              <button className="pro-quick-reject" onClick={e => { e.stopPropagation(); handleReject(booking.id); }} disabled={!!actionLoading}><X size={13} /></button>
                              <button className="pro-quick-accept" onClick={e => { e.stopPropagation(); handleAccept(booking.id); }} disabled={!!actionLoading}><CheckCircle size={13} /></button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <JobDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} onAccept={handleAccept} onReject={handleReject} actionLoading={actionLoading} lang={lang} />
    </div>
  );
};

export default ProDashboard;
