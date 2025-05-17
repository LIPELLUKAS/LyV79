import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { memberService } from '../../services/api';

const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const isEditMode = !!id;
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    symbolic_name: '',
    phone_number: '',
    address: '',
    degree: 1,
    initiation_date: '',
    passing_date: '',
    raising_date: '',
    is_active_member: true,
    photo: null,
    profile: {
      birth_date: '',
      profession: '',
      civil_id: '',
      mother_lodge: '',
      masonic_id: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relation: ''
    }
  });

  useEffect(() => {
    if (isEditMode) {
      fetchMemberData();
    }
  }, [id, isEditMode]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const response = await memberService.getMember(id);
      
      // Formatear fechas para el formato date
      const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
      };
      
      setFormData({
        ...response.data,
        initiation_date: formatDate(response.data.initiation_date),
        passing_date: formatDate(response.data.passing_date),
        raising_date: formatDate(response.data.raising_date),
        profile: {
          ...response.data.profile,
          birth_date: formatDate(response.data.profile?.birth_date)
        }
      });
      
      if (response.data.photo) {
        setPhotoPreview(response.data.photo);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos del miembro:', err);
      setError('No se pudo cargar la información del miembro. Por favor, intente nuevamente.');
      showNotification('Error al cargar datos del miembro', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      // Manejar carga de foto
      if (files && files[0]) {
        const file = files[0];
        setFormData(prev => ({
          ...prev,
          photo: file
        }));
        
        // Crear URL para previsualización
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (name.includes('.')) {
      // Campo anidado (para el perfil)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      // Campo directo
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validateForm = () => {
    // Validar campos obligatorios
    if (!formData.first_name.trim()) {
      showNotification('El nombre es obligatorio', 'error');
      return false;
    }
    
    if (!formData.last_name.trim()) {
      showNotification('El apellido es obligatorio', 'error');
      return false;
    }
    
    if (!formData.email.trim()) {
      showNotification('El correo electrónico es obligatorio', 'error');
      return false;
    }
    
    if (!formData.username.trim()) {
      showNotification('El nombre de usuario es obligatorio', 'error');
      return false;
    }
    
    if (!formData.symbolic_name.trim()) {
      showNotification('El nombre simbólico es obligatorio', 'error');
      return false;
    }
    
    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('El formato del correo electrónico no es válido', 'error');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Crear FormData para enviar archivos
      const formDataObj = new FormData();
      
      // Agregar campos principales
      Object.keys(formData).forEach(key => {
        if (key !== 'profile' && key !== 'photo') {
          formDataObj.append(key, formData[key]);
        }
      });
      
      // Agregar campos del perfil
      Object.keys(formData.profile).forEach(key => {
        formDataObj.append(`profile.${key}`, formData.profile[key]);
      });
      
      // Agregar foto si existe
      if (formData.photo instanceof File) {
        formDataObj.append('photo', formData.photo);
      }
      
      let response;
      
      if (isEditMode) {
        response = await memberService.updateMember(id, formDataObj);
        showNotification('Miembro actualizado correctamente', 'success');
      } else {
        response = await memberService.createMember(formDataObj);
        showNotification('Miembro creado correctamente', 'success');
      }
      
      // Redirigir a la página de detalles del miembro
      navigate(`/members/detail/${response.data.id}`);
    } catch (err) {
      console.error('Error al guardar miembro:', err);
      setError('Ocurrió un error al guardar los datos. Por favor, inténtelo de nuevo.');
      showNotification('Error al guardar miembro', 'error');
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
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditMode ? 'Editar Miembro' : 'Nuevo Miembro'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/members')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Volver
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda - Foto y datos básicos */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto de Perfil
                </label>
                <div className="flex flex-col items-center">
                  <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 mb-4">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Vista previa" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <label htmlFor="photo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Cambiar foto
                    <input
                      id="photo-upload"
                      name="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Estado</h3>
                <div className="flex items-center">
                  <input
                    id="is_active_member"
                    name="is_active_member"
                    type="checkbox"
                    checked={formData.is_active_member}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active_member" className="ml-2 block text-sm text-gray-700">
                    Miembro Activo
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Los miembros inactivos no pueden acceder al sistema ni participar en actividades.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Grado Masónico</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="degree-1"
                      name="degree"
                      type="radio"
                      value={1}
                      checked={formData.degree === 1 || formData.degree === '1'}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="degree-1" className="ml-2 block text-sm text-gray-700">
                      Aprendiz
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="degree-2"
                      name="degree"
                      type="radio"
                      value={2}
                      checked={formData.degree === 2 || formData.degree === '2'}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="degree-2" className="ml-2 block text-sm text-gray-700">
                      Compañero
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="degree-3"
                      name="degree"
                      type="radio"
                      value={3}
                      checked={formData.degree === 3 || formData.degree === '3'}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="degree-3" className="ml-2 block text-sm text-gray-700">
                      Maestro
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Columnas centrales y derecha - Formulario principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Información de Cuenta */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Información de Cuenta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de Usuario <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                
                {!isEditMode && (
                  <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">Nota:</span> Al crear un nuevo miembro, se generará una contraseña temporal que será enviada al correo electrónico proporcionado.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Información Personal */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="symbolic_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Simbólico <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="symbolic_name"
                      name="symbolic_name"
                      type="text"
                      value={formData.symbolic_name}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="profile.birth_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Nacimiento
                    </label>
                    <input
                      id="profile.birth_date"
                      name="profile.birth_date"
                      type="date"
                      value={formData.profile.birth_date}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      id="phone_number"
                      name="phone_number"
                      type="text"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="profile.civil_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Documento de Identidad
                    </label>
                    <input
                      id="profile.civil_id"
                      name="profile.civil_id"
                      type="text"
                      value={formData.profile.civil_id}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="profile.profession" className="block text-sm font-medium text-gray-700 mb-1">
                      Profesión
                    </label>
                    <input
                      id="profile.profession"
                      name="profile.profession"
                      type="text"
                      value={formData.profile.profession}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Información Masónica */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Información Masónica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="profile.mother_lodge" className="block text-sm font-medium text-gray-700 mb-1">
                      Logia Madre
                    </label>
                    <input
                      id="profile.mother_lodge"
                      name="profile.mother_lodge"
                      type="text"
                      value={formData.profile.mother_lodge}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="profile.masonic_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Registro Masónico
                    </label>
                    <input
                      id="profile.masonic_id"
                      name="profile.masonic_id"
                      type="text"
                      value={formData.profile.masonic_id}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="initiation_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Iniciación
                    </label>
                    <input
                      id="initiation_date"
                      name="initiation_date"
                      type="date"
                      value={formData.initiation_date}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="passing_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Pase
                    </label>
                    <input
                      id="passing_date"
                      name="passing_date"
                      type="date"
                      value={formData.passing_date}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="raising_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Exaltación
                    </label>
                    <input
                      id="raising_date"
                      name="raising_date"
                      type="date"
                      value={formData.raising_date}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Contacto de Emergencia */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Contacto de Emergencia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="profile.emergency_contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Contacto
                    </label>
                    <input
                      id="profile.emergency_contact_name"
                      name="profile.emergency_contact_name"
                      type="text"
                      value={formData.profile.emergency_contact_name}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="profile.emergency_contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono del Contacto
                    </label>
                    <input
                      id="profile.emergency_contact_phone"
                      name="profile.emergency_contact_phone"
                      type="text"
                      value={formData.profile.emergency_contact_phone}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="profile.emergency_contact_relation" className="block text-sm font-medium text-gray-700 mb-1">
                      Relación
                    </label>
                    <input
                      id="profile.emergency_contact_relation"
                      name="profile.emergency_contact_relation"
                      type="text"
                      value={formData.profile.emergency_contact_relation}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/members')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
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
                  {isEditMode ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>{isEditMode ? 'Actualizar Miembro' : 'Crear Miembro'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
