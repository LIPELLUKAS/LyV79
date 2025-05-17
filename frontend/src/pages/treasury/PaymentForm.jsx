import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { treasuryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const PaymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [existingReceipt, setExistingReceipt] = useState(null);
  
  const [formData, setFormData] = useState({
    member_id: '',
    fee_type_id: '',
    amount: '',
    currency: 'USD',
    due_date: new Date().toISOString().split('T')[0],
    payment_date: '',
    status: 'pending',
    reference_number: '',
    description: '',
    payment_method: 'bank_transfer',
    notes: ''
  });

  // Verificar permisos - Solo tesorero, VM y secretario pueden acceder
  useEffect(() => {
    if (currentUser && 
        !(currentUser.office === 'Tesorero' || 
          currentUser.office === 'Venerable Maestro' || 
          currentUser.office === 'Secretario' ||
          currentUser.is_admin)) {
      showNotification('No tienes permisos para acceder a esta sección', 'error');
      navigate('/treasury/payments');
    }
  }, [currentUser, navigate, showNotification]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Cargar lista de miembros
        const membersResponse = await treasuryService.getMembersList();
        setMembers(membersResponse.data || []);
        
        // Cargar tipos de cuotas
        const feeTypesResponse = await treasuryService.getFeeTypes();
        setFeeTypes(feeTypesResponse.data || []);
        
        // Si estamos editando, cargar datos del pago
        if (isEditing) {
          const paymentResponse = await treasuryService.getPayment(id);
          const payment = paymentResponse.data;
          
          // Formatear fechas
          const dueDate = payment.due_date ? new Date(payment.due_date).toISOString().split('T')[0] : '';
          const paymentDate = payment.payment_date ? new Date(payment.payment_date).toISOString().split('T')[0] : '';
          
          setFormData({
            member_id: payment.member_id || '',
            fee_type_id: payment.fee_type_id || '',
            amount: payment.amount || '',
            currency: payment.currency || 'USD',
            due_date: dueDate,
            payment_date: paymentDate,
            status: payment.status || 'pending',
            reference_number: payment.reference_number || '',
            description: payment.description || '',
            payment_method: payment.payment_method || 'bank_transfer',
            notes: payment.notes || ''
          });
          
          // Cargar recibo existente
          if (payment.receipt_url) {
            setExistingReceipt({
              url: payment.receipt_url,
              name: payment.receipt_name || 'Recibo'
            });
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        setError('Error al cargar los datos necesarios. Por favor, intente nuevamente.');
        showNotification('Error al cargar datos', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [id, isEditing, showNotification]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      if (files && files.length > 0) {
        setReceipt(files[0]);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRemoveReceipt = () => {
    setReceipt(null);
  };

  const handleRemoveExistingReceipt = () => {
    setExistingReceipt(null);
  };

  const validateForm = () => {
    if (!formData.member_id) {
      showNotification('Debe seleccionar un miembro', 'error');
      return false;
    }
    
    if (!formData.fee_type_id) {
      showNotification('Debe seleccionar un tipo de cuota', 'error');
      return false;
    }
    
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      showNotification('El monto debe ser un número positivo', 'error');
      return false;
    }
    
    if (!formData.due_date) {
      showNotification('La fecha de vencimiento es obligatoria', 'error');
      return false;
    }
    
    // Si el estado es "pagado", debe tener fecha de pago
    if (formData.status === 'paid' && !formData.payment_date) {
      showNotification('Para pagos con estado "Pagado", debe especificar la fecha de pago', 'error');
      return false;
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
      // Crear FormData para enviar archivos
      const formDataObj = new FormData();
      
      // Agregar campos del formulario
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });
      
      // Agregar recibo si existe
      if (receipt) {
        formDataObj.append('receipt', receipt);
      }
      
      // Indicar si se debe mantener el recibo existente
      if (isEditing) {
        formDataObj.append('keep_existing_receipt', existingReceipt ? 'true' : 'false');
      }
      
      let response;
      
      if (isEditing) {
        response = await treasuryService.updatePayment(id, formDataObj);
        showNotification('Pago actualizado correctamente', 'success');
      } else {
        response = await treasuryService.createPayment(formDataObj);
        showNotification('Pago creado correctamente', 'success');
      }
      
      // Redirigir a la lista de pagos
      navigate('/treasury/payments');
    } catch (err) {
      console.error('Error al guardar pago:', err);
      setError('Error al guardar el pago. Por favor, intente nuevamente.');
      showNotification('Error al guardar el pago', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Generar número de referencia automático
  const generateReferenceNumber = () => {
    const prefix = 'PAY';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const reference = `${prefix}-${timestamp}-${random}`;
    
    setFormData(prev => ({
      ...prev,
      reference_number: reference
    }));
  };

  // Actualizar monto automáticamente al cambiar el tipo de cuota
  const updateAmountFromFeeType = (feeTypeId) => {
    const feeType = feeTypes.find(ft => ft.id === feeTypeId);
    if (feeType && feeType.amount) {
      setFormData(prev => ({
        ...prev,
        amount: feeType.amount,
        currency: feeType.currency || prev.currency
      }));
    }
  };

  // Efecto para actualizar monto al cambiar tipo de cuota
  useEffect(() => {
    if (formData.fee_type_id && !isEditing) {
      updateAmountFromFeeType(formData.fee_type_id);
    }
  }, [formData.fee_type_id, isEditing]);

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
          {isEditing ? 'Editar Pago' : 'Registrar Nuevo Pago'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/treasury/payments')}
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
            {/* Información Básica */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h2>
            </div>
            
            {/* Miembro */}
            <div>
              <label htmlFor="member_id" className="block text-sm font-medium text-gray-700 mb-1">
                Miembro <span className="text-red-500">*</span>
              </label>
              <select
                id="member_id"
                name="member_id"
                value={formData.member_id}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Seleccione un miembro</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tipo de Cuota */}
            <div>
              <label htmlFor="fee_type_id" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cuota <span className="text-red-500">*</span>
              </label>
              <select
                id="fee_type_id"
                name="fee_type_id"
                value={formData.fee_type_id}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Seleccione un tipo de cuota</option>
                {feeTypes.map(feeType => (
                  <option key={feeType.id} value={feeType.id}>
                    {feeType.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Monto */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Monto <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            
            {/* Moneda */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Moneda <span className="text-red-500">*</span>
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="EUR">EUR - Euro</option>
                <option value="CLP">CLP - Peso Chileno</option>
                <option value="ARS">ARS - Peso Argentino</option>
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="BRL">BRL - Real Brasileño</option>
                <option value="COP">COP - Peso Colombiano</option>
                <option value="PEN">PEN - Sol Peruano</option>
              </select>
            </div>
            
            {/* Fecha de Vencimiento */}
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Vencimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            {/* Estado */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="overdue">Vencido</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            
            {/* Fecha de Pago (solo si está pagado) */}
            {formData.status === 'paid' && (
              <div>
                <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Pago <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="payment_date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  required={formData.status === 'paid'}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            )}
            
            {/* Método de Pago (solo si está pagado) */}
            {formData.status === 'paid' && (
              <div>
                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago <span className="text-red-500">*</span>
                </label>
                <select
                  id="payment_method"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  required={formData.status === 'paid'}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="bank_transfer">Transferencia Bancaria</option>
                  <option value="cash">Efectivo</option>
                  <option value="check">Cheque</option>
                  <option value="credit_card">Tarjeta de Crédito</option>
                  <option value="debit_card">Tarjeta de Débito</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            )}
            
            {/* Información Adicional */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Información Adicional</h2>
            </div>
            
            {/* Número de Referencia */}
            <div className="relative">
              <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Referencia
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="reference_number"
                  name="reference_number"
                  value={formData.reference_number}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="PAY-123456-789"
                />
                <button
                  type="button"
                  onClick={generateReferenceNumber}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Generar
                </button>
              </div>
            </div>
            
            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Cuota mensual de abril 2025"
              />
            </div>
            
            {/* Notas */}
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Notas adicionales sobre este pago"
              ></textarea>
            </div>
            
            {/* Recibo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recibo de Pago
              </label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="receipt" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Subir recibo</span>
                      <input 
                        id="receipt" 
                        name="receipt" 
                        type="file" 
                        className="sr-only" 
                        onChange={handleChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, JPEG, PNG hasta 10MB
                  </p>
                </div>
              </div>
              
              {/* Recibo existente */}
              {existingReceipt && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Recibo existente:</h3>
                  <div className="flex items-center justify-between py-2 px-4 text-sm border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{existingReceipt.name}</span>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={existingReceipt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver
                      </a>
                      <button
                        type="button"
                        onClick={handleRemoveExistingReceipt}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Nuevo recibo */}
              {receipt && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Nuevo recibo:</h3>
                  <div className="flex items-center justify-between py-2 px-4 text-sm border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{receipt.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveReceipt}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/treasury/payments')}
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
                  {isEditing ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                <>{isEditing ? 'Actualizar Pago' : 'Registrar Pago'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
