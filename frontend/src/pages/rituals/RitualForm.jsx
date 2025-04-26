import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

const RitualForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    degree: '',
    location: '',
    description: '',
    officers: [],
    documents: []
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [officerRoles, setOfficerRoles] = useState([]);

  useEffect(() => {
    // Cargar lista de miembros
    const fetchMembers = async () => {
      try {
        const response = await axios.get('/api/members/');
        setMembers(response.data);
      } catch (err) {
        console.error('Error fetching members:', err);
      }
    };

    // Cargar roles de oficiales
    const fetchOfficerRoles = async () => {
      try {
        const response = await axios.get('/api/rituals/officer-roles/');
        setOfficerRoles(response.data);
      } catch (err) {
        console.error('Error fetching officer roles:', err);
        // Fallback roles if API fails
        setOfficerRoles([
          { id: 1, name: 'Venerable Maestro' },
          { id: 2, name: 'Primer Vigilante' },
          { id: 3, name: 'Segundo Vigilante' },
          { id: 4, name: 'Orador' },
          { id: 5, name: 'Secretario' },
          { id: 6, name: 'Tesorero' },
          { id: 7, name: 'Maestro de Ceremonias' }
        ]);
      }
    };

    fetchMembers();
    fetchOfficerRoles();

    if (isEditing) {
      const fetchRitual = async () => {
        try {
          const response = await axios.get(`/api/rituals/${id}/`);
          const { title, date, degree, location, description, officers } = response.data;
          
          // Separar fecha y hora
          const dateObj = new Date(date);
          const formattedDate = dateObj.toISOString().split('T')[0];
          const formattedTime = dateObj.toTimeString().slice(0, 5);
          
          setFormData({
            title,
            date: formattedDate,
            time: formattedTime,
            degree,
            location,
            description,
            officers: officers || [],
            documents: []
          });
          
          setLoading(false);
        } catch (err) {
          setError('Error al cargar los datos del ritual. Por favor, intente nuevamente.');
          console.error('Error fetching ritual:', err);
          setLoading(false);
        }
      };

      fetchRitual();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...files]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleOfficerChange = (index, field, value) => {
    const updatedOfficers = [...formData.officers];
    
    if (!updatedOfficers[index]) {
      updatedOfficers[index] = { role: '', member_id: '' };
    }
    
    updatedOfficers[index][field] = value;
    
    setFormData(prev => ({
      ...prev,
      officers: updatedOfficers
    }));
  };

  const addOfficer = () => {
    setFormData(prev => ({
      ...prev,
      officers: [...prev.officers, { role: '', member_id: '' }]
    }));
  };

  const removeOfficer = (index) => {
    setFormData(prev => ({
      ...prev,
      officers: prev.officers.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.title || !formData.date || !formData.time || !formData.degree || !formData.location) {
      setError('Por favor complete todos los campos requeridos.');
      return;
    }

    // Combinar fecha y hora
    const dateTime = `${formData.date}T${formData.time}:00`;

    const data = new FormData();
    data.append('title', formData.title);
    data.append('date', dateTime);
    data.append('degree', formData.degree);
    data.append('location', formData.location);
    data.append('description', formData.description);
    
    // Añadir oficiales
    if (formData.officers.length > 0) {
      data.append('officers', JSON.stringify(formData.officers.filter(o => o.role && o.member_id)));
    }
    
    // Añadir documentos
    formData.documents.forEach(file => {
      data.append('documents', file);
    });

    try {
      setSubmitting(true);
      
      if (isEditing) {
        await axios.put(`/api/rituals/${id}/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('/api/rituals/', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      navigate('/rituals');
    } catch (err) {
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el ritual. Por favor, intente nuevamente.`);
      console.error('Error submitting form:', err);
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-4">
      <PageHeader 
        title={isEditing ? 'Editar Ritual' : 'Programar Nuevo Ritual'} 
        backLink="/rituals"
        backLabel="Volver a Rituales"
      />
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Título *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Fecha *
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
              Hora *
            </label>
            <input
              id="time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="degree">
              Grado *
            </label>
            <select
              id="degree"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Seleccione un grado</option>
              <option value="Aprendiz">Aprendiz</option>
              <option value="Compañero">Compañero</option>
              <option value="Maestro">Maestro</option>
              <option value="Todos">Todos los grados</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
              Ubicación *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="4"
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Oficiales
            </label>
            
            {formData.officers.map((officer, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <select
                  value={officer.role}
                  onChange={(e) => handleOfficerChange(index, 'role', e.target.value)}
                  className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1"
                >
                  <option value="">Seleccione un rol</option>
                  {officerRoles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={officer.member_id}
                  onChange={(e) => handleOfficerChange(index, 'member_id', e.target.value)}
                  className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1"
                >
                  <option value="">Seleccione un miembro</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.full_name || member.username}
                    </option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={() => removeOfficer(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addOfficer}
              className="text-blue-600 hover:text-blue-800"
            >
              + Añadir Oficial
            </button>
          </div>
          
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="documents">
              Documentos
            </label>
            <input
              id="documents"
              name="documents"
              type="file"
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              multiple
            />
          </div>
          
          {formData.documents.length > 0 && (
            <div className="col-span-2">
              <h3 className="text-sm font-bold mb-2">Documentos seleccionados:</h3>
              <ul className="space-y-1">
                {formData.documents.map((file, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <Button
            type="button"
            label="Cancelar"
            variant="secondary"
            onClick={() => navigate('/rituals')}
          />
          <Button
            type="submit"
            label={isEditing ? 'Actualizar' : 'Programar'}
            variant="primary"
            disabled={submitting}
          />
        </div>
      </form>
    </div>
  );
};

export default RitualForm;
