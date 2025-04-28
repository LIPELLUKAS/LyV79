import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import axios from 'axios'; // Certifique-se de ter o axios instalado ou utilize fetch se preferir

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
    currency: localStorage.getItem('currency') || 'ARS',
    isLoaded: false
  });

  // Cargar configuração desde o backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Aqui vamos buscar a configuração real da API usando a URL configurada no backend
        const response = await axios.get('http://localhost:8000/config'); // Ajuste a URL conforme necessário
        setConfig(prevConfig => ({
          ...prevConfig,
          isLoaded: true,
          ...response.data // Assume que a resposta da API contém os dados necessários
        }));
      } catch (error) {
        console.error('Erro ao carregar a configuração:', error);
        showNotification('Erro ao carregar a configuração do sistema', 'error');
      }
    };

    fetchConfig();
  }, [showNotification]);

  // Atualizar configuração no backend
  const updateConfig = async (newConfig) => {
    try {
      // Aqui vamos enviar a nova configuração para a API
      const response = await axios.put('http://localhost:8000/config', newConfig); // Ajuste a URL conforme necessário
      setConfig({ ...newConfig, isLoaded: true });

      // Guardar preferências no localStorage
      if (newConfig.language) localStorage.setItem('language', newConfig.language);
      if (newConfig.theme) localStorage.setItem('theme', newConfig.theme);
      if (newConfig.dateFormat) localStorage.setItem('dateFormat', newConfig.dateFormat);
      if (newConfig.timeFormat) localStorage.setItem('timeFormat', newConfig.timeFormat);
      if (newConfig.currency) localStorage.setItem('currency', newConfig.currency);

      showNotification('Configuração atualizada com sucesso', 'success');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar a configuração:', error);
      showNotification('Erro ao atualizar a configuração', 'error');
      return false;
    }
  };

  // Alterar idioma
  const changeLanguage = (language) => {
    updateConfig({ ...config, language });
  };

  // Alterar tema
  const changeTheme = (theme) => {
    updateConfig({ ...config, theme });
    
    // Aplicar tema ao documento
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
