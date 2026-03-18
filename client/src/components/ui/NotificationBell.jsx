import React, { useState, useRef, useEffect } from 'react';
import { Bell, CalendarCheck, MessageSquare, CreditCard, Star, Check } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useLang, T } from '../../context/LanguageContext';
import './NotificationBell.css';

const TYPE_ICONS = { booking: CalendarCheck, message: MessageSquare, escrow: CreditCard, review: Star };

const NotificationBell = ({ scrolled = false }) => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);
  const [dropStyle, setDropStyle] = useState({});

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropStyle({ top: rect.bottom + 8 });
    }
  }, [open]);

  return (
    <div className="notif-bell-wrap" ref={ref}>
      <button className={`notif-bell-btn ${scrolled ? 'notif-bell-dark' : 'notif-bell-light'}`} ref={btnRef} onClick={() => setOpen(!open)}>
        <Bell size={18} />
        {unreadCount > 0 && <span className="notif-bell-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown" style={dropStyle}>
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-title">
              <Bell size={15} /> <T pt="Notificações" en="Notifications" sv="Notifikationer" />
            </span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>
                <Check size={12} /> <T pt="Marcar todas" en="Mark all read" sv="Markera alla" />
              </button>
            )}
          </div>
          <div className="notif-dropdown-list">
            {notifications.map(n => {
              const Icon = TYPE_ICONS[n.type] || Bell;
              const title = lang === 'pt' ? n.titlePt : lang === 'sv' ? n.titleSv : n.titleEn;
              const msg = lang === 'pt' ? n.msgPt : lang === 'sv' ? n.msgSv : n.msgEn;
              return (
                <button
                  key={n.id}
                  className={`notif-item ${n.read ? '' : 'unread'}`}
                  onClick={() => { markRead(n.id); }}
                >
                  <div className={`notif-item-icon notif-type-${n.type}`}><Icon size={16} /></div>
                  <div className="notif-item-body">
                    <span className="notif-item-title">{title}</span>
                    <span className="notif-item-msg">{msg}</span>
                  </div>
                  <span className="notif-item-time">{n.time}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
