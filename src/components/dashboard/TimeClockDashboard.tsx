import React from 'react';
import DashboardLayout from './DashboardLayout';
import TimeClockPage from './TimeClockPage';

const TimeClockDashboard = () => {
  return (
    <DashboardLayout userRole="worker">
      <TimeClockPage />
    </DashboardLayout>
  );
};

export default TimeClockDashboard;