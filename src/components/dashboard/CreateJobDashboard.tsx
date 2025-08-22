import React from 'react';
import DashboardLayout from './DashboardLayout';
import CreateJobPage from './CreateJobPage';

const CreateJobDashboard = () => {
  return (
    <DashboardLayout userRole="admin">
      <CreateJobPage />
    </DashboardLayout>
  );
};

export default CreateJobDashboard;