import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { treasuryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const IncomeExpenseForm = ({ type = 'income' }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [receipt, setReceipt] = useState(null);
  
  const [formData, setFormData] = useState({
    type: type,
    amount: '',
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    description: '',
    reference_number: '',
    member_id: '',
    payment_method: 'bank_transfer',
    notes: ''
  });

  // Verificar permisos - Solo tesorero y VM pueden acceder
  useEffect(() => {
    if (currentUser && 
        !(currentUser.office === 'Tesorero' || 
          currentUser.office === 'Venerable Maestro' ||
          currentUser.is_admin)) {
      showNotification('No tienes permisos para acceder a esta sección', 'error');
      navigate('/treasury');
    }
  }, [currentUser, navigate, showNotification]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Cargar lista de miembros
        const membersResponse = await treasuryService.getMembersList();
        setMembers(membersResponse.data || []);
        
        // Cargar categorías según el tipo (ingreso o gasto)
        const categoriesResponse = await treasuryService.getTransactionCategories(type);
        setCategories(categoriesResponse.data || []);
        
        // Generar número de referencia automático
        generateReferenceNumber();
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        showNotification('Error al cargar los datos necesarios', 'error');
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [type, showNotification]);

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

  // Generar número de referencia automático
  const generateReferenceNumber = () => {
    const prefix = type === 'income' ? 'ING' : 'GAS';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const reference = `${prefix}-${timestamp}-${random}`;
    
    setFormData(prev => ({
      ...prev,
      reference_number: reference
    }));
  };

  const validateForm = () => {
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      showNotification('El monto debe ser un número positivo', 'error');
      return false;
    }
    
    if (!formData.date) {
      showNotification('La fecha es obligatoria', 'error');
      return false;
    }
    
    if (!formData.category_id) {
      showNotification('Debe seleccionar una categoría', 'error');
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
      
      // Enviar datos
      await treasuryService.createTransaction(formDataObj);
      
      showNotification(
        type === 'income' 
          ? 'Ingreso registrado correctamente' 
          : 'Gasto registrado correctamente', 
        'success'
      );
      
      // Redirigir a la lista de transacciones
      navigate('/treasury');
    } catch (err) {
      console.error('Error al guardar transacción:', err);
      showNotification(
        type === 'income' 
          ? 'Error al registrar el ingreso' 
          : 'Error al registrar el gasto', 
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

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
          {type === 'income' ? 'Registrar Nuevo Ingreso' : 'Registrar Nuevo Gasto'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/treasury')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Volver
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h2>
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
            
            {/* Fecha */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            {/* Categoría */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Seleccione una categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Miembro (opcional para gastos) */}
            <div>
              <label htmlFor="member_id" className="block text-sm font-medium text-gray-700 mb-1">
                Miembro {type === 'income' && <span className="text-red-500">*</span>}
              </label>
              <select
                id="member_id"
                name="member_id"
                value={formData.member_id}
                onChange={handleChange}
                required={type === 'income'}
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
            
            {/* Método de Pago */}
            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago <span className="text-red-500">*</span>
              </label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="bank_transfer">Transferencia Bancaria</option>
                <option value="cash">Efectivo</option>
                <option value="check">Cheque</option>
                <option value="credit_card">Tarjeta de Crédito</option>
              </select>
            </div>
            
            {/* Número de Referencia */}
            <div>
              <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Referencia
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="reference_number"
                  name="reference_number"
                  value={formData.reference_number}
                  onChange={handleChange}
                  className="flex-1 min-w-0 block w-full rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={generateReferenceNumber}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm"
                >
                  Generar
                </button>
              </div>
            </div>
            
            {/* Descripción */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Describa el propósito de esta transacción..."
              ></textarea>
            </div>
            
            {/* Notas */}
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Información adicional sobre esta transacción..."
              ></textarea>
            </div>
            
            {/* Recibo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recibo o Comprobante
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {receipt ? (
                  <div className="space-y-1 text-center">
                    <div className="flex items-center justify-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex text-sm text-gray-600">
                      <p className="pl-1">{receipt.name}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {(receipt.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveReceipt}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Eliminar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="receipt" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Subir un archivo</span>
                        <input id="receipt" name="receipt" type="file" className="sr-only" onChange={handleChange} accept=".pdf,.jpg,.jpeg,.png" />
                      </label>
                      <p className="pl-1">o arrastrar y soltar</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG o PDF hasta 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/treasury')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                submitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeExpenseForm;
