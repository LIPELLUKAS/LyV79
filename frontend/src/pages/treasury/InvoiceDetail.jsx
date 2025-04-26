import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { treasuryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);

  // Verificar permisos - Solo tesorero y VM pueden acceder
  useEffect(() => {
    if (currentUser && 
        !(currentUser.office === 'Tesorero' || 
          currentUser.office === 'Venerable Maestro' || 
          currentUser.degree >= 3)) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Cargar datos de la factura
  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        setLoading(true);
        const response = await treasuryService.getInvoice(id);
        setInvoice(response.data);
      } catch (e) {
        setError('Error al cargar los datos de la factura');
        console.error('Error al cargar factura:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoiceData();
  }, [id]);

  // Marcar factura como pagada
  const handleMarkAsPaid = async () => {
    try {
      await treasuryService.updateInvoiceStatus(id, { status: 'paid' });
      
      // Actualizar el estado local
      setInvoice(prev => ({
        ...prev,
        status: 'paid'
      }));
    } catch (e) {
      setError('Error al actualizar el estado de la factura');
      console.error('Error al actualizar factura:', e);
    }
  };

  // Marcar factura como cancelada
  const handleCancelInvoice = async () => {
    try {
      await treasuryService.updateInvoiceStatus(id, { status: 'cancelled' });
      
      // Actualizar el estado local
      setInvoice(prev => ({
        ...prev,
        status: 'cancelled'
      }));
    } catch (e) {
      setError('Error al cancelar la factura');
      console.error('Error al cancelar factura:', e);
    }
  };

  // Imprimir factura
  const handlePrint = () => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 100);
  };

  // Enviar factura por correo
  const handleSendEmail = async () => {
    try {
      await treasuryService.sendInvoiceByEmail(id);
      alert('Factura enviada por correo electrónico');
    } catch (e) {
      setError('Error al enviar la factura por correo');
      console.error('Error al enviar factura:', e);
    }
  };

  // Volver a la lista de facturas
  const handleBack = () => {
    navigate('/treasury/invoices');
  };

  // Editar factura
  const handleEdit = () => {
    navigate(`/treasury/invoices/edit/${id}`);
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${showPrintView ? 'print:p-0' : ''}`}>
      {!showPrintView && (
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button
            onClick={handleBack}
            className="text-indigo-600 hover:text-indigo-900 flex items-center"
          >
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a facturas
          </button>
          
          <div className="flex space-x-2">
            {invoice && invoice.status === 'issued' && (
              <button
                onClick={handleMarkAsPaid}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Marcar como pagada
              </button>
            )}
            
            {invoice && (invoice.status === 'draft' || invoice.status === 'issued') && (
              <button
                onClick={handleEdit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Editar
              </button>
            )}
            
            <button
              onClick={handlePrint}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Imprimir
            </button>
            
            {invoice && invoice.status !== 'cancelled' && (
              <button
                onClick={handleSendEmail}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Enviar por correo
              </button>
            )}
            
            {invoice && (invoice.status === 'draft' || invoice.status === 'issued') && (
              <button
                onClick={handleCancelInvoice}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Cancelar factura
              </button>
            )}
          </div>
        </div>
      )}
      
      {error && !showPrintView && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 print:hidden" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {loading ? (
        !showPrintView && (
          <div className="flex justify-center items-center h-64 print:hidden">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )
      ) : invoice ? (
        <div className={`bg-white rounded-lg shadow overflow-hidden ${showPrintView ? 'print:shadow-none' : ''}`}>
          {/* Cabecera de la factura */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Factura #{invoice.invoice_number}</h1>
                <p className="text-sm text-gray-500">
                  {invoice.reference ? `Referencia: ${invoice.reference}` : ''}
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'issued' ? 'bg-blue-100 text-blue-800' :
                    invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status === 'paid' ? 'Pagada' :
                     invoice.status === 'issued' ? 'Emitida' :
                     invoice.status === 'draft' ? 'Borrador' :
                     'Cancelada'}
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-sm text-gray-500">Fecha de emisión</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(invoice.issue_date).toLocaleDateString()}
                </p>
                {invoice.due_date && (
                  <>
                    <p className="text-sm text-gray-500 mt-2">Fecha de vencimiento</p>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Información de emisor y destinatario */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Emisor</h2>
                <p className="text-gray-800 font-medium">{invoice.issuer.lodge_name}</p>
                <p className="text-gray-600">{invoice.issuer.address}</p>
                <p className="text-gray-600">{invoice.issuer.city}, {invoice.issuer.state} {invoice.issuer.postal_code}</p>
                <p className="text-gray-600">{invoice.issuer.country}</p>
                <p className="text-gray-600 mt-2">{invoice.issuer.tax_id}</p>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Destinatario</h2>
                {invoice.recipient_type === 'member' ? (
                  <>
                    <p className="text-gray-800 font-medium">
                      {invoice.recipient.symbolic_name || `${invoice.recipient.first_name} ${invoice.recipient.last_name}`}
                    </p>
                    <p className="text-gray-600">{invoice.recipient.email}</p>
                    {invoice.recipient.address && (
                      <>
                        <p className="text-gray-600">{invoice.recipient.address}</p>
                        <p className="text-gray-600">
                          {invoice.recipient.city && `${invoice.recipient.city}, `}
                          {invoice.recipient.state && `${invoice.recipient.state} `}
                          {invoice.recipient.postal_code}
                        </p>
                        <p className="text-gray-600">{invoice.recipient.country}</p>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-gray-800 font-medium">{invoice.recipient_name}</p>
                    <p className="text-gray-600">{invoice.recipient_email}</p>
                    {invoice.recipient_address && (
                      <p className="text-gray-600">{invoice.recipient_address}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Detalles de la factura */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Detalles</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio unitario
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.description}
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.unit_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(item.quantity * item.unit_price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Resumen de la factura */}
          <div className="p-6">
            <div className="flex justify-end">
              <div className="w-full md:w-1/3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900 font-medium">${invoice.subtotal.toLocaleString()}</span>
                </div>
                {invoice.tax_amount > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Impuestos ({invoice.tax_rate}%):</span>
                    <span className="text-gray-900 font-medium">${invoice.tax_amount.toLocaleString()}</span>
                  </div>
                )}
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Descuento:</span>
                    <span className="text-gray-900 font-medium">-${invoice.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                  <span className="text-gray-800 font-medium">Total:</span>
                  <span className="text-gray-900 font-bold">${invoice.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Notas y términos */}
            {(invoice.notes || invoice.terms) && (
              <div className="mt-8 border-t border-gray-200 pt-4">
                {invoice.notes && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Notas</h3>
                    <p className="text-sm text-gray-600">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Términos y condiciones</h3>
                    <p className="text-sm text-gray-600">{invoice.terms}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Información de pago */}
            {invoice.payment_info && (
              <div className="mt-8 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Información de pago</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.payment_info}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        !showPrintView && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No se encontró la factura solicitada</p>
            <button
              onClick={handleBack}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Volver a la lista de facturas
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default InvoiceDetail;
