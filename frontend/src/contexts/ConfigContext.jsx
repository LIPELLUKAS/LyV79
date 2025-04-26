import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

const ConfigContext = createContext();

export const useConfig = () => {
  return useContext(ConfigContext);
};

export const ConfigProvider = ({ children }) => {
  const { showNotification } = useNotification();
  const [config, setConfig] = useState({
    lodgeName: 'Logia Luz y Verdad',
    lodgeNumber: '79',
    grandLodge: 'Gran Logia de la Jurisdicción',
    language: localStorage.getItem('language') || 'es',
    theme: localStorage.getItem('theme') || 'light',
    dateFormat: localStorage.getItem('dateFormat') || 'DD/MM/YYYY',
    timeFormat: localStorage.getItem('timeFormat') || '24h',
    currency: localStorage.getItem('currency') || 'USD',
    isLoaded: false
  });

  // Cargar configuración desde el backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // En una implementación real, esto cargaría la configuración desde el backend
        // const response = await api.get('/config');
        // setConfig({ ...response.data, isLoaded: true });
        
        // Por ahora, simulamos que la configuración ya está cargada
        setConfig(prevConfig => ({ ...prevConfig, isLoaded: true }));
      } catch (error) {
        console.error('Error al cargar la configuración:', error);
        showNotification('Error al cargar la configuración del sistema', 'error');
      }
    };

    fetchConfig();
  }, [showNotification]);

  // Actualizar configuración
  const updateConfig = async (newConfig) => {
    try {
      // En una implementación real, esto enviaría la configuración al backend
      // await api.put('/config', newConfig);
      
      // Actualizar el estado local
      setConfig({ ...newConfig, isLoaded: true });
      
      // Guardar preferencias en localStorage
      if (newConfig.language) localStorage.setItem('language', newConfig.language);
      if (newConfig.theme) localStorage.setItem('theme', newConfig.theme);
      if (newConfig.dateFormat) localStorage.setItem('dateFormat', newConfig.dateFormat);
      if (newConfig.timeFormat) localStorage.setItem('timeFormat', newConfig.timeFormat);
      if (newConfig.currency) localStorage.setItem('currency', newConfig.currency);
      
      showNotification('Configuración actualizada correctamente', 'success');
      return true;
    } catch (error) {
      console.error('Error al actualizar la configuración:', error);
      showNotification('Error al actualizar la configuración', 'error');
      return false;
    }
  };

  // Cambiar idioma
  const changeLanguage = (language) => {
    updateConfig({ ...config, language });
  };

  // Cambiar tema
  const changeTheme = (theme) => {
    updateConfig({ ...config, theme });
    
    // Aplicar tema al documento
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Aplicar tema inicial
  useEffect(() => {
    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.theme]);

  const value = {
    config,
    updateConfig,
    changeLanguage,
    changeTheme
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContext;
