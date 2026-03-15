import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { T, useLang } from '../../context/LanguageContext';
import { ChevronLeft, ChevronRight, Clock, MapPin, User } from 'lucide-react';
import imgScheduling from '../../assets/images/smart_scheduling.png';
import './Calendar.css';

const WEEKDAYS_PT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const WEEKDAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS_SV = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SV = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];

// Mock bookings for demo
const MOCK_BOOKINGS = [
  { id: 1, day: 15, service: { pt: 'Canalização', en: 'Plumbing', sv: 'VVS' }, client: 'Mariana Silva', time: '10:00', location: 'Lisboa', status: 'confirmed' },
  { id: 2, day: 17, service: { pt: 'Eletricidade', en: 'Electrical', sv: 'El' }, client: 'Carlos Fonseca', time: '14:00', location: 'Porto', status: 'confirmed' },
  { id: 3, day: 17, service: { pt: 'Montagem', en: 'Assembly', sv: 'Montering' }, client: 'Ana Rodrigues', time: '09:00', location: 'Braga', status: 'pending' },
  { id: 4, day: 20, service: { pt: 'Reparação', en: 'Repair', sv: 'Reparation' }, client: 'João Ferreira', time: '11:30', location: 'Sintra', status: 'confirmed' },
  { id: 5, day: 22, service: { pt: 'Pintura', en: 'Painting', sv: 'Målning' }, client: 'Rita Neves', time: '08:00', location: 'Cascais', status: 'pending' },
  { id: 6, day: 28, service: { pt: 'Jardim', en: 'Garden', sv: 'Trädgård' }, client: 'Pedro Matos', time: '15:00', location: 'Lisboa', status: 'confirmed' },
];

const Calendar = () => {
  const { lang } = useLang();
  const t = (pt, en, sv) => ({ pt, en, sv }[lang] ?? en);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const weekdays = lang === 'pt' ? WEEKDAYS_PT : lang === 'sv' ? WEEKDAYS_SV : WEEKDAYS_EN;
  const months = lang === 'pt' ? MONTHS_PT : lang === 'sv' ? MONTHS_SV : MONTHS_EN;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7; // Monday-start

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDay(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDay(null); };

  const bookingsForDay = (day) => MOCK_BOOKINGS.filter(b => b.day === day && month === today.getMonth() && year === today.getFullYear());
  const dayBookings = selectedDay ? bookingsForDay(selectedDay) : [];

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="cal-page">
      <div className="cal-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(25,55,48,0.88) 0%, rgba(13,43,34,0.75) 60%, rgba(25,55,48,0.88) 100%), url(${imgScheduling})`, backgroundSize: 'cover', backgroundPosition: 'top' }}>
        <div className="container">
          <p className="cal-overline"><T pt="Agenda profissional" en="Professional schedule" sv="Professionellt schema" /></p>
          <h1><T pt="Calendário" en="Calendar" sv="Kalender" /></h1>
        </div>
      </div>

      <div className="container cal-body">
        <div className="cal-grid-wrap">
          {/* Calendar */}
          <div className="cal-card">
            <div className="cal-nav">
              <button onClick={prevMonth}><ChevronLeft size={20} /></button>
              <h2>{months[month]} {year}</h2>
              <button onClick={nextMonth}><ChevronRight size={20} /></button>
            </div>

            <div className="cal-weekdays">
              {weekdays.map(w => <div key={w} className="cal-wd">{w}</div>)}
            </div>

            <div className="cal-days">
              {cells.map((day, i) => {
                if (!day) return <div key={`e${i}`} className="cal-day empty" />;
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const hasBookings = bookingsForDay(day).length > 0;
                const isSelected = day === selectedDay;
                return (
                  <button
                    key={day}
                    className={`cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasBookings ? 'has-bookings' : ''}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    {day}
                    {hasBookings && <span className="cal-dot" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Detail */}
          <div className="cal-detail">
            <h3>
              {selectedDay ? `${selectedDay} ${months[month]}` : t('Seleciona um dia', 'Select a day', 'Välj en dag')}
            </h3>
            {dayBookings.length > 0 ? (
              <div className="cal-bookings">
                {dayBookings.map(b => (
                  <motion.div
                    key={b.id}
                    className={`cal-booking-card status-${b.status}`}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="cal-booking-time"><Clock size={14} />{b.time}</div>
                    <div className="cal-booking-service">{b.service[lang] ?? b.service.en}</div>
                    <div className="cal-booking-meta">
                      <span><User size={13} />{b.client}</span>
                      <span><MapPin size={13} />{b.location}</span>
                    </div>
                    <span className={`cal-booking-status ${b.status}`}>
                      {b.status === 'confirmed' ? t('Confirmado', 'Confirmed', 'Bekräftad') : t('Pendente', 'Pending', 'Väntande')}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : selectedDay ? (
              <p className="cal-no-bookings"><T pt="Sem reservas neste dia" en="No bookings this day" sv="Inga bokningar denna dag" /></p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
