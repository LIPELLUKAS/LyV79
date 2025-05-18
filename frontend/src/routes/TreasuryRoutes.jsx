import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Importación de componentes de tesorería
import TreasuryPage from '../pages/treasury/TreasuryPage';
import PaymentsList from '../pages/treasury/PaymentsList';
import PaymentDetail from '../pages/treasury/PaymentDetail';
import PaymentForm from '../pages/treasury/PaymentForm';
import IncomeExpenseForm from '../pages/treasury/IncomeExpenseForm';
import TransactionsList from '../pages/treasury/TransactionsList';
import TransactionDetail from '../pages/treasury/TransactionDetail';
import FinancialDashboard from '../pages/treasury/FinancialDashboard';
import FinancialReports from '../pages/treasury/FinancialReports';

const TreasuryRoutes = () => {
  const { currentUser } = useAuth();
  
  // Verificar si el usuario tiene permisos para acceder a la tesorería
  const hasTreasuryAccess = currentUser && (
    currentUser.office === 'Tesorero' || 
    currentUser.office === 'Venerable Maestro' || 
    currentUser.office === 'Secretario' ||
    currentUser.is_admin
  );
  
  // Verificar si el usuario tiene permisos para editar/crear en tesorería
  const hasTreasuryEditAccess = currentUser && (
    currentUser.office === 'Tesorero' || 
    currentUser.office === 'Venerable Maestro' ||
    currentUser.is_admin
  );
  
  if (!hasTreasuryAccess) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <Routes>
      {/* Página principal de tesorería */}
      <Route path="/" element={<TreasuryPage />} />
      
      {/* Rutas para pagos */}
      <Route path="/payments" element={<PaymentsList />} />
      <Route path="/payments/:id" element={<PaymentDetail />} />
      {hasTreasuryEditAccess && (
        <>
          <Route path="/payments/new" element={<PaymentForm />} />
          <Route path="/payments/edit/:id" element={<PaymentForm />} />
        </>
      )}
      
      {/* Rutas para transacciones (ingresos y gastos) */}
      <Route path="/transactions" element={<TransactionsList />} />
      <Route path="/transactions/:id" element={<TransactionDetail />} />
      {hasTreasuryEditAccess && (
        <>
          <Route path="/income/new" element={<IncomeExpenseForm type="income" />} />
          <Route path="/expense/new" element={<IncomeExpenseForm type="expense" />} />
          <Route path="/transactions/edit/:id" element={<IncomeExpenseForm />} />
        </>
      )}
      
      {/* Rutas para dashboard y reportes financieros */}
      <Route path="/dashboard" element={<FinancialDashboard />} />
      <Route path="/reports" element={<FinancialReports />} />
      
      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/treasury" replace />} />
    </Routes>
  );
};

export default TreasuryRoutes;
