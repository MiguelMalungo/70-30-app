import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'booking', titlePt: 'Nova reserva', titleEn: 'New booking', titleSv: 'Ny bokning', msgPt: 'Mariana Silva reservou Canalização para quinta.', msgEn: 'Mariana Silva booked Plumbing for Thursday.', msgSv: 'Mariana Silva bokade VVS för torsdag.', time: '10m', read: false },
  { id: 2, type: 'message', titlePt: 'Nova mensagem', titleEn: 'New message', titleSv: 'Nytt meddelande', msgPt: 'Carlos Fonseca: "Pode ser às 14h?"', msgEn: 'Carlos Fonseca: "Is 2pm ok?"', msgSv: 'Carlos Fonseca: "Går kl 14?"', time: '1h', read: false },
  { id: 3, type: 'escrow', titlePt: 'Pagamento recebido', titleEn: 'Payment received', titleSv: 'Betalning mottagen', msgPt: 'Recebeste €59.50 pelo serviço de montagem.', msgEn: 'You received €59.50 for the assembly service.', msgSv: 'Du fick €59.50 för monteringstjänsten.', time: '3h', read: false },
  { id: 4, type: 'review', titlePt: 'Nova avaliação', titleEn: 'New review', titleSv: 'Nytt omdöme', msgPt: 'Pedro Matos deu-te 5 estrelas!', msgEn: 'Pedro Matos gave you 5 stars!', msgSv: 'Pedro Matos gav dig 5 stjärnor!', time: '1d', read: true },
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [toasts, setToasts] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, toasts, addToast, dismissToast }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
