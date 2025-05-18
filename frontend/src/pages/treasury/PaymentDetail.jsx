import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { treasuryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const PaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);
  const [memberName, setMemberName] = useState('');
  const [feeTypeName, setFeeTypeName] = useState('');
  
  // Verificar permisos - Solo tesorero, VM y secretario pueden acceder
  useEffect(() => {
    if (currentUser && 
        !(currentUser.office === 'Tesorero' || 
          currentUser.office === 'Venerable Maestro' || 
          currentUser.office === 'Secretario' ||
          currentUser.is_admin)) {
      showNotification('No tienes permisos para acceder a esta sección', 'error');
      navigate('/dashboard');
    }
  }, [currentUser, navigate, showNotification]);

  // Cargar datos del pago
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener detalles del pago
        const paymentResponse = await treasuryService.getPayment(id);
        setPayment(paymentResponse.data);
        
        // Obtener nombre del miembro
        const membersResponse = await treasuryService.getMembersList();
        const member = membersResponse.data.find(m => m.id === paymentResponse.data.member_id);
        setMemberName(member ? `${member.first_name} ${member.last_name}` : 'Desconocido');
        
        // Obtener nombre del tipo de cuota
        const feeTypesResponse = await treasuryService.getFeeTypes();
        const feeType = feeTypesResponse.data.find(ft => ft.id === paymentResponse.data.fee_type_id);
        setFeeTypeName(feeType ? feeType.name : 'Desconocido');
        
      } catch (err) {
        console.error('Error al cargar datos del pago:', err);
        setError('Error al cargar los datos del pago. Por favor, intente nuevamente.');
        showNotification('Error al cargar datos del pago', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentData();
  }, [id, showNotification]);

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Función para formatear monto
  const formatAmount = (amount, currency = 'USD') => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Función para obtener color según estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener texto de estado
  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Vencido';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  // Función para manejar la edición del pago
  const handleEditPayment = () => {
    navigate(`/treasury/payments/edit/${id}`);
  };

  // Función para manejar el envío de recordatorio
  const handleSendReminder = async () => {
    try {
      await treasuryService.sendPaymentReminder(id);
      showNotification('Recordatorio enviado correctamente', 'success');
    } catch (err) {
      console.error('Error al enviar recordatorio:', err);
      showNotification('Error al enviar recordatorio', 'error');
    }
  };

  // Función para manejar la descarga del recibo
  const handleDownloadReceipt = async () => {
    if (!payment || !payment.receipt_url) {
      showNotification('No hay recibo disponible para este pago', 'warning');
      return;
    }
    
    try {
      const response = await treasuryService.downloadReceipt(id);
      
      // Crear un enlace temporal para la descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener nombre del archivo de los headers o usar un nombre por defecto
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'recibo.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showNotification('Recibo descargado correctamente', 'success');
    } catch (err) {
      console.error('Error al descargar recibo:', err);
      showNotification('Error al descargar el recibo', 'error');
    }
  };

  // Función para manejar la eliminación del pago
  const handleDeletePayment = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar este pago? Esta acción no se puede deshacer.')) {
      try {
        await treasuryService.deletePayment(id);
        showNotification('Pago eliminado correctamente', 'success');
        navigate('/treasury/payments');
      } catch (err) {
        console.error('Error al eliminar pago:', err);
        showNotification('Error al eliminar el pago', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error || 'No se pudo cargar la información del pago'}</p>
        </div>
        <button
          onClick={() => navigate('/treasury/payments')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Volver a la lista de pagos
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Detalle del Pago
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/treasury/payments')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Volver
          </button>
          <button
            onClick={handleEditPayment}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Encabezado con estado */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
              {getStatusText(payment.status)}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              Referencia: {payment.reference_number || 'N/A'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Creado: {formatDate(payment.created_at)}
          </div>
        </div>
        
        {/* Información principal */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Información del Pago</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Miembro</p>
                  <p className="mt-1 text-sm text-gray-900">{memberName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo de Cuota</p>
                  <p className="mt-1 text-sm text-gray-900">{feeTypeName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Monto</p>
                  <p className="mt-1 text-sm text-gray-900 font-semibold">{formatAmount(payment.amount, payment.currency)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Descripción</p>
                  <p className="mt-1 text-sm text-gray-900">{payment.description || 'Sin descripción'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Fechas y Estado</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Vencimiento</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(payment.due_date)}</p>
                </div>
                {payment.status === 'paid' && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de Pago</p>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(payment.payment_date)}</p>
                  </div>
                )}
                {payment.status === 'paid' && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Método de Pago</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {payment.payment_method === 'bank_transfer' && 'Transferencia Bancaria'}
                      {payment.payment_method === 'cash' && 'Efectivo'}
                      {payment.payment_method === 'check' && 'Cheque'}
                      {payment.payment_method === 'credit_card' && 'Tarjeta de Crédito'}
                      {!payment.payment_method && 'No especificado'}
                    </p>
                  </div>
                )}
                {payment.receipt_url && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Recibo</p>
                    <button
                      onClick={handleDownloadReceipt}
                      className="mt-1 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg className="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar Recibo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Notas adicionales */}
          {payment.notes && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Notas</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-700">{payment.notes}</p>
              </div>
            </div>
          )}
          
          {/* Acciones adicionales */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between">
              <div>
                {payment.status === 'pending' && (
                  <button
                    onClick={handleSendReminder}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Enviar Recordatorio
                  </button>
                )}
              </div>
              <div>
                <button
                  onClick={handleDeletePayment}
                  className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail;
