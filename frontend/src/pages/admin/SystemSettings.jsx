import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const SystemSettings = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [settings, setSettings] = useState({
    site_name: 'Luz y Verdad 79',
    site_description: 'Plataforma de gestión para la Logia Luz y Verdad 79',
    enable_2fa: true,
    session_timeout: 30,
    max_login_attempts: 5,
    password_expiry_days: 90,
    min_password_length: 8,
    require_special_chars: true,
    enable_notifications: true,
    enable_email_notifications: true,
    maintenance_mode: false,
    maintenance_message: 'El sistema está en mantenimiento. Por favor, vuelva más tarde.',
    default_language: 'es',
    timezone: 'America/Santiago',
    enable_public_registration: false,
    default_user_role: 'guest'
  });

  // Verificar permisos - Solo administradores pueden acceder
  useEffect(() => {
    if (currentUser && !currentUser.is_admin) {
      showNotification('No tienes permisos para acceder a esta sección', 'error');
      navigate('/');
    }
  }, [currentUser, navigate, showNotification]);

  // Cargar configuraciones del sistema
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await adminService.getSystemSettings();
        setSettings(response.data);
      } catch (err) {
        console.error('Error al cargar configuraciones:', err);
        setError('Error al cargar las configuraciones del sistema. Por favor, intente nuevamente.');
        showNotification('Error al cargar configuraciones', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [showNotification]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value, 10) : 
              value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    setError(null);
    
    try {
      await adminService.updateSystemSettings(settings);
      showNotification('Configuraciones actualizadas correctamente', 'success');
    } catch (err) {
      console.error('Error al guardar configuraciones:', err);
      setError('Error al guardar las configuraciones. Por favor, intente nuevamente.');
      showNotification('Error al guardar configuraciones', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Configuración del Sistema</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Configuración General */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Configuración General
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Sitio
                </label>
                <input
                  type="text"
                  id="site_name"
                  name="site_name"
                  value={settings.site_name}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="default_language" className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma Predeterminado
                </label>
                <select
                  id="default_language"
                  name="default_language"
                  value={settings.default_language}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                  <option value="pt">Portugués</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="site_description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del Sitio
                </label>
                <textarea
                  id="site_description"
                  name="site_description"
                  value={settings.site_description}
                  onChange={handleChange}
                  rows="2"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                  Zona Horaria
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="America/Santiago">Santiago (GMT-4)</option>
                  <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                  <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                  <option value="America/Bogota">Bogotá (GMT-5)</option>
                  <option value="America/Lima">Lima (GMT-5)</option>
                  <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  id="maintenance_mode"
                  name="maintenance_mode"
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenance_mode" className="ml-2 block text-sm text-gray-700">
                  Modo Mantenimiento
                </label>
              </div>
              
              {settings.maintenance_mode && (
                <div className="md:col-span-2">
                  <label htmlFor="maintenance_message" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje de Mantenimiento
                  </label>
                  <textarea
                    id="maintenance_message"
                    name="maintenance_message"
                    value={settings.maintenance_message}
                    onChange={handleChange}
                    rows="2"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                </div>
              )}
            </div>
          </div>
          
          {/* Configuración de Seguridad */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Configuración de Seguridad
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="enable_2fa"
                  name="enable_2fa"
                  type="checkbox"
                  checked={settings.enable_2fa}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="enable_2fa" className="ml-2 block text-sm text-gray-700">
                  Habilitar Autenticación de Dos Factores
                </label>
              </div>
              
              <div>
                <label htmlFor="session_timeout" className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de Inactividad de Sesión (minutos)
                </label>
                <input
                  type="number"
                  id="session_timeout"
                  name="session_timeout"
                  value={settings.session_timeout}
                  onChange={handleChange}
                  min="5"
                  max="120"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="max_login_attempts" className="block text-sm font-medium text-gray-700 mb-1">
                  Intentos Máximos de Inicio de Sesión
                </label>
                <input
                  type="number"
                  id="max_login_attempts"
                  name="max_login_attempts"
                  value={settings.max_login_attempts}
                  onChange={handleChange}
                  min="3"
                  max="10"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="password_expiry_days" className="block text-sm font-medium text-gray-700 mb-1">
                  Caducidad de Contraseña (días)
                </label>
                <input
                  type="number"
                  id="password_expiry_days"
                  name="password_expiry_days"
                  value={settings.password_expiry_days}
                  onChange={handleChange}
                  min="30"
                  max="365"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="min_password_length" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitud Mínima de Contraseña
                </label>
                <input
                  type="number"
                  id="min_password_length"
                  name="min_password_length"
                  value={settings.min_password_length}
                  onChange={handleChange}
                  min="6"
                  max="16"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="require_special_chars"
                  name="require_special_chars"
                  type="checkbox"
                  checked={settings.require_special_chars}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="require_special_chars" className="ml-2 block text-sm text-gray-700">
                  Requerir Caracteres Especiales en Contraseñas
                </label>
              </div>
            </div>
          </div>
          
          {/* Configuración de Usuarios */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Configuración de Usuarios
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="enable_public_registration"
                  name="enable_public_registration"
                  type="checkbox"
                  checked={settings.enable_public_registration}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="enable_public_registration" className="ml-2 block text-sm text-gray-700">
                  Permitir Registro Público
                </label>
              </div>
              
              <div>
                <label htmlFor="default_user_role" className="block text-sm font-medium text-gray-700 mb-1">
                  Rol Predeterminado para Nuevos Usuarios
                </label>
                <select
                  id="default_user_role"
                  name="default_user_role"
                  value={settings.default_user_role}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="guest">Invitado</option>
                  <option value="member">Miembro</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Configuración de Notificaciones */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Configuración de Notificaciones
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  id="enable_notifications"
                  name="enable_notifications"
                  type="checkbox"
                  checked={settings.enable_notifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="enable_notifications" className="ml-2 block text-sm text-gray-700">
                  Habilitar Notificaciones en el Sistema
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="enable_email_notifications"
                  name="enable_email_notifications"
                  type="checkbox"
                  checked={settings.enable_email_notifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="enable_email_notifications" className="ml-2 block text-sm text-gray-700">
                  Habilitar Notificaciones por Correo Electrónico
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                submitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                'Guardar Configuraciones'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemSettings;
