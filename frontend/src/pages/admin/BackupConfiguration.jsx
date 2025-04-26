import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const BackupConfiguration = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  
  // Cargar configuración actual
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await adminService.getBackupConfiguration();
        setConfig(response.data);
      } catch (error) {
        console.error('Error al cargar configuración de respaldos:', error);
        showNotification('Error al cargar configuración de respaldos', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, [showNotification]);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await adminService.updateBackupConfiguration(config);
      showNotification('Configuración de respaldos actualizada correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar configuración de respaldos:', error);
      showNotification('Error al actualizar configuración de respaldos', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Configuración de Respaldos</h1>
      </div>
      
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <form onSubmit={handleSubmit}>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Configuración General</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configuración básica de respaldos automáticos.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="is_active"
                        name="is_active"
                        type="checkbox"
                        checked={config?.is_active || false}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="is_active" className="font-medium text-gray-700">
                        Activar respaldos automáticos
                      </label>
                      <p className="text-gray-500">
                        Habilita la creación automática de respaldos según la programación.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                    Frecuencia
                  </label>
                  <select
                    id="frequency"
                    name="frequency"
                    value={config?.frequency || 'weekly'}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>
                
                {config?.frequency === 'weekly' && (
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="weekday" className="block text-sm font-medium text-gray-700">
                      Día de la semana
                    </label>
                    <select
                      id="weekday"
                      name="weekday"
                      value={config?.weekday || 0}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="0">Lunes</option>
                      <option value="1">Martes</option>
                      <option value="2">Miércoles</option>
                      <option value="3">Jueves</option>
                      <option value="4">Viernes</option>
                      <option value="5">Sábado</option>
                      <option value="6">Domingo</option>
                    </select>
                  </div>
                )}
                
                {config?.frequency === 'monthly' && (
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="day_of_month" className="block text-sm font-medium text-gray-700">
                      Día del mes
                    </label>
                    <input
                      type="number"
                      name="day_of_month"
                      id="day_of_month"
                      min="1"
                      max="28"
                      value={config?.day_of_month || 1}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Recomendado: 1-28 para evitar problemas con meses cortos
                    </p>
                  </div>
                )}
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="hour" className="block text-sm font-medium text-gray-700">
                    Hora
                  </label>
                  <input
                    type="number"
                    name="hour"
                    id="hour"
                    min="0"
                    max="23"
                    value={config?.hour || 0}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="minute" className="block text-sm font-medium text-gray-700">
                    Minuto
                  </label>
                  <input
                    type="number"
                    name="minute"
                    id="minute"
                    min="0"
                    max="59"
                    value={config?.minute || 0}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:block" aria-hidden="true">
            <div className="py-5">
              <div className="border-t border-gray-200"></div>
            </div>
          </div>
          
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Retención</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configuración de retención de respaldos.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="keep_daily" className="block text-sm font-medium text-gray-700">
                    Mantener respaldos diarios
                  </label>
                  <input
                    type="number"
                    name="keep_daily"
                    id="keep_daily"
                    min="1"
                    value={config?.keep_daily || 7}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="keep_weekly" className="block text-sm font-medium text-gray-700">
                    Mantener respaldos semanales
                  </label>
                  <input
                    type="number"
                    name="keep_weekly"
                    id="keep_weekly"
                    min="1"
                    value={config?.keep_weekly || 4}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="keep_monthly" className="block text-sm font-medium text-gray-700">
                    Mantener respaldos mensuales
                  </label>
                  <input
                    type="number"
                    name="keep_monthly"
                    id="keep_monthly"
                    min="1"
                    value={config?.keep_monthly || 12}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:block" aria-hidden="true">
            <div className="py-5">
              <div className="border-t border-gray-200"></div>
            </div>
          </div>
          
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Almacenamiento</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configuración de almacenamiento de respaldos.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="backup_path" className="block text-sm font-medium text-gray-700">
                    Ruta de respaldos
                  </label>
                  <input
                    type="text"
                    name="backup_path"
                    id="backup_path"
                    value={config?.backup_path || '/backups'}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-2">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="include_media"
                        name="include_media"
                        type="checkbox"
                        checked={config?.include_media || false}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="include_media" className="font-medium text-gray-700">
                        Incluir archivos multimedia
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-6 sm:col-span-2">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="compress"
                        name="compress"
                        type="checkbox"
                        checked={config?.compress || false}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="compress" className="font-medium text-gray-700">
                        Comprimir respaldo
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-6 sm:col-span-2">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="encrypt"
                        name="encrypt"
                        type="checkbox"
                        checked={config?.encrypt || false}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="encrypt" className="font-medium text-gray-700">
                        Cifrar respaldo
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:block" aria-hidden="true">
            <div className="py-5">
              <div className="border-t border-gray-200"></div>
            </div>
          </div>
          
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Notificaciones</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configuración de notificaciones por correo.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="notify_on_success"
                        name="notify_on_success"
                        type="checkbox"
                        checked={config?.notify_on_success || false}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notify_on_success" className="font-medium text-gray-700">
                        Notificar en éxito
                      </label>
                      <p className="text-gray-500">
                        Enviar notificación cuando un respaldo se complete con éxito.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="notify_on_failure"
                        name="notify_on_failure"
                        type="checkbox"
                        checked={config?.notify_on_failure || false}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notify_on_failure" className="font-medium text-gray-700">
                        Notificar en fallo
                      </label>
                      <p className="text-gray-500">
                        Enviar notificación cuando un respaldo falle.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="notification_email" className="block text-sm font-medium text-gray-700">
                    Correo electrónico para notificaciones
                  </label>
                  <input
                    type="email"
                    name="notification_email"
                    id="notification_email"
                    value={config?.notification_email || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BackupConfiguration;
