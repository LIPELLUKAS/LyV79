import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
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
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchMemberData = async () => {
        try {
          // En una implementación real, estos datos vendrían de la API
          // const response = await axios.get(`/api/members/${id}/`);
          // setFormData(response.data);
          
          // Datos de ejemplo para la estructura del frontend
          setFormData({
            username: 'juan.perez',
            email: 'juan.perez@example.com',
            first_name: 'Juan',
            last_name: 'Pérez',
            symbolic_name: 'Hiram',
            phone_number: '+1234567890',
            address: 'Calle Principal 123, Ciudad',
            degree: 3,
            initiation_date: '2018-05-15',
            passing_date: '2019-06-20',
            raising_date: '2020-07-25',
            is_active_member: true,
            profile: {
              birth_date: '1980-03-10',
              profession: 'Ingeniero',
              civil_id: 'A12345678',
              mother_lodge: 'Luz y Verdad Nº 123',
              masonic_id: 'M-12345',
              emergency_contact_name: 'María Pérez',
              emergency_contact_phone: '+0987654321',
              emergency_contact_relation: 'Esposa'
            }
          });
        } catch (error) {
          console.error('Error al cargar datos del miembro:', error);
          setError('No se pudo cargar la información del miembro.');
        } finally {
          setLoading(false);
        }
      };

      fetchMemberData();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      if (isEditMode) {
        // En una implementación real, esto enviaría los datos a la API
        // await axios.put(`/api/members/${id}/`, formData);
        console.log('Actualizando miembro:', formData);
        setSuccess('Miembro actualizado correctamente.');
      } else {
        // En una implementación real, esto enviaría los datos a la API
        // const response = await axios.post('/api/members/', formData);
        console.log('Creando nuevo miembro:', formData);
        setSuccess('Miembro creado correctamente.');
      }
      
      // Redirigir después de un breve retraso para mostrar el mensaje de éxito
      setTimeout(() => {
        navigate('/members');
      }, 2000);
    } catch (error) {
      console.error('Error al guardar miembro:', error);
      setError('Ocurrió un error al guardar los datos. Por favor, inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Cargando información del miembro...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {isEditMode ? 'Editar Miembro' : 'Nuevo Miembro'}
        </h2>
        <p className="text-gray-600">
          {isEditMode 
            ? 'Actualiza la información del miembro existente.' 
            : 'Completa el formulario para registrar un nuevo miembro.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-card p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información de Cuenta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Usuario *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            {!isEditMode && (
              <div className="md:col-span-2">
                <div className="bg-yellow-50 p-4 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Nota:</span> Al crear un nuevo miembro, se generará una contraseña temporal que será enviada al correo electrónico proporcionado.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información Masónica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="symbolic_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Simbólico *
              </label>
              <input
                id="symbolic_name"
                name="symbolic_name"
                type="text"
                value={formData.symbolic_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">
                Grado *
              </label>
              <select
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required
              >
                <option value={1}>Aprendiz</option>
                <option value={2}>Compañero</option>
                <option value={3}>Maestro</option>
              </select>
            </div>
            
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label htmlFor="passing_date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Elevación
              </label>
              <input
                id="passing_date"
                name="passing_date"
                type="date"
                value={formData.passing_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="is_active_member"
                name="is_active_member"
                type="checkbox"
                checked={formData.is_active_member}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="is_active_member" className="ml-2 block text-sm text-gray-700">
                Miembro Activo
              </label>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Contacto de Emergencia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="profile.emergency_contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                id="profile.emergency_contact_name"
                name="profile.emergency_contact_name"
                type="text"
                value={formData.profile.emergency_contact_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label htmlFor="profile.emergency_contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                id="profile.emergency_contact_phone"
                name="profile.emergency_contact_phone"
                type="text"
                value={formData.profile.emergency_contact_phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/members')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {saving ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;
