import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { treasuryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const PaymentForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  
  const [formData, setFormData] = useState({
    member: '',
    fee_type: '',
    amount: '',
    concept: '',
    reference: '',
    due_date: new Date().toISOString().split('T')[0],
    payment_date: '',
    status: 'pending',
    payment_method: '',
    notes: ''
  });

  // Verificar permisos - Solo tesorero y VM pueden acceder
  useEffect(() => {
    if (currentUser && 
        !(currentUser.office === 'Tesorero' || 
          currentUser.office === 'Venerable Maestro' || 
          currentUser.degree >= 3)) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Cargar datos para el formulario
  useEffect(() => {
    const loadFormData = async () => {
      try {
        // Cargar lista de miembros
        const membersResponse = await treasuryService.getMembersList();
        setMembers(membersResponse.data || []);
        
        // Cargar tipos de cuotas
        const feesResponse = await treasuryService.getFeeTypes();
        setFeeTypes(feesResponse.data || []);
        
        // Si estamos editando, cargar datos del pago
        if (isEditing) {
          const paymentResponse = await treasuryService.getPayment(id);
          const payment = paymentResponse.data;
          
          // Formatear fechas para el formulario
          const formattedPayment = {
            ...payment,
            due_date: payment.due_date ? payment.due_date.split('T')[0] : '',
            payment_date: payment.payment_date ? payment.payment_date.split('T')[0] : ''
          };
          
          setFormData(formattedPayment);
        }
      } catch (e) {
        setError('Error al cargar los datos necesarios');
        console.error('Error al cargar datos:', e);
      } finally {
        setLoading(false);
      }
    };
    
    loadFormData();
  }, [id, isEditing]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si seleccionamos un tipo de cuota, actualizar el monto y concepto automáticamente
    if (name === 'fee_type') {
      const selectedFee = feeTypes.find(fee => fee.id === parseInt(value));
      if (selectedFee) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          amount: selectedFee.amount,
          concept: selectedFee.name
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // Validar datos
      if (!formData.member || !formData.amount || !formData.concept || !formData.due_date) {
        throw new Error('Por favor completa todos los campos obligatorios');
      }
      
      // Crear o actualizar pago
      if (isEditing) {
        await treasuryService.updatePayment(id, formData);
      } else {
        await treasuryService.createPayment(formData);
      }
      
      // Redirigir a la lista de pagos
      navigate('/treasury/payments');
    } catch (e) {
      setError(e.message || 'Error al guardar el pago');
      console.error('Error al guardar:', e);
      setSaving(false);
    }
  };

  // Cancelar y volver a la lista
  const handleCancel = () => {
    navigate('/treasury/payments');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Pago' : 'Nuevo Pago'}
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Miembro */}
              <div>
                <label htmlFor="member" className="block text-sm font-medium text-gray-700 mb-1">
                  Miembro <span className="text-red-500">*</span>
                </label>
                <select
                  id="member"
                  name="member"
                  value={formData.member}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Seleccionar miembro</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.symbolic_name || `${member.first_name} ${member.last_name}`}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Tipo de cuota */}
              <div>
                <label htmlFor="fee_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de cuota
                </label>
                <select
                  id="fee_type"
                  name="fee_type"
                  value={formData.fee_type}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Seleccionar tipo</option>
                  {feeTypes.map(fee => (
                    <option key={fee.id} value={fee.id}>
                      {fee.name} - ${fee.amount}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Monto */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Monto <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              {/* Concepto */}
              <div>
                <label htmlFor="concept" className="block text-sm font-medium text-gray-700 mb-1">
                  Concepto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="concept"
                  id="concept"
                  value={formData.concept}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ej. Cuota mensual, Donación, etc."
                />
              </div>
              
              {/* Referencia */}
              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia
                </label>
                <input
                  type="text"
                  name="reference"
                  id="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ej. Factura #123, Recibo #456"
                />
              </div>
              
              {/* Fecha de vencimiento */}
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de vencimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="due_date"
                  id="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              {/* Estado */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="pending">Pendiente</option>
                  <option value="completed">Completado</option>
                  <option value="overdue">Vencido</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              
              {/* Fecha de pago (solo si está completado) */}
              {formData.status === 'completed' && (
                <div>
                  <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de pago
                  </label>
                  <input
                    type="date"
                    name="payment_date"
                    id="payment_date"
                    value={formData.payment_date}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              )}
              
              {/* Método de pago (solo si está completado) */}
              {formData.status === 'completed' && (
                <div>
                  <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                    Método de pago
                  </label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Seleccionar método</option>
                    <option value="cash">Efectivo</option>
                    <option value="transfer">Transferencia</option>
                    <option value="check">Cheque</option>
                    <option value="card">Tarjeta</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              )}
              
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
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Información adicional sobre este pago..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  saving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {saving ? 'Guardando...' : isEditing ? 'Actualizar Pago' : 'Crear Pago'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
