import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import DashboardLayout from '../layouts/DashboardLayout';

import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import SchedulerPage from '../pages/SchedulerPage';
import BookingPage from '../pages/BookingPage';
import AppointmentListPage from '../pages/AppointmentListPage';
import DoctorScheduleManagePage from '../pages/DoctorScheduleManagePage';
import AuditLogsPage from '../pages/AuditLogsPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes inside DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/scheduler" element={<SchedulerPage />} />
          <Route path="/appointments" element={<AppointmentListPage />} />

          {/* Booking restricted to Admin and Receptionist */}
          <Route element={<RoleRoute allowedRoles={['admin', 'receptionist']} />}>
            <Route path="/book" element={<BookingPage />} />
          </Route>

          {/* Admin Exclusive Routes */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin/schedules" element={<DoctorScheduleManagePage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
