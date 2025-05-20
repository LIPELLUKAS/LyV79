import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/members/members/${id}/`);
        setMember(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching member details:', err);
        setError('No se pudo cargar la información del miembro. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  const handleEdit = () => {
    navigate(`/members/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/members');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-30 border-l-4 border-red-500 dark:border-red-700 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button 
              onClick={handleBack}
              className="mt-2 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-600 dark:hover:text-red-200"
            >
              Volver al directorio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Miembro no encontrado</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No se pudo encontrar el miembro solicitado.
        </p>
        <button 
          onClick={handleBack}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Volver al directorio
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil de Miembro</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-700">
              {member.profile_image ? (
                <img 
                  src={member.profile_image} 
                  alt={member.full_name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900">
                  <span className="text-indigo-800 dark:text-indigo-200 font-bold text-2xl">
                    {member.full_name.split(' ').map(name => name[0]).join('').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleEdit}
              className="bg-white text-indigo-600 hover:text-indigo-800 dark:bg-gray-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium py-2 px-4 rounded-md shadow-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
              Editar
            </button>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{member.full_name}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {member.current_degree === '1' && 'Aprendiz'}
                {member.current_degree === '2' && 'Compañero'}
                {member.current_degree === '3' && 'Maestro'}
                {member.office && ` • ${member.office}`}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
                ${member.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                  member.status === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                {member.status === 'active' && 'Activo'}
                {member.status === 'inactive' && 'Inactivo'}
                {member.status === 'suspended' && 'Suspendido'}
              </span>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  activeTab === 'info'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('info')}
              >
                Información Personal
              </button>
              <button
                className={`${
                  activeTab === 'masonic'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('masonic')}
              >
                Historial Masónico
              </button>
              <button
                className={`${
                  activeTab === 'financial'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('financial')}
              >
                Estado Financiero
              </button>
              <button
                className={`${
                  activeTab === 'documents'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('documents')}
              >
                Documentos
              </button>
            </nav>
          </div>

          <div className="py-6">
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información de Contacto</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{member.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{member.phone || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dirección</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{member.address || 'No especificada'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Personal</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Nacimiento</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {member.birth_date ? new Date(member.birth_date).toLocaleDateString() : 'No especificada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profesión</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{member.profession || 'No especificada'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nacionalidad</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{member.nationality || 'No especificada'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'masonic' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Historial Masónico</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Iniciación</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {member.initiation_date ? new Date(member.initiation_date).toLocaleDateString() : 'No especificada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Progresión de Grados</p>
                    <div className="mt-2">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-between">
                          <div className="flex items-center">
                            <span className={`h-5 w-5 rounded-full ${member.current_degree >= '1' ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'} flex items-center justify-center`}>
                              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Aprendiz</span>
                          </div>
                          <div className="flex items-center">
                            <span className={`h-5 w-5 rounded-full ${member.current_degree >= '2' ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'} flex items-center justify-center`}>
                              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Compañero</span>
                          </div>
                          <div className="flex items-center">
                            <span className={`h-5 w-5 rounded-full ${member.current_degree >= '3' ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'} flex items-center justify-center`}>
                              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Maestro</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cargos Ocupados</p>
                    <div className="mt-2">
                      {member.offices && member.offices.length > 0 ? (
                        <ul className="space-y-2">
                          {member.offices.map((office, index) => (
                            <li key={index} className="text-sm text-gray-900 dark:text-white">
                              {office.title} ({office.start_date} - {office.end_date || 'Presente'})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No hay cargos registrados</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Estado Financiero</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado de Cuotas</p>
                      <p className={`mt-1 text-sm font-semibold ${
                        member.dues_status === 'up_to_date' ? 'text-green-600 dark:text-green-400' : 
                        member.dues_status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : 
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {member.dues_status === 'up_to_date' && 'Al día'}
                        {member.dues_status === 'pending' && 'Pendiente'}
                        {member.dues_status === 'overdue' && 'Atrasado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Último Pago</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {member.last_payment_date ? new Date(member.last_payment_date).toLocaleDateString() : 'No registrado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monto Pendiente</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {member.pending_amount ? `$${member.pending_amount}` : '$0.00'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Historial de Pagos</h4>
                {member.payment_history && member.payment_history.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Concepto
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Monto
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Método
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {member.payment_history.map((payment, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {new Date(payment.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {payment.concept}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              ${payment.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {payment.method}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No hay pagos registrados</p>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Documentos</h3>
                {member.documents && member.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {member.documents.map((doc, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-md flex items-center justify-center">
                          <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Subido el {new Date(doc.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No hay documentos asociados</p>
                )}
                
                <div className="mt-6">
                  <button
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Subir Documento
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
