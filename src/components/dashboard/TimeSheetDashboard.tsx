import React from 'react';
import DashboardLayout from './DashboardLayout';
import TimeSheetPage from './TimeSheetPage';

const TimeSheetDashboard = () => {
  return (
    <DashboardLayout userRole="admin">
      <TimeSheetPage />
    </DashboardLayout>
  );
};

export default TimeSheetDashboard;