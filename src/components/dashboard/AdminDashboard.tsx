import React from 'react';
import DashboardLayout from './DashboardLayout';
import AdminDashboardContent from './AdminDashboardContent';

const AdminDashboard = () => {
  return (
    <DashboardLayout userRole="admin">
      <AdminDashboardContent />
    </DashboardLayout>
  );
};

export default AdminDashboard;