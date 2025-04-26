import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        // En una implementación real, estos datos vendrían de la API
        // const response = await axios.get(`/api/members/${id}/`);
        // setMember(response.data);
        
        // Datos de ejemplo para la estructura del frontend
        setMember({
          id: parseInt(id),
          symbolic_name: 'Hiram',
          username: 'juan.perez',
          first_name: 'Juan',
          last_name: 'Pérez',
          email: 'juan.perez@example.com',
          phone_number: '+1234567890',
          address: 'Calle Principal 123, Ciudad',
          degree: 3,
          degree_name: 'Maestro',
          initiation_date: '2018-05-15',
          passing_date: '2019-06-20',
          raising_date: '2020-07-25',
          is_active_member: true,
          officer_role: 'Venerable Maestro',
          profile: {
            birth_date: '1980-03-10',
            profession: 'Ingeniero',
            civil_id: 'A12345678',
            mother_lodge: 'Luz y Verdad Nº 123',
            masonic_id: 'M-12345',
            emergency_contact_name: 'María Pérez',
            emergency_contact_phone: '+0987654321',
            emergency_contact_relation: 'Esposa',
            last_attendance_date: '2025-04-15'
          },
          documents: [
            {
              id: 1,
              title: 'Diploma de Maestro',
              document_type: 'Diploma',
              issue_date: '2020-07-25',
              file: 'diploma_maestro.pdf'
            },
            {
              id: 2,
              title: 'Certificado de Méritos',
              document_type: 'Certificado',
              issue_date: '2023-11-10',
              file: 'certificado_meritos.pdf'
            }
          ],
          progress: [
            {
              id: 1,
              title: 'Iniciación',
              description: 'Iniciado en el Primer Grado',
              date: '2018-05-15'
            },
            {
              id: 2,
              title: 'Elevación',
              description: 'Elevado al Segundo Grado',
              date: '2019-06-20'
            },
            {
              id: 3,
              title: 'Exaltación',
              description: 'Exaltado al Tercer Grado',
              date: '2020-07-25'
            },
            {
              id: 4,
              title: 'Nombramiento como Venerable Maestro',
              description: 'Elegido y nombrado Venerable Maestro de la Logia',
              date: '2024-12-27'
            }
          ],
          payments: [
            {
              id: 1,
              fee_name: 'Cuota Mensual',
              amount: 50.00,
              status: 'Completado',
              payment_date: '2025-04-05',
              due_date: '2025-04-10'
            },
            {
              id: 2,
              fee_name: 'Cuota Mensual',
              amount: 50.00,
              status: 'Pendiente',
              payment_date: null,
              due_date: '2025-05-10'
            }
          ]
        });
      } catch (error) {
        console.error('Error al cargar detalles del miembro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Cargando información del miembro...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
        <p>No se pudo encontrar la información del miembro solicitado.</p>
        <button 
          onClick={() => navigate('/members')}
          className="mt-2 text-primary hover:text-primary-dark"
        >
          Volver al listado de miembros
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Encabezado con información básica */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {member.symbolic_name}
          </h2>
          <p className="text-gray-600">
            {member.first_name} {member.last_name} · {member.degree_name}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <a 
            href={`/members/edit/${member.id}`}
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            <span className="material-icons mr-2">edit</span>
            Editar
          </a>
          <button 
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            onClick={() => window.print()}
          >
            <span className="material-icons mr-2">print</span>
            Imprimir
          </button>
        </div>
      </div>

      {/* Estado del miembro */}
      <div className={`mb-6 p-4 rounded-lg ${member.is_active_member ? 'bg-green-100' : 'bg-red-100'}`}>
        <div className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${member.is_active_member ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="font-medium">
            {member.is_active_member ? 'Miembro Activo' : 'Miembro Inactivo'}
          </span>
          {member.officer_role && (
            <span className="ml-4 px-3 py-1 bg-secondary text-white text-sm rounded-full">
              {member.officer_role}
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
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Documentos
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'progress'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Progreso
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pagos
          </button>
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="bg-white rounded-lg shadow-card p-6">
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
                <div>
                  <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                  <p>{new Date(member.profile.birth_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Profesión</p>
                  <p>{member.profile.profession}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Documento de Identidad</p>
                  <p>{member.profile.civil_id}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Información Masónica</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre Simbólico</p>
                  <p>{member.symbolic_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Grado</p>
                  <p>{member.degree_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Logia Madre</p>
                  <p>{member.profile.mother_lodge}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Número de Registro Masónico</p>
                  <p>{member.profile.masonic_id}</p>
                </div>
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
                <div>
                  <p className="text-sm text-gray-500">Última Asistencia</p>
                  <p>{member.profile.last_attendance_date ? new Date(member.profile.last_attendance_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              
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
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Documentos</h3>
              <button className="inline-flex items-center px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary-dark">
                <span className="material-icons mr-1 text-sm">add</span>
                Añadir Documento
              </button>
            </div>
            
            {member.documents.length > 0 ? (
              <div className="space-y-4">
                {member.documents.map(doc => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-gray-600">{doc.document_type} · {new Date(doc.issue_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-primary hover:text-primary-dark">
                        <span className="material-icons">visibility</span>
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        <span className="material-icons">download</span>
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
            
            {member.progress.length > 0 ? (
              <div className="relative">
                {/* Línea de tiempo vertical */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6 pl-12">
                  {member.progress.map(item => (
                    <div key={item.id} className="relative">
                      {/* Círculo en la línea de tiempo */}
                      <div className="absolute -left-8 mt-1.5 w-4 h-4 rounded-full bg-primary border-2 border-white"></div>
                      
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
              <button className="inline-flex items-center px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary-dark">
                <span className="material-icons mr-1 text-sm">add</span>
                Registrar Pago
              </button>
            </div>
            
            {member.payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table">
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th>Monto</th>
                      <th>Fecha de Vencimiento</th>
                      <th>Fecha de Pago</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {member.payments.map(payment => (
                      <tr key={payment.id}>
                        <td>{payment.fee_name}</td>
                        <td>${payment.amount.toFixed(2)}</td>
                        <td>{new Date(payment.due_date).toLocaleDateString()}</td>
                        <td>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}</td>
                        <td>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            payment.status === 'Completado' ? 'bg-green-100 text-green-800' :
                            payment.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex space-x-2">
                            <button className="text-primary hover:text-primary-dark">
                              <span className="material-icons">receipt</span>
                            </button>
                            {payment.status === 'Pendiente' && (
                              <button className="text-green-600 hover:text-green-800">
                                <span className="material-icons">payments</span>
                              </button>
                            )}
                          </div>
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
