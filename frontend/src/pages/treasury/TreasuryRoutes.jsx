import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PaymentsList from './PaymentsList';
import PaymentForm from './PaymentForm';
import PaymentDetail from './PaymentDetail';
import InvoicesList from './InvoicesList';
import InvoiceDetail from './InvoiceDetail';
import FinancialDashboard from './FinancialDashboard';
import TransactionsList from './TransactionsList';
import TransactionDetail from './TransactionDetail';

const TreasuryRoutes = () => {
  return (
    <Routes>
      <Route index element={<FinancialDashboard />} />
      <Route path="dashboard" element={<FinancialDashboard />} />
      <Route path="payments" element={<PaymentsList />} />
      <Route path="payments/new" element={<PaymentForm />} />
      <Route path="payments/edit/:id" element={<PaymentForm />} />
      <Route path="payments/detail/:id" element={<PaymentDetail />} />
      <Route path="invoices" element={<InvoicesList />} />
      <Route path="invoices/:id" element={<InvoiceDetail />} />
      <Route path="transactions" element={<TransactionsList />} />
      <Route path="transactions/:id" element={<TransactionDetail />} />
      <Route path="*" element={<Navigate to="/treasury" replace />} />
    </Routes>
  );
};

export default TreasuryRoutes;
