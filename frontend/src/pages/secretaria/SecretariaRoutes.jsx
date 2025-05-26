import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MembersList from './MembersList';
import MemberForm from './MemberForm';
import MemberDetail from './MemberDetail';
import AttendanceRegister from './AttendanceRegister';

const SecretariaRoutes = () => {
  return (
    <Routes>
      <Route index element={<MembersList />} />
      <Route path="membros" element={<MembersList />} />
      <Route path="membros/novo" element={<MemberForm />} />
      <Route path="membros/:id" element={<MemberDetail />} />
      <Route path="membros/:id/editar" element={<MemberForm />} />
      <Route path="presenca" element={<AttendanceRegister />} />
    </Routes>
  );
};

export default SecretariaRoutes;
