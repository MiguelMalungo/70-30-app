import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import './Toasts.css';

const ICONS = { success: CheckCircle, warning: AlertTriangle, info: Info, error: AlertTriangle };

const Toasts = () => {
  const { toasts, dismissToast } = useNotifications();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = ICONS[t.type] || Info;
          return (
            <motion.div
              key={t.id}
              className={`toast toast-${t.type}`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <Icon size={18} />
              <span>{t.message}</span>
              <button className="toast-dismiss" onClick={() => dismissToast(t.id)}><X size={14} /></button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Toasts;
