import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminService } from '../services/api';

// Crear el contexto de configuración
const ConfigContext = createContext();

// Hook personalizado para usar el contexto de configuración
export const useConfig = () => {
  return useContext(ConfigContext);
};

// Proveedor del contexto de configuración
export const ConfigProvider = ({ children }) => {
  const [lodgeConfig, setLodgeConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar la configuración de la logia al iniciar
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await adminService.getLodgeConfiguration();
        setLodgeConfig(response.data);
      } catch (e) {
        setError(e.message);
        console.error('Error al cargar la configuración:', e);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Función para actualizar la configuración
  const updateConfig = async (configData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminService.updateLodgeConfiguration(configData);
      setLodgeConfig(response.data);
      
      return { success: true };
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al actualizar la configuración');
      return { success: false, error: e.response?.data?.detail || 'Error al actualizar la configuración' };
    } finally {
      setLoading(false);
    }
  };

  // Valor del contexto
  const value = {
    lodgeConfig,
    loading,
    error,
    updateConfig
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContext;
