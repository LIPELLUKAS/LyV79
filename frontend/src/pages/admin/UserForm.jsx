import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([
    { id: 'admin', name: 'Administrador' },
    { id: 'member', name: 'Miembro' },
    { id: 'guest', name: 'Invitado' }
  ]);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'member',
    is_active: true,
    password: '',
    confirm_password: '',
    require_password_change: true
  });

  // Verificar permisos - Solo administradores pueden acceder
  useEffect(() => {
    if (currentUser && !currentUser.is_admin) {
      showNotification('No tienes permisos para acceder a esta sección', 'error');
      navigate('/');
    }
  }, [currentUser, navigate, showNotification]);

  // Cargar datos del usuario si estamos editando
  useEffect(() => {
    if (isEditing) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const response = await adminService.getUser(id);
          const user = response.data;
          
          setFormData({
            username: user.username || '',
            email: user.email || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            role: user.role || 'member',
            is_active: user.is_active !== undefined ? user.is_active : true,
            password: '',
            confirm_password: '',
            require_password_change: false
          });
          
          setError(null);
        } catch (err) {
          console.error('Error al cargar datos del usuario:', err);
          setError('Error al cargar los datos del usuario. Por favor, intente nuevamente.');
          showNotification('Error al cargar datos del usuario', 'error');
        } finally {
          setLoading(false);
        }
      };
      
      fetchUser();
    }
  }, [id, isEditing, showNotification]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    // Validar nombre de usuario
    if (!formData.username.trim()) {
      showNotification('El nombre de usuario es obligatorio', 'error');
      return false;
    }
    
    // Validar email
    if (!formData.email.trim()) {
      showNotification('El correo electrónico es obligatorio', 'error');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('El formato del correo electrónico no es válido', 'error');
      return false;
    }
    
    // Validar contraseña si es un nuevo usuario o si se está cambiando
    if (!isEditing || formData.password) {
      if (!isEditing && !formData.password) {
        showNotification('La contraseña es obligatoria para nuevos usuarios', 'error');
        return false;
      }
      
      if (formData.password && formData.password.length < 8) {
        showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
        return false;
      }
      
      if (formData.password !== formData.confirm_password) {
        showNotification('Las contraseñas no coinciden', 'error');
        return false;
      }
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
      // Crear objeto con datos del formulario
      const userData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        is_active: formData.is_active,
        require_password_change: formData.require_password_change
      };
      
      // Agregar contraseña solo si se proporciona
      if (formData.password) {
        userData.password = formData.password;
      }
      
      let response;
      
      if (isEditing) {
        response = await adminService.updateUser(id, userData);
        showNotification('Usuario actualizado correctamente', 'success');
      } else {
        response = await adminService.createUser(userData);
        showNotification('Usuario creado correctamente', 'success');
      }
      
      // Redirigir a la lista de usuarios
      navigate('/admin/users');
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      
      if (err.response && err.response.data) {
        // Mostrar errores específicos del servidor
        const serverErrors = err.response.data;
        if (serverErrors.username) {
          setError(`Error de nombre de usuario: ${serverErrors.username.join(', ')}`);
        } else if (serverErrors.email) {
          setError(`Error de correo electrónico: ${serverErrors.email.join(', ')}`);
        } else if (serverErrors.password) {
          setError(`Error de contraseña: ${serverErrors.password.join(', ')}`);
        } else if (serverErrors.non_field_errors) {
          setError(serverErrors.non_field_errors.join(', '));
        } else {
          setError('Error al guardar el usuario. Por favor, intente nuevamente.');
        }
      } else {
        setError('Error al guardar el usuario. Por favor, intente nuevamente.');
      }
      
      showNotification('Error al guardar el usuario', 'error');
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
          {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información de Cuenta */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Información de Cuenta</h2>
            </div>
            
            {/* Nombre de Usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Usuario <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="nombre.apellido"
              />
            </div>
            
            {/* Correo Electrónico */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="usuario@ejemplo.com"
              />
            </div>
            
            {/* Nombre */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Nombre"
              />
            </div>
            
            {/* Apellido */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Apellido"
              />
            </div>
            
            {/* Rol */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Estado */}
            <div className="flex items-center h-full">
              <div className="flex items-center">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Usuario Activo
                </label>
              </div>
            </div>
            
            {/* Contraseña */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {isEditing ? 'Cambiar Contraseña (opcional)' : 'Contraseña'}
              </h2>
            </div>
            
            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder={isEditing ? "Dejar en blanco para mantener la actual" : "Mínimo 8 caracteres"}
              />
            </div>
            
            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required={!isEditing}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Confirmar contraseña"
              />
            </div>
            
            {/* Requerir cambio de contraseña */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  id="require_password_change"
                  name="require_password_change"
                  type="checkbox"
                  checked={formData.require_password_change}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="require_password_change" className="ml-2 block text-sm text-gray-700">
                  Requerir cambio de contraseña en el próximo inicio de sesión
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
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
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>{isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
