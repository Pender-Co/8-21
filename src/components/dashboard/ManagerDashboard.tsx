import React from 'react';
import DashboardLayout from './DashboardLayout';
import ManagerDashboardContent from './ManagerDashboardContent';

const ManagerDashboard = () => {
  return (
    <DashboardLayout userRole="manager">
      <ManagerDashboardContent />
    </DashboardLayout>
  );
};

export default ManagerDashboard;