import React from 'react';
import DashboardLayout from './DashboardLayout';
import WorkerDashboardContent from './WorkerDashboardContent';

const WorkerDashboard = () => {
  return (
    <DashboardLayout userRole="worker">
      <WorkerDashboardContent />
    </DashboardLayout>
  );
};

export default WorkerDashboard;