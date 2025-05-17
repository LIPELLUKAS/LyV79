import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { memberService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [documentLoading, setDocumentLoading] = useState(false);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        setLoading(true);
        const response = await memberService.getMember(id);
        setMember(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar detalles del miembro:', err);
        setError('No se pudo cargar la información del miembro');
        showNotification('Error al cargar información del miembro', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [id, showNotification]);

  const handleDownloadDocument = async (documentId) => {
    try {
      setDocumentLoading(true);
      // Implementar la descarga del documento
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      showNotification('Documento descargado correctamente', 'success');
    } catch (err) {
      console.error('Error al descargar documento:', err);
      showNotification('Error al descargar el documento', 'error');
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleViewDocument = async (documentId) => {
    try {
      setDocumentLoading(true);
      // Implementar la visualización del documento
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      showNotification('Documento cargado correctamente', 'success');
      // Aquí se abriría el documento en una nueva ventana o modal
    } catch (err) {
      console.error('Error al visualizar documento:', err);
      showNotification('Error al visualizar el documento', 'error');
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleRegisterPayment = () => {
    navigate(`/treasury/payments/new?member=${id}`);
  };

  const handleAddDocument = () => {
    navigate(`/members/${id}/documents/new`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
        <p>{error}</p>
        <button 
          onClick={() => navigate('/members')}
          className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Volver al listado de miembros
        </button>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
        <p>No se encontró información para el miembro solicitado.</p>
        <button 
          onClick={() => navigate('/members')}
          className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Volver al listado de miembros
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado con información básica */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {member.symbolic_name}
          </h2>
          <p className="text-gray-600">
            {member.first_name} {member.last_name} · {member.degree === 1 ? 'Aprendiz' : 
                                                     member.degree === 2 ? 'Compañero' : 
                                                     'Maestro Masón'}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          {(currentUser?.degree >= 3 || currentUser?.office === 'Secretario') && (
            <button 
              onClick={() => navigate(`/members/edit/${member.id}`)}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          )}
          <button 
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
            onClick={() => window.print()}
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
        </div>
      </div>

      {/* Estado del miembro */}
      <div className={`mb-6 p-4 rounded-lg ${member.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>
        <div className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${member.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="font-medium">
            {member.status === 'active' ? 'Miembro Activo' : 'Miembro Inactivo'}
          </span>
          {member.office && (
            <span className="ml-4 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
              {member.office}
            </span>
          )}
        </div>
      </div>

      {/* Pestañas de navegación */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Documentos
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'progress'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Progreso
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pagos
          </button>
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Información Personal</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre Completo</p>
                  <p>{member.first_name} {member.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nombre de Usuario</p>
                  <p>{member.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Correo Electrónico</p>
                  <p>{member.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p>{member.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p>{member.address}</p>
                </div>
                {member.profile && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                      <p>{member.profile.birth_date ? new Date(member.profile.birth_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Profesión</p>
                      <p>{member.profile.profession || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Documento de Identidad</p>
                      <p>{member.profile.civil_id || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Información Masónica</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre Simbólico</p>
                  <p>{member.symbolic_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Grado</p>
                  <p>{member.degree === 1 ? 'Aprendiz' : 
                      member.degree === 2 ? 'Compañero' : 
                      'Maestro Masón'}</p>
                </div>
                {member.profile && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Logia Madre</p>
                      <p>{member.profile.mother_lodge || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Número de Registro Masónico</p>
                      <p>{member.profile.masonic_id || 'N/A'}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm text-gray-500">Fecha de Iniciación</p>
                  <p>{member.initiation_date ? new Date(member.initiation_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de Elevación</p>
                  <p>{member.passing_date ? new Date(member.passing_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de Exaltación</p>
                  <p>{member.raising_date ? new Date(member.raising_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                {member.profile && (
                  <div>
                    <p className="text-sm text-gray-500">Última Asistencia</p>
                    <p>{member.profile.last_attendance_date ? new Date(member.profile.last_attendance_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                )}
              </div>
              
              {member.profile && member.profile.emergency_contact_name && (
                <>
                  <h3 className="text-lg font-medium text-gray-800 mt-6 mb-4">Contacto de Emergencia</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p>{member.profile.emergency_contact_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p>{member.profile.emergency_contact_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Relación</p>
                      <p>{member.profile.emergency_contact_relation}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Documentos</h3>
              {(currentUser?.degree >= 3 || currentUser?.office === 'Secretario') && (
                <button 
                  onClick={handleAddDocument}
                  className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Añadir Documento
                </button>
              )}
            </div>
            
            {documentLoading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}
            
            {member.documents && member.documents.length > 0 ? (
              <div className="space-y-4">
                {member.documents.map(doc => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-gray-600">{doc.document_type} · {new Date(doc.issue_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewDocument(doc.id)}
                        className="text-indigo-600 hover:text-indigo-800 p-1"
                        disabled={documentLoading}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDownloadDocument(doc.id)}
                        className="text-gray-600 hover:text-gray-800 p-1"
                        disabled={documentLoading}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay documentos registrados para este miembro.</p>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Progreso Masónico</h3>
            
            {member.progress && member.progress.length > 0 ? (
              <div className="relative">
                {/* Línea de tiempo vertical */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6 pl-12">
                  {member.progress.map(item => (
                    <div key={item.id} className="relative">
                      {/* Círculo en la línea de tiempo */}
                      <div className="absolute -left-8 mt-1.5 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white"></div>
                      
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                        <p className="mt-1 text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay registros de progreso para este miembro.</p>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Historial de Pagos</h3>
              {(currentUser?.office === 'Tesorero' || currentUser?.office === 'Venerable Maestro') && (
                <button 
                  onClick={handleRegisterPayment}
                  className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Registrar Pago
                </button>
              )}
            </div>
            
            {member.payments && member.payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Vencimiento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Pago</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {member.payments.map(payment => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{payment.fee_name || payment.concept}</div>
                          {payment.reference && <div className="text-sm text-gray-500">{payment.reference}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${payment.amount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(payment.due_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === 'completed' || payment.status === 'Completado' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' || payment.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status === 'completed' || payment.status === 'Completado' ? 'Completado' :
                             payment.status === 'pending' || payment.status === 'Pendiente' ? 'Pendiente' :
                             payment.status === 'overdue' ? 'Vencido' :
                             'Cancelado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay registros de pagos para este miembro.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetail;
