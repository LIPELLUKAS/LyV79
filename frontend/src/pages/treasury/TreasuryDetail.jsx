import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

const TreasuryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/treasury/transactions/${id}/`);
        setTransaction(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los detalles de la transacción. Por favor, intente nuevamente.');
        console.error('Error fetching transaction details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/treasury/transactions/${id}/`);
      navigate('/treasury');
    } catch (err) {
      setError('Error al eliminar la transacción. Por favor, intente nuevamente.');
      console.error('Error deleting transaction:', err);
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error) return <Alert type="error" message={error} />;

  if (!transaction) return <Alert type="warning" message="Transacción no encontrada" />;

  return (
    <div className="p-4">
      <PageHeader 
        title="Detalles de Transacción" 
        backLink="/treasury"
        backLabel="Volver a Tesorería"
      />
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Descripción</h3>
            <p className="text-lg font-semibold">{transaction.description}</p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Fecha</h3>
            <p className="text-lg font-semibold">{transaction.date}</p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Categoría</h3>
            <p className="text-lg font-semibold">{transaction.category}</p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Tipo</h3>
            <p className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
            </p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Monto</h3>
            <p className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              ${transaction.amount.toFixed(2)}
            </p>
          </div>
          
          <div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Registrado por</h3>
            <p className="text-lg font-semibold">{transaction.created_by || 'Sistema'}</p>
          </div>
        </div>
        
        {transaction.notes && (
          <div className="mt-6">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Notas</h3>
            <p className="text-lg">{transaction.notes}</p>
          </div>
        )}
        
        {transaction.attachment && (
          <div className="mt-6">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Comprobante</h3>
            <a 
              href={transaction.attachment} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Ver comprobante
            </a>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button
          label="Editar"
          icon="edit"
          variant="primary"
          as={Link}
          to={`/treasury/edit/${id}`}
        />
        
        {!deleteConfirm ? (
          <Button
            label="Eliminar"
            icon="trash"
            variant="danger"
            onClick={() => setDeleteConfirm(true)}
          />
        ) : (
          <div className="flex space-x-2">
            <Button
              label="Cancelar"
              variant="secondary"
              onClick={() => setDeleteConfirm(false)}
            />
            <Button
              label="Confirmar Eliminación"
              variant="danger"
              onClick={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TreasuryDetail;
