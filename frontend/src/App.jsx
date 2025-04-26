import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// Contextos
import { AuthProvider } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Rutas
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ConfigProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </ConfigProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
