import React from 'react';
import DashboardLayout from './DashboardLayout';
import SchedulePage from './SchedulePage';

const ScheduleDashboard = () => {
  return (
    <DashboardLayout userRole="admin">
      <SchedulePage />
    </DashboardLayout>
  );
};

export default ScheduleDashboard;