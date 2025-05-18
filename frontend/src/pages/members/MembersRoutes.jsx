import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MembersList from './pages/members/MembersList';
import MemberDetail from './pages/members/MemberDetail';
import MemberForm from './pages/members/MemberForm';
import AttendanceRegister from './pages/members/AttendanceRegister';

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
