import React, { createContext, useContext, useState, useEffect } from 'react';
import { publicApi, configService } from '../services/api';

const ConfigContext = createContext();

export const useConfig = () => {
  return useContext(ConfigContext);
};

export const ConfigProvider = ({ children }) => {
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

  // Cargar configuração desde o backend usando o serviço público
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Usamos o serviço de configuração público que não requer autenticação
        const response = await configService.getConfig();
        setConfig(prevConfig => ({
          ...prevConfig,
          isLoaded: true,
          ...response.data
        }));
      } catch (error) {
        console.error('Erro ao carregar a configuração:', error);
        console.error('Erro ao carregar a configuração do sistema');
      }
    };
    fetchConfig();
  }, []);

  // Atualizar configuração no backend
  const updateConfig = async (newConfig) => {
    try {
      // Usamos o serviço de configuração que requer autenticação para atualizações
      const response = await configService.updateConfig(newConfig);
      setConfig({ ...newConfig, isLoaded: true });
      
      // Guardar preferências no localStorage
      if (newConfig.language) localStorage.setItem('language', newConfig.language);
      if (newConfig.theme) localStorage.setItem('theme', newConfig.theme);
      if (newConfig.dateFormat) localStorage.setItem('dateFormat', newConfig.dateFormat);
      if (newConfig.timeFormat) localStorage.setItem('timeFormat', newConfig.timeFormat);
      if (newConfig.currency) localStorage.setItem('currency', newConfig.currency);
      
      console.log('Configuração atualizada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar a configuração:', error);
      console.error('Erro ao atualizar a configuração');
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
