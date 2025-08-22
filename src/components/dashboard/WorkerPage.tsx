import React from 'react';
import DashboardLayout from './DashboardLayout';
import WorkerPageContent from './WorkerPageContent';

const WorkerPage = () => {
  return (
    <DashboardLayout userRole="admin">
      <WorkerPageContent />
    </DashboardLayout>
  );
};

export default WorkerPage;