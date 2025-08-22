import React from 'react';
import DashboardLayout from './DashboardLayout';
import ClientsPage from './ClientsPage';

const ClientsDashboard = () => {
  return (
    <DashboardLayout userRole="admin">
      <ClientsPage />
    </DashboardLayout>
  );
};

export default ClientsDashboard;