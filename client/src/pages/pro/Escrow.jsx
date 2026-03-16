import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { T, useLang } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Shield, ArrowRight, CheckCircle, Clock, AlertTriangle,
  CreditCard, Lock, Unlock, ArrowDown, Banknote, UserCheck,
  Wallet, Building2
} from 'lucide-react';
import imgPayment from '../../assets/images/payment.webp';
import PageMeta from '../../components/ui/PageMeta';
import useAnalytics, { AnalyticsEvents } from '../../hooks/useAnalytics';
import { createRateLimiter, sanitizeCardNumber, sanitizeExpiry, sanitizeCVC } from '../../utils/sanitize';
import './Escrow.css';

const paymentLimiter = createRateLimiter(3, 30000); // max 3 payment attempts per 30s

const STEPS = [
  { key: 'booked',    icon: CreditCard,   pt: 'Reserva feita',        en: 'Booking placed',     sv: 'Bokning gjord' },
  { key: 'held',      icon: Lock,         pt: 'Pagamento retido',     en: 'Payment held',       sv: 'Betalning hållen' },
  { key: 'service',   icon: UserCheck,    pt: 'Serviço realizado',    en: 'Service completed',  sv: 'Tjänst utförd' },
  { key: 'released',  icon: Unlock,       pt: 'Pagamento libertado',  en: 'Payment released',   sv: 'Betalning frigiven' },
  { key: 'paid',      icon: Banknote,     pt: 'Pro recebe',           en: 'Pro gets paid',      sv: 'Pro får betalt' },
];

const MOCK_ESCROW = {
  id: 'ESC-20260315-001',
  service: { pt: 'Reparação de canalização', en: 'Plumbing repair', sv: 'VVS-reparation' },
  client: 'Carlos M.',
  pro: 'Vítor Costa',
  amount: 85.00,
  fee: 25.50,
  payout: 59.50,
  status: 'held',
  createdAt: '2026-03-14T10:30:00',
};

const Escrow = () => {
  const { user } = useAuth();
  const { lang } = useLang();
  const { addToast } = useNotifications();
  const { track } = useAnalytics();
  const t = (pt, en, sv) => ({ pt, en, sv }[lang] ?? en);

  const [escrow, setEscrow] = useState(MOCK_ESCROW);
  const [animating, setAnimating] = useState(false);
  const [payMethod, setPayMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const currentIdx = STEPS.findIndex(s => s.key === escrow.status);

  const advanceStep = () => {
    if (animating || currentIdx >= STEPS.length - 1) return;
    setAnimating(true);
    setTimeout(() => {
      setEscrow(prev => ({ ...prev, status: STEPS[currentIdx + 1].key }));
      setAnimating(false);
    }, 600);
  };

  const resetDemo = () => {
    setEscrow({ ...MOCK_ESCROW, status: 'booked' });
    setPaymentDone(false);
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (paymentLimiter()) {
      addToast(t('Demasiadas tentativas. Aguarda 30s.', 'Too many attempts. Wait 30s.', 'För många försök. Vänta 30s.'), 'error');
      return;
    }
    track(AnalyticsEvents.PAYMENT_STARTED, { method: payMethod, amount: escrow.amount });
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentDone(true);
      setEscrow(prev => ({ ...prev, status: 'held' }));
      track(AnalyticsEvents.PAYMENT_COMPLETED, { method: payMethod, amount: escrow.amount });
      addToast(t('Pagamento processado com sucesso!', 'Payment processed successfully!', 'Betalning genomförd!'), 'success');
    }, 2000);
  };

  const formatCardNumber = (val) => {
    const digits = sanitizeCardNumber(val);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    return sanitizeExpiry(val);
  };

  const statusColor = (idx) => {
    if (idx < currentIdx) return 'step-done';
    if (idx === currentIdx) return 'step-active';
    return 'step-pending';
  };

  return (
    <div className="escrow-page">
      <PageMeta title={t('Pagamento', 'Payment', 'Betalning')} />
      {/* Hero */}
      <div className="escrow-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(25,55,48,0.88) 0%, rgba(13,43,34,0.75) 60%, rgba(25,55,48,0.88) 100%), url(${imgPayment})`, backgroundSize: 'cover', backgroundPosition: 'top' }}>
        <div className="container escrow-hero-inner">
          <div className="escrow-hero-text">
            <p className="escrow-overline">
              <Shield size={14} />
              <T pt="Pagamento protegido" en="Protected payment" sv="Skyddad betalning" />
            </p>
            <h1><T pt="Sistema de Escrow" en="Escrow System" sv="Spärrsystem" /></h1>
            <p><T
              pt="Pagamentos seguros processados via Stripe com escrow integrado."
              en="Secure payments processed via Stripe with integrated escrow."
              sv="Säkra betalningar via Stripe med integrerad spärr."
            /></p>
          </div>
        </div>
      </div>

      <div className="container escrow-body">
        {/* Payment Checkout Card */}
        <div className="escrow-checkout-card">
          <div className="escrow-checkout-header">
            <Shield size={18} />
            <h2><T pt="Checkout seguro" en="Secure checkout" sv="Säker utcheckning" /></h2>
            <div className="escrow-checkout-badges">
              <span className="escrow-badge-stripe">Stripe</span>
              <Lock size={12} />
            </div>
          </div>

          {/* Method selector */}
          <div className="escrow-pay-methods">
            <button className={`escrow-method-btn ${payMethod === 'card' ? 'active' : ''}`} onClick={() => { setPayMethod('card'); track(AnalyticsEvents.PAYMENT_METHOD_SELECTED, { method: 'card' }); }}>
              <CreditCard size={18} />
              <T pt="Cartão" en="Card" sv="Kort" />
            </button>
            <button className={`escrow-method-btn ${payMethod === 'paypal' ? 'active' : ''}`} onClick={() => { setPayMethod('paypal'); track(AnalyticsEvents.PAYMENT_METHOD_SELECTED, { method: 'paypal' }); }}>
              <Wallet size={18} />
              PayPal
            </button>
            <button className={`escrow-method-btn ${payMethod === 'bank' ? 'active' : ''}`} onClick={() => { setPayMethod('bank'); track(AnalyticsEvents.PAYMENT_METHOD_SELECTED, { method: 'bank' }); }}>
              <Building2 size={18} />
              MB Way
            </button>
          </div>

          {payMethod === 'card' && !paymentDone && (
            <form className="escrow-card-form" onSubmit={handlePayment}>
              <div className="escrow-field">
                <label><T pt="Número do cartão" en="Card number" sv="Kortnummer" /></label>
                <div className="escrow-input-wrap">
                  <CreditCard size={16} className="escrow-input-icon" />
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    className="escrow-input"
                  />
                </div>
              </div>
              <div className="escrow-field-row">
                <div className="escrow-field">
                  <label><T pt="Validade" en="Expiry" sv="Utgångsdatum" /></label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                    className="escrow-input"
                  />
                </div>
                <div className="escrow-field">
                  <label>CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardCvc}
                    onChange={e => setCardCvc(sanitizeCVC(e.target.value))}
                    className="escrow-input"
                  />
                </div>
              </div>
              <button type="submit" className="escrow-pay-btn" disabled={paymentProcessing}>
                {paymentProcessing ? (
                  <><Clock size={16} className="spin" /> <T pt="A processar…" en="Processing…" sv="Bearbetar…" /></>
                ) : (
                  <><Lock size={16} /> <T pt="Pagar" en="Pay" sv="Betala" /> €{escrow.amount.toFixed(2)}</>
                )}
              </button>
              <p className="escrow-secure-note">
                <Lock size={12} />
                <T pt="Encriptação SSL de 256 bits. Os dados nunca são armazenados." en="256-bit SSL encryption. Data is never stored." sv="256-bitars SSL-kryptering. Data lagras aldrig." />
              </p>
            </form>
          )}

          {payMethod === 'paypal' && !paymentDone && (
            <div className="escrow-alt-pay">
              <button className="escrow-paypal-btn" onClick={handlePayment} disabled={paymentProcessing}>
                {paymentProcessing ? (
                  <><Clock size={16} className="spin" /> <T pt="A processar…" en="Processing…" sv="Bearbetar…" /></>
                ) : (
                  <><Wallet size={18} /> <T pt="Pagar com PayPal" en="Pay with PayPal" sv="Betala med PayPal" /> — €{escrow.amount.toFixed(2)}</>
                )}
              </button>
            </div>
          )}

          {payMethod === 'bank' && !paymentDone && (
            <div className="escrow-alt-pay">
              <button className="escrow-mbway-btn" onClick={handlePayment} disabled={paymentProcessing}>
                {paymentProcessing ? (
                  <><Clock size={16} className="spin" /> <T pt="A processar…" en="Processing…" sv="Bearbetar…" /></>
                ) : (
                  <><Building2 size={18} /> <T pt="Pagar com MB Way" en="Pay with MB Way" sv="Betala med MB Way" /> — €{escrow.amount.toFixed(2)}</>
                )}
              </button>
            </div>
          )}

          {paymentDone && (
            <motion.div className="escrow-pay-success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <CheckCircle size={32} />
              <h3><T pt="Pagamento confirmado" en="Payment confirmed" sv="Betalning bekräftad" /></h3>
              <p><T pt="Os fundos foram retidos em escrow até conclusão do serviço." en="Funds are held in escrow until service completion." sv="Medel hålls i spärr tills tjänsten är slutförd." /></p>
            </motion.div>
          )}
        </div>

        {/* Flow Visualiser */}
        <div className="escrow-flow-card">
          <h2><T pt="Fluxo de pagamento" en="Payment flow" sv="Betalningsflöde" /></h2>

          <div className="escrow-steps">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const cls = statusColor(idx);
              return (
                <React.Fragment key={step.key}>
                  <motion.div
                    className={`escrow-step ${cls}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <div className="escrow-step-icon">
                      {cls === 'step-done' ? <CheckCircle size={22} /> : <Icon size={22} />}
                    </div>
                    <span className="escrow-step-label">{step[lang] ?? step.en}</span>
                  </motion.div>
                  {idx < STEPS.length - 1 && (
                    <div className={`escrow-arrow ${idx < currentIdx ? 'arrow-done' : ''}`}>
                      <ArrowRight size={18} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="escrow-actions">
            {currentIdx < STEPS.length - 1 ? (
              <button className="escrow-btn-advance" onClick={advanceStep} disabled={animating}>
                {animating ? (
                  <><Clock size={16} /> <T pt="A processar…" en="Processing…" sv="Bearbetar…" /></>
                ) : (
                  <><ArrowDown size={16} /> <T pt="Avançar etapa" en="Advance step" sv="Gå vidare" /></>
                )}
              </button>
            ) : (
              <motion.div
                className="escrow-complete-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <CheckCircle size={20} />
                <T pt="Pagamento concluído!" en="Payment complete!" sv="Betalning klar!" />
              </motion.div>
            )}
            <button className="escrow-btn-reset" onClick={resetDemo}>
              <T pt="Reiniciar demo" en="Reset demo" sv="Starta om demo" />
            </button>
          </div>
        </div>

        {/* Transaction Detail Card */}
        <div className="escrow-detail-card">
          <h3><T pt="Detalhes da transação" en="Transaction details" sv="Transaktionsdetaljer" /></h3>

          <div className="escrow-detail-grid">
            <div className="escrow-detail-row">
              <span className="escrow-detail-label">ID</span>
              <span className="escrow-detail-value mono">{escrow.id}</span>
            </div>
            <div className="escrow-detail-row">
              <span className="escrow-detail-label"><T pt="Serviço" en="Service" sv="Tjänst" /></span>
              <span className="escrow-detail-value">{escrow.service[lang] ?? escrow.service.en}</span>
            </div>
            <div className="escrow-detail-row">
              <span className="escrow-detail-label"><T pt="Cliente" en="Client" sv="Kund" /></span>
              <span className="escrow-detail-value">{escrow.client}</span>
            </div>
            <div className="escrow-detail-row">
              <span className="escrow-detail-label"><T pt="Profissional" en="Professional" sv="Yrkesman" /></span>
              <span className="escrow-detail-value">{escrow.pro}</span>
            </div>

            <hr className="escrow-divider" />

            <div className="escrow-detail-row">
              <span className="escrow-detail-label"><T pt="Valor total" en="Total amount" sv="Totalt belopp" /></span>
              <span className="escrow-detail-value bold">€{escrow.amount.toFixed(2)}</span>
            </div>
            <div className="escrow-detail-row">
              <span className="escrow-detail-label"><T pt="Taxa 70/30" en="70/30 fee" sv="70/30-avgift" /> (30%)</span>
              <span className="escrow-detail-value fee">−€{escrow.fee.toFixed(2)}</span>
            </div>
            <div className="escrow-detail-row highlight">
              <span className="escrow-detail-label"><T pt="Pagamento ao Pro" en="Pro payout" sv="Utbetalning till Pro" /> (70%)</span>
              <span className="escrow-detail-value payout">€{escrow.payout.toFixed(2)}</span>
            </div>
          </div>

          <div className={`escrow-status-bar status-${escrow.status}`}>
            {escrow.status === 'paid' ? <CheckCircle size={16} /> : escrow.status === 'held' ? <Lock size={16} /> : <Clock size={16} />}
            <span>
              {escrow.status === 'booked' && t('Reserva confirmada', 'Booking confirmed', 'Bokning bekräftad')}
              {escrow.status === 'held' && t('Fundos retidos em escrow', 'Funds held in escrow', 'Medel hålls i spärr')}
              {escrow.status === 'service' && t('Serviço em curso', 'Service in progress', 'Tjänst pågår')}
              {escrow.status === 'released' && t('Pagamento a ser transferido', 'Payment being transferred', 'Betalning överförs')}
              {escrow.status === 'paid' && t('Pagamento recebido', 'Payment received', 'Betalning mottagen')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Escrow;
