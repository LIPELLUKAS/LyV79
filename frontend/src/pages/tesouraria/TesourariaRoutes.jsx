import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PaymentsList from './PaymentsList';
import PaymentForm from './PaymentForm';
import PaymentDetail from './PaymentDetail';

const TesourariaRoutes = () => {
  return (
    <Routes>
      <Route index element={<PaymentsList />} />
      <Route path="pagamentos" element={<PaymentsList />} />
      <Route path="pagamentos/novo" element={<PaymentForm />} />
      <Route path="pagamentos/:id" element={<PaymentDetail />} />
      <Route path="pagamentos/:id/editar" element={<PaymentForm />} />
    </Routes>
  );
};

export default TesourariaRoutes;
