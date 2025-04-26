import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const LodgeConfiguration = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Cargar configuración actual
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await adminService.getLodgeConfiguration();
        setConfig(response.data);
        
        // Si hay un logo, establecer la vista previa
        if (response.data.logo) {
          setLogoPreview(response.data.logo);
        }
      } catch (error) {
        console.error('Error al cargar configuración de la Logia:', error);
        showNotification('Error al cargar configuración de la Logia', 'error');
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
  
  // Manejar cambio de logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Actualizar el objeto de configuración con el nuevo archivo
      setConfig(prev => ({
        ...prev,
        logo: file
      }));
      
      // Crear una URL para la vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Crear un FormData para enviar el archivo
      const formData = new FormData();
      for (const key in config) {
        if (key === 'logo' && typeof config[key] === 'object') {
          // Si es un archivo nuevo, agregarlo al FormData
          formData.append('logo', config[key]);
        } else if (config[key] !== null && config[key] !== undefined) {
          formData.append(key, config[key]);
        }
      }
      
      await adminService.updateLodgeConfiguration(formData);
      showNotification('Configuración actualizada correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      showNotification('Error al actualizar configuración', 'error');
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
        <h1 className="text-2xl font-bold text-gray-900">Configuración de la Logia</h1>
      </div>
      
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <form onSubmit={handleSubmit}>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Información General</h3>
              <p className="mt-1 text-sm text-gray-500">
                Información básica de la Logia.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="lodge_name" className="block text-sm font-medium text-gray-700">
                    Nombre de la Logia
                  </label>
                  <input
                    type="text"
                    name="lodge_name"
                    id="lodge_name"
                    value={config?.lodge_name || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="lodge_number" className="block text-sm font-medium text-gray-700">
                    Número de la Logia
                  </label>
                  <input
                    type="text"
                    name="lodge_number"
                    id="lodge_number"
                    value={config?.lodge_number || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="foundation_date" className="block text-sm font-medium text-gray-700">
                    Fecha de fundación
                  </label>
                  <input
                    type="date"
                    name="foundation_date"
                    id="foundation_date"
                    value={config?.foundation_date || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="grand_lodge_name" className="block text-sm font-medium text-gray-700">
                    Nombre de la Gran Logia
                  </label>
                  <input
                    type="text"
                    name="grand_lodge_name"
                    id="grand_lodge_name"
                    value={config?.grand_lodge_name || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700">
                    Jurisdicción
                  </label>
                  <input
                    type="text"
                    name="jurisdiction"
                    id="jurisdiction"
                    value={config?.jurisdiction || ''}
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
              <h3 className="text-lg font-medium leading-6 text-gray-900">Apariencia</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configuración visual de la plataforma.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                    Logo
                  </label>
                  <div className="mt-2 flex items-center">
                    {logoPreview && (
                      <div className="mr-4">
                        <img
                          src={logoPreview}
                          alt="Logo de la Logia"
                          className="h-16 w-16 object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        name="logo"
                        id="logo"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Recomendado: PNG o JPG, máximo 2MB
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700">
                    Color primario
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="color"
                      name="primary_color"
                      id="primary_color"
                      value={config?.primary_color || '#1a237e'}
                      onChange={handleChange}
                      className="h-8 w-8 mr-2 border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="primary_color"
                      value={config?.primary_color || '#1a237e'}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-700">
                    Color secundario
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="color"
                      name="secondary_color"
                      id="secondary_color"
                      value={config?.secondary_color || '#ffc107'}
                      onChange={handleChange}
                      className="h-8 w-8 mr-2 border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      name="secondary_color"
                      value={config?.secondary_color || '#ffc107'}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
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
              <h3 className="text-lg font-medium leading-6 text-gray-900">Correo electrónico</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configuración para comunicaciones por correo.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="email_from" className="block text-sm font-medium text-gray-700">
                    Correo electrónico remitente
                  </label>
                  <input
                    type="email"
                    name="email_from"
                    id="email_from"
                    value={config?.email_from || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="email_signature" className="block text-sm font-medium text-gray-700">
                    Firma de correo electrónico
                  </label>
                  <textarea
                    name="email_signature"
                    id="email_signature"
                    rows="4"
                    value={config?.email_signature || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
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
              <h3 className="text-lg font-medium leading-6 text-gray-900">Configuración del sistema</h3>
              <p className="mt-1 text-sm text-gray-500">
                Opciones avanzadas del sistema.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="calendar_start_month" className="block text-sm font-medium text-gray-700">
                    Mes de inicio del calendario
                  </label>
                  <select
                    id="calendar_start_month"
                    name="calendar_start_month"
                    value={config?.calendar_start_month || 1}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="1">Enero</option>
                    <option value="2">Febrero</option>
                    <option value="3">Marzo</option>
                    <option value="4">Abril</option>
                    <option value="5">Mayo</option>
                    <option value="6">Junio</option>
                    <option value="7">Julio</option>
                    <option value="8">Agosto</option>
                    <option value="9">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                  </select>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <div className="flex items-start mt-6">
                    <div className="flex items-center h-5">
                      <input
                        id="maintenance_mode"
                        name="maintenance_mode"
                        type="checkbox"
                        checked={config?.maintenance_mode || false}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="maintenance_mode" className="font-medium text-gray-700">
                        Modo mantenimiento
                      </label>
                      <p className="text-gray-500">
                        Activa el modo mantenimiento para realizar actualizaciones.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="debug_mode"
                        name="debug_mode"
                        type="checkbox"
                        checked={config?.debug_mode || false}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="debug_mode" className="font-medium text-gray-700">
                        Modo depuración
                      </label>
                      <p className="text-gray-500">
                        Activa el modo depuración para obtener información detallada.
                      </p>
                    </div>
                  </div>
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

export default LodgeConfiguration;
