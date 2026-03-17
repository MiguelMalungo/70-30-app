import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { T, useLang } from '../../context/LanguageContext';
import {
  MapPin, Briefcase, Heart, ChevronRight, Check,
  CreditCard, Bell, Wrench, BookOpen, Leaf, Zap,
  Hammer, Paintbrush, Droplets, Settings2,
} from 'lucide-react';
import PageMeta from '../../components/ui/PageMeta';
import './Onboarding.css';

const INTEREST_AREAS = [
  { key: 'plumbing',    Icon: Droplets,  pt: 'Canalização',  en: 'Plumbing',  sv: 'VVS' },
  { key: 'electrical',  Icon: Zap,       pt: 'Eletricidade', en: 'Electrical', sv: 'El' },
  { key: 'carpentry',   Icon: Hammer,    pt: 'Carpintaria',  en: 'Carpentry', sv: 'Snickeri' },
  { key: 'painting',    Icon: Paintbrush,pt: 'Pintura',      en: 'Painting',  sv: 'Målning' },
  { key: 'assembly',    Icon: Wrench,    pt: 'Montagem',     en: 'Assembly',  sv: 'Montering' },
  { key: 'garden',      Icon: Leaf,      pt: 'Jardim',       en: 'Gardening', sv: 'Trädgård' },
  { key: 'maintenance', Icon: Settings2, pt: 'Manutenção',   en: 'Maintenance', sv: 'Underhåll' },
  { key: 'tutoring',    Icon: BookOpen,  pt: 'Explicações',  en: 'Tutoring',  sv: 'Handledning' },
];

const NOTIFICATION_OPTIONS = [
  { key: 'new_requests', pt: 'Novos pedidos de serviço', en: 'New service requests', sv: 'Nya tjänsteförfrågningar' },
  { key: 'booking_updates', pt: 'Actualizações de reservas', en: 'Booking updates', sv: 'Bokningsuppdateringar' },
  { key: 'messages', pt: 'Novas mensagens', en: 'New messages', sv: 'Nya meddelanden' },
  { key: 'reviews', pt: 'Novas avaliações', en: 'New reviews', sv: 'Nya omdömen' },
];

/* ── Client Onboarding ── */
const ClientOnboarding = ({ onDone, lang }) => {
  const [notifications, setNotifications] = useState({ booking_updates: true, messages: true });
  const [preferredPayment, setPreferredPayment] = useState('card');

  const toggle = (key) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="ob-step">
      <div className="ob-step-icon"><Heart size={32} /></div>
      <h2><T pt="Bem-vindo à 70-30!" en="Welcome to 70-30!" sv="Välkommen till 70-30!" /></h2>
      <p className="ob-step-desc">
        <T pt="Configura as tuas preferências para uma melhor experiência." en="Set up your preferences for a better experience." sv="Konfigurera dina inställningar för en bättre upplevelse." />
      </p>

      <div className="ob-section">
        <h3 className="ob-section-title"><CreditCard size={16} /><T pt="Método de pagamento preferido" en="Preferred payment method" sv="Föredragen betalningsmetod" /></h3>
        <div className="ob-payment-options">
          {[
            { key: 'card', pt: 'Cartão de crédito/débito', en: 'Credit/debit card', sv: 'Kredit-/betalkort' },
            { key: 'mbway', pt: 'MB WAY', en: 'MB WAY', sv: 'MB WAY' },
            { key: 'multibanco', pt: 'Multibanco', en: 'Multibanco', sv: 'Multibanco' },
          ].map(opt => (
            <button
              key={opt.key}
              className={`ob-payment-btn ${preferredPayment === opt.key ? 'selected' : ''}`}
              onClick={() => setPreferredPayment(opt.key)}
            >
              {preferredPayment === opt.key && <Check size={14} />}
              {opt[lang] || opt.en}
            </button>
          ))}
        </div>
      </div>

      <div className="ob-section">
        <h3 className="ob-section-title"><Bell size={16} /><T pt="Notificações" en="Notifications" sv="Notifikationer" /></h3>
        <div className="ob-notifications">
          {NOTIFICATION_OPTIONS.filter(n => ['booking_updates', 'messages', 'reviews'].includes(n.key)).map(n => (
            <label key={n.key} className="ob-notif-row">
              <span>{n[lang] || n.en}</span>
              <div className={`ob-toggle ${notifications[n.key] ? 'on' : ''}`} onClick={() => toggle(n.key)}>
                <div className="ob-toggle-knob" />
              </div>
            </label>
          ))}
        </div>
      </div>

      <button className="ob-done-btn" onClick={onDone}>
        <T pt="Continuar para o painel" en="Continue to dashboard" sv="Fortsätt till panelen" />
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

/* ── Pro Onboarding ── */
const ProOnboarding = ({ onDone, lang }) => {
  const [selected, setSelected] = useState([]);
  const [yearsExp, setYearsExp] = useState('');
  const [notifications, setNotifications] = useState({ new_requests: true, booking_updates: true, messages: true });

  const toggleArea = (key) => setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  const toggleNotif = (key) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="ob-step">
      <div className="ob-step-icon pro"><Briefcase size={32} /></div>
      <h2><T pt="O teu perfil profissional" en="Your professional profile" sv="Din professionella profil" /></h2>
      <p className="ob-step-desc">
        <T pt="Diz-nos em que áreas podes ajudar os clientes." en="Tell us which areas you can help clients with." sv="Berätta vilka områden du kan hjälpa kunder med." />
      </p>

      <div className="ob-section">
        <h3 className="ob-section-title"><Wrench size={16} /><T pt="Áreas de especialização" en="Areas of expertise" sv="Expertisområden" /></h3>
        <div className="ob-interests-grid">
          {INTEREST_AREAS.map(area => (
            <button
              key={area.key}
              className={`ob-interest-btn ${selected.includes(area.key) ? 'selected' : ''}`}
              onClick={() => toggleArea(area.key)}
            >
              <area.Icon size={20} />
              <span>{area[lang] || area.en}</span>
              {selected.includes(area.key) && <Check size={13} className="ob-interest-check" />}
            </button>
          ))}
        </div>
      </div>

      <div className="ob-section">
        <h3 className="ob-section-title"><Briefcase size={16} /><T pt="Anos de experiência" en="Years of experience" sv="Års erfarenhet" /></h3>
        <input
          className="ob-input"
          type="number"
          min="0"
          max="50"
          value={yearsExp}
          onChange={e => setYearsExp(e.target.value)}
          placeholder={lang === 'pt' ? 'Ex: 5' : 'E.g.: 5'}
        />
      </div>

      <div className="ob-section">
        <h3 className="ob-section-title"><Bell size={16} /><T pt="Notificações" en="Notifications" sv="Notifikationer" /></h3>
        <div className="ob-notifications">
          {NOTIFICATION_OPTIONS.map(n => (
            <label key={n.key} className="ob-notif-row">
              <span>{n[lang] || n.en}</span>
              <div className={`ob-toggle ${notifications[n.key] ? 'on' : ''}`} onClick={() => toggleNotif(n.key)}>
                <div className="ob-toggle-knob" />
              </div>
            </label>
          ))}
        </div>
      </div>

      <button className="ob-done-btn" onClick={onDone} disabled={selected.length === 0}>
        <T pt="Começar a trabalhar" en="Start working" sv="Börja arbeta" />
        <ChevronRight size={18} />
      </button>
      {selected.length === 0 && (
        <p className="ob-hint"><T pt="Selecciona pelo menos uma área" en="Select at least one area" sv="Välj minst ett område" /></p>
      )}
    </div>
  );
};

/* ── Main Onboarding Page ── */
const Onboarding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang } = useLang();
  const role = (searchParams.get('role') || 'CLIENT').toUpperCase();
  const isPro = ['MENTOR', 'MASTER', 'APPRENTICE'].includes(role);

  const handleDone = () => {
    navigate(isPro ? '/pro' : '/client');
  };

  return (
    <div className="onboarding-page">
      <PageMeta title={lang === 'pt' ? 'Configuração' : lang === 'sv' ? 'Konfiguration' : 'Setup'} />
      <div className="onboarding-card">
        <div className="ob-progress">
          <div className="ob-progress-step done"><Check size={14} /><span><T pt="Conta criada" en="Account created" sv="Konto skapat" /></span></div>
          <div className="ob-progress-line active" />
          <div className="ob-progress-step active"><MapPin size={14} /><span><T pt="Preferências" en="Preferences" sv="Inställningar" /></span></div>
          <div className="ob-progress-line" />
          <div className="ob-progress-step"><ChevronRight size={14} /><span><T pt="Painel" en="Dashboard" sv="Panel" /></span></div>
        </div>

        {isPro
          ? <ProOnboarding onDone={handleDone} lang={lang} />
          : <ClientOnboarding onDone={handleDone} lang={lang} />
        }
      </div>
    </div>
  );
};

export default Onboarding;
