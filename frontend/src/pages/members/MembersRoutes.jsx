import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MembersList from './MembersList';
import MemberDetail from './MemberDetail';
import MemberForm from './MemberForm';
import AttendanceRegister from './AttendanceRegister';

const MembersRoutes = () => {
  return (
    <Routes>
      <Route index element={<MembersList />} />
      <Route path="detail/:id" element={<MemberDetail />} />
      <Route path="new" element={<MemberForm />} />
      <Route path="edit/:id" element={<MemberForm />} />
      <Route path="attendance" element={<AttendanceRegister />} />
      <Route path="*" element={<Navigate to="/members" replace />} />
    </Routes>
  );
};

export default MembersRoutes;
