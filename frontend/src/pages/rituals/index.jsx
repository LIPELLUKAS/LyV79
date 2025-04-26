import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';
import Tabs from '../../components/Tabs';

const RitualsList = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRituals = async () => {
      try {
        setLoading(true);
        const endpoint = `/api/rituals/?status=${activeTab}`;
        const response = await axios.get(endpoint);
        setRituals(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los rituales. Por favor, intente nuevamente.');
        console.error('Error fetching rituals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRituals();
  }, [activeTab]);

  const tabs = [
    { id: 'upcoming', label: 'Próximos' },
    { id: 'past', label: 'Pasados' },
    { id: 'all', label: 'Todos' }
  ];

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

  const renderRitualsList = () => {
    if (rituals.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay rituales {activeTab === 'upcoming' ? 'próximos' : activeTab === 'past' ? 'pasados' : ''} disponibles</p>
          <Button
            label="Programar Ritual"
            variant="primary"
            className="mt-4"
            as={Link}
            to="/rituals/new"
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {rituals.map(ritual => (
          <div key={ritual.id} className="bg-white shadow-md rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{ritual.title}</h3>
                <p className="text-sm text-gray-500">
                  {formatDate(ritual.date)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Grado:</span> {ritual.degree}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Ubicación:</span> {ritual.location}
                </p>
              </div>
              <div className="flex space-x-2">
                <Link 
                  to={`/rituals/${ritual.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Ver
                </Link>
                {new Date(ritual.date) > new Date() && (
                  <Link 
                    to={`/rituals/edit/${ritual.id}`}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    Editar
                  </Link>
                )}
              </div>
            </div>
            <p className="mt-2 text-gray-700 line-clamp-2">{ritual.description}</p>
            <div className="mt-2">
              <span className={`inline-block px-2 py-1 text-xs rounded ${
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
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      <PageHeader title="Rituales" />
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      <div className="mt-4 flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Rituales {activeTab === 'upcoming' ? 'Próximos' : activeTab === 'past' ? 'Pasados' : 'Todos'}
        </h2>
        <Button
          label="Programar Ritual"
          icon="plus"
          variant="primary"
          as={Link}
          to="/rituals/new"
        />
      </div>
      
      {loading ? (
        <Loading />
      ) : (
        renderRitualsList()
      )}
    </div>
  );
};

export default RitualsList;
