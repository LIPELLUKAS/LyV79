import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Criando o contexto de configuração
const ConfigContext = createContext();

// Hook personalizado para usar o contexto
export const useConfig = () => useContext(ConfigContext);

// Provider do contexto
export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar configurações ao iniciar
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Tentar carregar do localStorage primeiro para experiência mais rápida
        const cachedConfig = localStorage.getItem('appConfig');
        if (cachedConfig) {
          setConfig(JSON.parse(cachedConfig));
        }

        // Buscar configurações atualizadas da API
        const response = await axios.get('/api/core/configuration/');
        const configData = response.data;
        
        // Atualizar estado e cache
        setConfig(configData);
        localStorage.setItem('appConfig', JSON.stringify(configData));
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
        setError('Não foi possível carregar as configurações do sistema.');
        
        // Se não tiver cache, usar configurações padrão
        if (!config) {
          const defaultConfig = {
            appName: 'Luz y Verdad 79',
            logo: null,
            primaryColor: '#0ea5e9',
            secondaryColor: '#8b5cf6',
            contactEmail: 'contato@luzyverda79.org',
            contactPhone: '(00) 1234-5678',
            address: 'Endereço da Loja',
            enableRegistration: false,
            enablePasswordReset: true,
            enableTwoFactorAuth: false,
            maintenanceMode: false,
          };
          setConfig(defaultConfig);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Função para atualizar configurações
  const updateConfig = async (newConfig) => {
    try {
      setLoading(true);
      const response = await axios.put('/api/core/configuration/', newConfig);
      const updatedConfig = response.data;
      
      // Atualizar estado e cache
      setConfig(updatedConfig);
      localStorage.setItem('appConfig', JSON.stringify(updatedConfig));
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar configurações:', err);
      setError('Não foi possível atualizar as configurações do sistema.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigContext.Provider 
      value={{ 
        config,
        loading,
        error,
        updateConfig
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContext;
