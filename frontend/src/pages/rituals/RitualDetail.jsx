import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

const RitualDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ritual, setRitual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [isAttending, setIsAttending] = useState(false);

  useEffect(() => {
    const fetchRitual = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/rituals/${id}/`);
        setRitual(response.data);
        
        // Obtener lista de asistencia
        const attendanceResponse = await axios.get(`/api/rituals/${id}/attendance/`);
        setAttendance(attendanceResponse.data);
        
        // Verificar si el usuario actual está en la lista de asistencia
        const currentUser = localStorage.getItem('user_id');
        if (currentUser) {
          const isUserAttending = attendanceResponse.data.some(
            attendee => attendee.member_id.toString() === currentUser
          );
          setIsAttending(isUserAttending);
        }
        
        setError(null);
      } catch (err) {
        setError('Error al cargar los detalles del ritual. Por favor, intente nuevamente.');
        console.error('Error fetching ritual details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRitual();
  }, [id]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/rituals/${id}/`);
      navigate('/rituals');
    } catch (err) {
      setError('Error al eliminar el ritual. Por favor, intente nuevamente.');
      console.error('Error deleting ritual:', err);
      setLoading(false);
    }
  };

  const handleAttendance = async () => {
    try {
      if (isAttending) {
        await axios.delete(`/api/rituals/${id}/attendance/`);
        setIsAttending(false);
      } else {
        await axios.post(`/api/rituals/${id}/attendance/`);
        setIsAttending(true);
      }
      
      // Actualizar lista de asistencia
      const attendanceResponse = await axios.get(`/api/rituals/${id}/attendance/`);
      setAttendance(attendanceResponse.data);
    } catch (err) {
      setError(`Error al ${isAttending ? 'cancelar' : 'confirmar'} asistencia. Por favor, intente nuevamente.`);
      console.error('Error updating attendance:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Loading />;

  if (error) return <Alert type="error" message={error} />;

  if (!ritual) return <Alert type="warning" message="Ritual no encontrado" />;

  const isPastRitual = new Date(ritual.date) < new Date();

  return (
    <div className="p-4">
      <PageHeader 
        title="Detalle de Ritual" 
        backLink="/rituals"
        backLabel="Volver a Rituales"
      />
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold mb-2">{ritual.title}</h1>
          <span className={`inline-block px-3 py-1 text-sm rounded ${
            ritual.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
            ritual.status === 'completed' ? 'bg-green-100 text-green-800' :
            ritual.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {ritual.status === 'scheduled' ? 'Programado' :
             ritual.status === 'completed' ? 'Completado' :
             ritual.status === 'cancelled' ? 'Cancelado' : 'Desconocido'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Fecha y Hora</h3>
            <p className="text-lg font-semibold">{formatDate(ritual.date)}</p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Grado</h3>
            <p className="text-lg font-semibold">{ritual.degree}</p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Ubicación</h3>
            <p className="text-lg font-semibold">{ritual.location}</p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Organizado por</h3>
            <p className="text-lg font-semibold">{ritual.organizer}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Descripción</h3>
          <div className="prose max-w-none">
            {ritual.description}
          </div>
        </div>
        
        {ritual.officers && ritual.officers.length > 0 && (
          <div className="mt-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Oficiales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ritual.officers.map((officer, index) => (
                <div key={index} className="flex items-center">
                  <span className="font-medium mr-2">{officer.role}:</span>
                  <span>{officer.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Asistencia ({attendance.length})</h3>
          {!isPastRitual && (
            <Button
              label={isAttending ? "Cancelar Asistencia" : "Confirmar Asistencia"}
              variant={isAttending ? "secondary" : "primary"}
              onClick={handleAttendance}
              className="mb-4"
            />
          )}
          
          {attendance.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {attendance.map(attendee => (
                <div key={attendee.id} className="bg-gray-50 p-2 rounded">
                  {attendee.member_name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aún no hay confirmaciones de asistencia</p>
          )}
        </div>
        
        {ritual.documents && ritual.documents.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Documentos</h3>
            <ul className="space-y-2">
              {ritual.documents.map((document, index) => (
                <li key={index}>
                  <a 
                    href={document.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <i className="fas fa-file mr-2"></i>
                    {document.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        {!isPastRitual && (
          <div className="flex space-x-2">
            <Button
              label="Editar"
              icon="edit"
              variant="primary"
              as={Link}
              to={`/rituals/edit/${id}`}
            />
            
            {ritual.status !== 'cancelled' && (
              <Button
                label="Cancelar Ritual"
                icon="ban"
                variant="warning"
                as={Link}
                to={`/rituals/cancel/${id}`}
              />
            )}
          </div>
        )}
        
        {!deleteConfirm ? (
          <Button
            label="Eliminar"
            icon="trash"
            variant="danger"
            onClick={() => setDeleteConfirm(true)}
          />
        ) : (
          <div className="flex space-x-2">
            <Button
              label="Cancelar"
              variant="secondary"
              onClick={() => setDeleteConfirm(false)}
            />
            <Button
              label="Confirmar Eliminación"
              variant="danger"
              onClick={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RitualDetail;
