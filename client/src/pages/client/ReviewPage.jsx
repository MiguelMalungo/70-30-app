import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { T, useLang } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { Star, CheckCircle, User, Wrench, Calendar } from 'lucide-react';
import imgReviews from '../../assets/images/reviews_quality.png';
import './ReviewPage.css';

const MOCK_COMPLETED = [
  { id: 1, pro: 'Vítor Costa', initials: 'VC', service: { pt: 'Canalização', en: 'Plumbing', sv: 'VVS' }, date: '2026-03-12', reviewed: false },
  { id: 2, pro: 'Manuel Rodrigues', initials: 'MR', service: { pt: 'Eletricidade', en: 'Electrical', sv: 'El' }, date: '2026-03-08', reviewed: true, rating: 5 },
  { id: 3, pro: 'João Ferreira', initials: 'JF', service: { pt: 'Carpintaria', en: 'Carpentry', sv: 'Snickeri' }, date: '2026-03-01', reviewed: false },
];

const StarInput = ({ value, onChange }) => (
  <div className="review-stars-input">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" className={`review-star-btn ${n <= value ? 'filled' : ''}`} onClick={() => onChange(n)}>
        <Star size={28} fill={n <= value ? '#f97316' : 'none'} />
      </button>
    ))}
  </div>
);

const ReviewPage = () => {
  const { lang } = useLang();
  const { addToast } = useNotifications();
  const navigate = useNavigate();
  const t = (pt, en, sv) => ({ pt, en, sv }[lang] ?? en);

  const [bookings, setBookings] = useState(MOCK_COMPLETED);
  const [activeReview, setActiveReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setBookings(prev => prev.map(b => b.id === activeReview ? { ...b, reviewed: true, rating } : b));
    setSubmitted(true);
    addToast(t('Avaliação enviada!', 'Review submitted!', 'Omdöme skickat!'), 'success');
    setTimeout(() => {
      setActiveReview(null);
      setRating(0);
      setComment('');
      setSubmitted(false);
    }, 2000);
  };

  const pending = bookings.filter(b => !b.reviewed);
  const done = bookings.filter(b => b.reviewed);

  return (
    <div className="review-page">
      <div className="review-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(25,55,48,0.88) 0%, rgba(13,43,34,0.75) 60%, rgba(25,55,48,0.88) 100%), url(${imgReviews})`, backgroundSize: 'cover', backgroundPosition: 'top' }}>
        <div className="container">
          <p className="review-overline"><T pt="Feedback" en="Feedback" sv="Feedback" /></p>
          <h1><T pt="Avaliar serviços" en="Rate services" sv="Betygsätt tjänster" /></h1>
          <p><T pt="Ajuda a comunidade avaliando os profissionais." en="Help the community by rating professionals." sv="Hjälp gemenskapen genom att betygsätta yrkesmän." /></p>
        </div>
      </div>

      <div className="container review-body">
        {/* Pending reviews */}
        {pending.length > 0 && (
          <div className="review-section">
            <h2><T pt="Aguardam avaliação" en="Awaiting review" sv="Väntar på omdöme" /> ({pending.length})</h2>
            <div className="review-cards">
              {pending.map(b => (
                <motion.div key={b.id} className="review-card pending" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="review-card-avatar">{b.initials}</div>
                  <div className="review-card-info">
                    <span className="review-card-pro">{b.pro}</span>
                    <span className="review-card-service"><Wrench size={13} /> {b.service[lang] ?? b.service.en}</span>
                    <span className="review-card-date"><Calendar size={13} /> {b.date}</span>
                  </div>
                  <button className="review-card-btn" onClick={() => { setActiveReview(b.id); setRating(0); setComment(''); setSubmitted(false); }}>
                    <Star size={14} /> <T pt="Avaliar" en="Review" sv="Betygsätt" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Review form modal */}
        {activeReview && !submitted && (() => {
          const booking = bookings.find(b => b.id === activeReview);
          return (
            <motion.div className="review-form-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="review-form-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                <h3><T pt="Avaliar" en="Rate" sv="Betygsätt" /> {booking.pro}</h3>
                <p className="review-form-service">{booking.service[lang] ?? booking.service.en} — {booking.date}</p>

                <form onSubmit={handleSubmit}>
                  <StarInput value={rating} onChange={setRating} />
                  {rating > 0 && (
                    <p className="review-rating-label">
                      {rating === 5 && t('Excelente!', 'Excellent!', 'Utmärkt!')}
                      {rating === 4 && t('Muito bom', 'Very good', 'Mycket bra')}
                      {rating === 3 && t('Bom', 'Good', 'Bra')}
                      {rating === 2 && t('Razoável', 'Fair', 'Okej')}
                      {rating === 1 && t('Fraco', 'Poor', 'Dålig')}
                    </p>
                  )}

                  <textarea
                    className="review-textarea"
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder={t('Escreve um comentário (opcional)…', 'Write a comment (optional)…', 'Skriv en kommentar (valfritt)…')}
                  />

                  <div className="review-form-actions">
                    <button type="button" className="review-btn-cancel" onClick={() => setActiveReview(null)}>
                      <T pt="Cancelar" en="Cancel" sv="Avbryt" />
                    </button>
                    <button type="submit" className="review-btn-submit" disabled={rating === 0}>
                      <Star size={14} /> <T pt="Enviar avaliação" en="Submit review" sv="Skicka omdöme" />
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          );
        })()}

        {/* Success */}
        {submitted && (
          <motion.div className="review-form-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="review-success" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <CheckCircle size={48} />
              <h3><T pt="Obrigado!" en="Thank you!" sv="Tack!" /></h3>
              <p><T pt="A tua avaliação foi enviada." en="Your review has been submitted." sv="Ditt omdöme har skickats." /></p>
            </motion.div>
          </motion.div>
        )}

        {/* Completed reviews */}
        {done.length > 0 && (
          <div className="review-section">
            <h2><T pt="Já avaliados" en="Already reviewed" sv="Redan betygsatt" /></h2>
            <div className="review-cards">
              {done.map(b => (
                <div key={b.id} className="review-card done">
                  <div className="review-card-avatar">{b.initials}</div>
                  <div className="review-card-info">
                    <span className="review-card-pro">{b.pro}</span>
                    <span className="review-card-service"><Wrench size={13} /> {b.service[lang] ?? b.service.en}</span>
                  </div>
                  <div className="review-card-stars">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} size={14} fill={n <= b.rating ? '#f97316' : 'none'} color={n <= b.rating ? '#f97316' : '#cbd5e1'} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
