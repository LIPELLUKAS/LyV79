import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { treasuryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);
  const [memberName, setMemberName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  
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

  // Cargar datos de la transacción
  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener detalles de la transacción
        const transactionResponse = await treasuryService.getTransaction(id);
        setTransaction(transactionResponse.data);
        
        // Obtener nombre del miembro si existe
        if (transactionResponse.data.member_id) {
          const membersResponse = await treasuryService.getMembersList();
          const member = membersResponse.data.find(m => m.id === transactionResponse.data.member_id);
          setMemberName(member ? `${member.first_name} ${member.last_name}` : 'Desconocido');
        } else {
          setMemberName('N/A');
        }
        
        // Obtener nombre de la categoría
        const categoriesResponse = await treasuryService.getAllTransactionCategories();
        const category = categoriesResponse.data.find(c => c.id === transactionResponse.data.category_id);
        setCategoryName(category ? category.name : 'Desconocido');
        
      } catch (err) {
        console.error('Error al cargar datos de la transacción:', err);
        setError('Error al cargar los datos de la transacción. Por favor, intente nuevamente.');
        showNotification('Error al cargar datos de la transacción', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactionData();
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

  // Función para obtener color según tipo
  const getTypeColor = (type) => {
    return type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Función para obtener texto de tipo
  const getTypeText = (type) => {
    return type === 'income' ? 'Ingreso' : 'Gasto';
  };

  // Función para manejar la edición de la transacción
  const handleEditTransaction = () => {
    if (transaction) {
      navigate(`/treasury/transactions/edit/${id}?type=${transaction.type}`);
    }
  };

  // Función para manejar la descarga del recibo
  const handleDownloadReceipt = async () => {
    if (!transaction || !transaction.receipt_url) {
      showNotification('No hay recibo disponible para esta transacción', 'warning');
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

  // Función para manejar la eliminación de la transacción
  const handleDeleteTransaction = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar esta transacción? Esta acción no se puede deshacer.')) {
      try {
        await treasuryService.deleteTransaction(id);
        showNotification('Transacción eliminada correctamente', 'success');
        navigate('/treasury/transactions');
      } catch (err) {
        console.error('Error al eliminar transacción:', err);
        showNotification('Error al eliminar la transacción', 'error');
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

  if (error || !transaction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error || 'No se pudo cargar la información de la transacción'}</p>
        </div>
        <button
          onClick={() => navigate('/treasury/transactions')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Volver a la lista de transacciones
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Detalle de {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/treasury/transactions')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Volver
          </button>
          <button
            onClick={handleEditTransaction}
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
        {/* Encabezado con tipo */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
              {getTypeText(transaction.type)}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              Referencia: {transaction.reference_number || 'N/A'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Creado: {formatDate(transaction.created_at)}
          </div>
        </div>
        
        {/* Información principal */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Información de la Transacción</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Descripción</p>
                  <p className="mt-1 text-sm text-gray-900">{transaction.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Categoría</p>
                  <p className="mt-1 text-sm text-gray-900">{categoryName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Miembro</p>
                  <p className="mt-1 text-sm text-gray-900">{memberName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Monto</p>
                  <p className={`mt-1 text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatAmount(transaction.amount, transaction.currency)}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Detalles Adicionales</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Transacción</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(transaction.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Método de Pago</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {transaction.payment_method === 'bank_transfer' && 'Transferencia Bancaria'}
                    {transaction.payment_method === 'cash' && 'Efectivo'}
                    {transaction.payment_method === 'check' && 'Cheque'}
                    {transaction.payment_method === 'credit_card' && 'Tarjeta de Crédito'}
                    {!transaction.payment_method && 'No especificado'}
                  </p>
                </div>
                {transaction.receipt_url && (
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
          {transaction.notes && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Notas</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-700">{transaction.notes}</p>
              </div>
            </div>
          )}
          
          {/* Acciones adicionales */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={handleDeleteTransaction}
                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar Transacción
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
