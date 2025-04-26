import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

const TreasuryList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/treasury/transactions/');
        setTransactions(response.data);
        
        // Calcular resumen
        const income = response.data
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = response.data
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        setSummary({
          income,
          expenses,
          balance: income - expenses
        });
        
        setError(null);
      } catch (err) {
        setError('Error al cargar las transacciones. Por favor, intente nuevamente.');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const columns = [
    { header: 'Fecha', accessor: 'date' },
    { header: 'Descripción', accessor: 'description' },
    { header: 'Categoría', accessor: 'category' },
    { 
      header: 'Tipo', 
      accessor: 'type',
      cell: (value) => (
        <span className={value === 'income' ? 'text-green-600' : 'text-red-600'}>
          {value === 'income' ? 'Ingreso' : 'Gasto'}
        </span>
      )
    },
    { 
      header: 'Monto', 
      accessor: 'amount',
      cell: (value, row) => (
        <span className={row.type === 'income' ? 'text-green-600' : 'text-red-600'}>
          ${value.toFixed(2)}
        </span>
      )
    },
    {
      header: 'Acciones',
      accessor: 'id',
      cell: (value) => (
        <div className="flex space-x-2">
          <Link to={`/treasury/${value}`} className="text-blue-600 hover:text-blue-800">
            Ver
          </Link>
          <Link to={`/treasury/edit/${value}`} className="text-yellow-600 hover:text-yellow-800">
            Editar
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="p-4">
      <PageHeader title="Tesorería" />
      
      {error && <Alert type="error" message={error} />}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card title="Ingresos Totales" value={`$${summary.income.toFixed(2)}`} icon="cash" color="green" />
        <Card title="Gastos Totales" value={`$${summary.expenses.toFixed(2)}`} icon="expense" color="red" />
        <Card title="Balance Actual" value={`$${summary.balance.toFixed(2)}`} icon="balance" color="blue" />
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Transacciones</h2>
        <div className="space-x-2">
          <Button
            label="Nueva Transacción"
            icon="plus"
            variant="primary"
            as={Link}
            to="/treasury/new"
          />
          <Button
            label="Exportar"
            icon="download"
            variant="secondary"
            onClick={() => alert('Funcionalidad de exportación en desarrollo')}
          />
        </div>
      </div>
      
      {loading ? (
        <Loading />
      ) : (
        <Table
          columns={columns}
          data={transactions}
          emptyMessage="No hay transacciones registradas"
        />
      )}
    </div>
  );
};

export default TreasuryList;
