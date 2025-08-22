import React from 'react';
import DashboardLayout from './DashboardLayout';
import InvoicesPage from './InvoicesPage';

const InvoicesDashboard = () => {
  return (
    <DashboardLayout userRole="admin">
      <InvoicesPage />
    </DashboardLayout>
  );
};

export default InvoicesDashboard;