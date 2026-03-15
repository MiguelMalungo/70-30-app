import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';
import Toasts from './components/ui/Toasts';
import './index.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <AppRoutes />
            <Toasts />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
